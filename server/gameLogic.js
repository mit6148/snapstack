const User = require('./models/user');
const UserDetail = require('./models/user_detail');
const PCardRef = require('./models/pcardref');
const JCard = require('./models/jcard');
const {gamePhases, endSubmitPhaseStatus, MAX_PLAYERS, TIME_LIMIT_MILLIS, TIME_LIMIT_FORGIVE_MILLIS,
    NUM_JCARDS, CARDS_TO_WIN, GAME_CODE_LENGTH, WAIT_TIME, saveStates, DEVELOPER_MODE, MIN_PLAYERS, LAZY_B_ID} = require("../config");
const {uploadImagePromise, downloadImagePromise, deleteImagePromise} = require("./storageTalk");
const {io} = require('./requirements');
const db = require('./db');

class Player {
    constructor(user, detail) {
        this._id = user._id;
        this.name = (detail.firstName && detail.lastName) ? detail.firstName + " " + detail.lastName[0]
                                                            : (detail.firstName || detail.lastName || "No Name");
        this.avatar = detail.avatar;
        this.media = detail.media;
        this.detail_id = detail._id
        this.score = 0;
        this.connected = true;
        this.pCardRef = null;
    }

// MUTATORS

    connect() {
        this.connected = true;
    }

    disconnect() {
        this.connected = false;
    }

    resetRoundState() {
        this.connected = true;
        this.pCardRef = null;
    }

    incrementScore() {
        this.score++;
    }

    play(pCardRef) {
        this.pCardRef = pCardRef;
    }

// OBSERVERS (note that fields are expected to be accessed directly)

    format() {
        return {_id: this._id, name: this.name, avatar: this.avatar, media: this.media,
                score: this.score, hasPlayed: this.pCardRef !== null, connected: this.connected};
    }

    async checkSaved(pCardIds) {
        const savedIdMap = await UserDetail.findOne({_id: this.detail_id}).select("saved_pairs.pcard").exec()
            .then(detail => detail.saved_pairs.map(pair => {
                const out = {};
                out[pair.pcard] = true;
                return out;
            }));
        return pCardIds.map(pCard => pCard in savedIdMap);
    }
}

Player.from = async user => {
    const detail = await UserDetail.findOne({_id: user.detail_id}).exec();
    return new Player(user, detail);
}




function shuffle(array) {
    for(let i = array.length; i >= 2;) {
        const r = Math.floor(Math.random() * i);
        i--;
        const t = array[i];
        array[i] = array[r];
        array[r] = t;
    }
}


class Game {
    constructor(cardsToWin, _devCode) { // _devCode should not be used except in developer mode
        _devCode = DEVELOPER_MODE ? _devCode : undefined;

        if(typeof(cardsToWin) !== 'number') {
            throw "You have to input a NUMBER of cards to win";
        }
        this.gamePhase = gamePhases.LOBBY;
        this.players = []; // first player is judge
        this.userToPlayerMap = {}; // still keeps removed players
        this.jCards = [];
        this.pCardRefPairs = []; // array of pairs [pCardRef, faceup]
        this.pCardIndex = null;
        this.endTime = null;
        this.gameCode = _devCode || Game.generateUnusedGameCode();
        this.cardsToWin = cardsToWin;
        this.jCardsSeen = [];
        this.pCardsMade = [];
        this.pausedForTooFewPlayers = true;
        this.isSkipping = false;
        this._lock = null;
        this.round = 0;
        Game.codeToGameMap[this.gameCode] = this;
    }

    async withLock(asyncFunc) {
        const marker = {}; // unique object representing no error
        let errSave = marker;
        let ans;
        await this.lock();
        try {
            ans = await asyncFunc();
        } catch(err) {
            errSave = err;
        }
        this.unlock();
        if(errSave !== marker) {
            throw errSave;
        } else {
            return ans;
        }
    }

    lock() {
        if(this._lock === null) {
            this._lock = [];
            return null;
        } else {
            return new Promise((resolve, reject) =>  {
                this._lock.push(resolve);
            });
        }
    }

    unlock() {
        if(this._lock.length === 0) {
            this._lock = null;
        } else {
            const next = this._lock.shift(); // WARNING: O(n) when could be O(1) with linked list. can fix later
            next(null);
        }
    }

    async addPlayer(user) { // should throw problem strings fit for clients, not backend people
        if(user._id in this.userToPlayerMap) {
            // rejoining
            const player = this.userToPlayerMap[user._id];
            if(this.players.includes(player)) {
                // still in game, hasn't ended round
                if(player.connected) {
                    // trying to join the game again while other socket is still connected!
                    console.log("new user already connected");
                    throw "Sorry, you're already in this game. Check your other windows!";
                } else {
                    console.log("new user rejoined within the same round");
                    player.connect(); // just reconnect, nothing really changes
                }
            } else {
                // add player to end of player list
                console.log("new user rejoined in different round");
                this.checkRoomFull();
                player.resetRoundState();
                this.players.push(player);
            }
        } else {
            // new!
            console.log("new user has never been in game");
            this.checkRoomFull();
            try {
                const player = await Player.from(user);
                this.players.push(player);
                this.userToPlayerMap[user._id] = player;
            } catch(err) {
                console.error("addPlayer had unknown error: " + err + "\n" + err.stack);
                throw "Sorry, we're having some trouble. Try again later";
            }
        }

        this.pausedForTooFewPlayers = this.players.length < MIN_PLAYERS;
    }

    async getVisiblePCards(userOrUndefined) {
        /*
        in lobby: return []
        In jchoose: return []
        In submit: user is provided, give back array with only zero/one elem: the user's submitted pcard, including it's saveState
        In judge: no user provided, give all cards without creator OR user is provided, so also give them saveStates
        in round over: no user provided, give all cards, with creator OR user is provided, so also give them saveStates
        in game over: no user provided, give all cards, with creator OR user is provided, so also give them saveStates
        */
        let pCardRefPairs;
        let show_creator = false;
        const player = userOrUndefined ? this.userToPlayerMap[userOrUndefined._id] : undefined;
        switch(this.gamePhase) {
            case gamePhases.LOBBY: case gamePhases.JCHOOSE:
                return [];
            case gamePhases.SUBMIT:
                const pCardRef = player.pCardRef;
                if(!pCardRef) {
                    return [];
                } else {
                    pCardRefPairs = [[pCardRef, true]];
                    break;
                }
            case gamePhases.JUDGE: case gamePhases.ROUND_OVER: case gamePhases.GAME_OVER:
                show_creator = this.gamePhase != gamePhases.JUDGE;
                pCardRefPairs = this.pCardRefPairs;
        }

        const imagesPromise = Promise.all(pCardRefPairs.map(pair => downloadImagePromise(pair[0].image_ref)));
        const pCardSaved = await (player ? player.checkSaved(pCardRefPairs.map(pair => pair[0]._id)) : {});
        const images = await imagesPromise;

        const output = [];

        for(let i = 0; i < pCardRefPairs.length; i++) {
            output.push({
                _id: pCardRefPairs[i][0]._id,
                image: images[i],
                text: pCardRefPairs[i][0].text,
                faceup: pCardRefPairs[i][1],
                creator_id: show_creator ? pCardRefPairs[i][0].creator_id : undefined,
                saveState: pCardSaved[i] || false, // make sure undefined turns into false
            });
        }
        return output;
    }

    async start() {
        if(this.gamePhase !== gamePhases.LOBBY || this.players.length < MIN_PLAYERS) {
            throw "Cannot start game in this state!";
        }
        // randomize player order, then start round
        shuffle(this.players);

        await this.startNewRound();
    }

    async startNewRound() {
        this.gamePhase = gamePhases.JCHOOSE;
        this.players.push(this.players.shift()); // rotate the player order
        this.players = this.players.filter(player => player.connected); // do this after rotating so that if judge disconnected, still good
        
        if(DEVELOPER_MODE && this.players.length >= 2 && this.players[0]._id == LAZY_B_ID) { // make sure lazy b isn't judge
            const temp = this.players[0];
            this.players[0] = this.players[1];
            this.players[1] = temp;
        }
        for(let player of this.players) {
            player.resetRoundState();
        }
        const jCards = await JCard.aggregate([
            {$match: {_id: {$not: {$in: this.jCardsSeen}}}},
            {$sample: {size: NUM_JCARDS}}, // WARNING: try to prevent concurrent modification error & memory excess (100MB)
            ]).exec();

        await this.generateJCards();
        this.pCardRefPairs = [];
        this.pCardIndex = null;
        this.endTime = null;
        this.pausedForTooFewPlayers = this.players.length < MIN_PLAYERS;
        this.isSkipping = false;
        this.round++;
    }

    async trySave(user, pCardId) { // good if there is 1 jCard and the given pCard is currently in play, and updated the database with ref
        const index = this.pCardRefPairs.map(pair => pair[0]._id).indexOf(pCardId);

        if(this.jCards.length === 1 && index >= 0) {
            const session = await db.startSession();
            session.startTransaction();
            const detailUpdatePromise = UserDetail.updateOne({_id: user.detail_id},
                                            {$push: {saved_pairs: {jcard: this.jCards[0]._id, pcard: pCardId}}}).session(session).exec();
            await PCardRef.updateOne({_id: pCardId}, {$inc: {ref_count: 1}}).session(session);
            await detailUpdatePromise;
            await session.commitTransaction();
        } else {
            throw new Error("invalid save request, or maybe saved right as the round changed");
        }
    }

    async generateJCards() {
        const newJCards = await JCard.aggregate([
            {$match: {_id: {$not: {$in: this.jCardsSeen}}}},
            {$sample: {size: NUM_JCARDS}}, // WARNING: try to prevent concurrent modification error & memory excess (100MB)
            ]).exec();
        if(newJCards.length !== NUM_JCARDS) {
            // fluke $sample result or out of jcards! allow a second round through jcards
            this.jCardsSeen = [];
            await this.generateJCards();
        } else {
            this.jCards = newJCards;
            this.jCardsSeen = this.jCardsSeen.concat(newJCards.map(jCard => jCard._in));
        }
    }

    async tryDestroyAssets() { // only destroy if there are no players CONNECTED, not just in play. otherwise, return silently
        if(this.players.filter(player => player.connected).length == 0) {
            delete Game.codeToGameMap[this.gameCode];

            await dereferencePCards(this.pCardsMade);
        }
    }

    checkRoomFull() {
        if(this.players.length >= MAX_PLAYERS) {
            throw "Sorry, room full";
        }
    }

    getPlayer(user) {
        const player = this.userToPlayerMap[user._id];
        if(!player) {
            throw "tried to get player who isn't in game! should never happen: " + user._id;
        }
        return player.format();
    }

    getPlayers() {
        return this.players.map(player => player.format());
    }

    skipRound(userTriggered) {
        if(DEVELOPER_MODE ||  !userTriggered || (userTriggered && !this.pausedForTooFewPlayers &&
            ![gamePhases.LOBBY, gamePhases.GAME_OVER, gamePhases.ROUND_OVER].includes(this.gamePhase) && !this.players[0].connected)) {
            this.isSkipping = true;
        } else {
            throw new Error("illegal skip triggered! userTriggered: " + userTriggered);
        }
    }

    disconnect(user) {
        this.userToPlayerMap[user._id].disconnect();
        if(this.gamePhase === gamePhases.LOBBY) {
            this.players = this.players.filter(player => player._id !== user._id); // remove player from list
        }
    }

    hasSomeoneWon() {
        for(let player of this.players) {
            if(player.score >= this.cardsToWin) {
                return true;
            }
        }
        return false;
    }

    endGame() {
        if(this.hasSomeoneWon()) {
            this.game
        } else {
            throw new Error("end game without winning!");
        }
    }

    getCreators() {
        return this.pCardRefPairs.map(pair => pair[0].creator_id);
    }

    isJudge(user) {
        return this.players.length > 0 && user._id === this.players[0]._id;
    }

    isValidPCardIndex(index) {
        return 0 <= index && index < this.pCardRefPairs.length;
    }

    select(user, index) {
        if(!this.isJudge(user) || !this.isValidPCardIndex(index) || this.gamePhase !== gamePhases.JUDGE
                            || this.pausedForTooFewPlayers || this.isSkipping) {
            throw new Error("illegal selection attempt by " + user._id + " for index " + index);
        }
        // also need to check that all cards are flipped
        if(!this.pCardRefPairs.every(pair => pair[1])) {
            throw new Error("user " + user._id + " attempted to select card without having flipped all others");
        }

        this.pCardIndex = index;
        this.userToPlayerMap[this.pCardRefPairs[index][0].creator_id].incrementScore();
        this.gamePhase = gamePhases.ROUND_OVER;
    }

    look(user, index) {
        if(!this.isJudge(user) || !this.isValidPCardIndex(index) || this.gamePhase !== gamePhases.JUDGE
                            || this.pausedForTooFewPlayers || this.isSkipping) {
            throw new Error("illegal look attempt by " + user._id + " for index " + index);
        }

        this.pCardIndex = index;
        this.pCardRefPairs[index][1] = true;
    }

    flipAll(user) {
        if(!this.isJudge(user) || this.gamePhase !== gamePhases.JUDGE
                            || this.pausedForTooFewPlayers || this.isSkipping) {
            throw new Error("illegal flipAll attempt by " + user._id + " for index " + index);
        }

        for(let pair of this.pCardRefPairs) {
            pair[1] = true;
        }
    }

    flipCard(user, index) {
        if(!this.isJudge(user) || !this.isValidPCardIndex(index) || this.gamePhase !== gamePhases.JUDGE
                            || this.pausedForTooFewPlayers || this.isSkipping) {
            throw new Error("illegal flip attempt by " + user._id + " for index " + index);
        }

        if(this.pCardRefPairs[index][1]) {
            throw new Error("card already flipped!");
        }
        this.pCardIndex = index;
        this.pCardRefPairs[index][1] = true;
    }

    submitCard(pCardRef) {
        const player = this.userToPlayerMap[pCardRef.creator_id];
        this.pCardsMade.push(pCardRef._id); // must add to list so it can be dereferenced later

        if(player.pCardRef) {
            throw new Error("user " + player._id + " tried to submit a card twice!");
        } else if(player === this.players[0]) {
            // player is the judge!
            throw new Error("user " + player._id + " tried to submit a card as the judge!");
        } else {
            this.pCardRefPairs.push([pCardRef, false]);
            player.play(pCardRef);
        }
    }

    getEndSubmitPhaseStatus(round) {
        if(round === this.round && this.gamePhase === gamePhases.SUBMIT) {
            if(this.pCardRefPairs.length === 0) {
                return endSubmitPhaseStatus.SKIP_INSTEAD;
            } else {
                return endSubmitPhaseStatus.CAN_END;
            }
        } else {
            return endSubmitPhaseStatus.ALREADY_ENDED;
        }
    }

    endSubmitPhase() {
        this.gamePhase = gamePhases.JUDGE;
        this.endTime = null;
        shuffle(this.pCardRefPairs);
    }

    startSubmitPhase(user, jCardIndex) {
        if(!this.isJudge(user) || jCardIndex < 0 || jCardIndex >= this.jCards.length || this.gamePhase !== gamePhases.JCHOOSE ||
                                this.pausedForTooFewPlayers || this.isSkipping) {
            throw new Error("can't start submit phase (jcard choice) with user: " + user._id + " index: " + jCardIndex);
        } else {
            this.gamePhase = gamePhases.SUBMIT;
            this.jCards = [this.jCards[jCardIndex]];
            this.endTime = Date.now() + TIME_LIMIT_MILLIS;
        }
    }

    allCardsSubmitted() {
        return this.players.length - 1 === this.pCardRefPairs.length; // everyone but judge submitted
    }

    getRound() {
        return this.round;
    }

    getPlayer_ids() {
        return this.players.map(player => player._id);
    }

    getGamePhase() {
        return this.gamePhase;
    }

    getJCards() {
        return this.jCards.map(jCard => jCard.text);
    }

    getPCardIndex() {
        return this.pCardIndex;
    }

    getEndTime() {
        return this.endTime;
    }

    getIsSkipping() {
        return this.isSkipping;
    }

    getGameCode() {
        return this.gameCode;
    }

    getCardsToWin() {
        return this.cardsToWin;
    }
}

Game.codeToGameMap = {};

Game.gameWithCode = gameCode => {
    gameCode = gameCode.toUpperCase();
    if(!gameCode.match("^[A-Z]{3}$")) {
        throw "Game code must consist only of letters";
    }
    const game = Game.codeToGameMap[gameCode];
    if(game === undefined) {
        throw "This is not the game code you are looking for";
    } else {
        return game;
    }
}

Game.generateUnusedGameCode = () => {
    while(true) {
        let code = "";
        for(let i = 0; i < GAME_CODE_LENGTH; i++) {
            code += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
        if(!(code in Game.codeToGameMap)) {
            return code;
        }
    }
};


async function generatePCardRef(user, image, text) {
    if(typeof(image) !== 'string' || typeof(text) !== 'string') {
        throw new Error("cannot handle image of type " + typeof(image) + "/text of type " + typeof(text));
    }
    const image_ref = await uploadImagePromise(image);
    const pCardRef = new PCardRef({
        text: text,
        image_ref: image_ref,
        creator_id: user._id,
        ref_count: 0,
        server: process.env.SERVER_NAME || "unknown", // server name 'unknown' in case of messed up env
    });
    await pCardRef.save();
    return pCardRef;
}

async function dereferencePCards(pCardIds) {
    const pCardRefs = await PCardRef.find({_id: {$in: pCardIds}, ref_count: 0}).exec();
    const successes = await Promise.all(pCardRefs.map(pCardRef => deleteImagePromise(pCardRef.image_ref)));
    const deletedIds = [];
    for(let i = 0; i < pCardIds.length; i++) {
        if(successes[i]) {
            deletedIds.push(pCardIds[i]);
        }
    }
    await PCardRef.deleteMany({_id: {$in: deletedIds}}).exec(); // WARNING: could make more efficient
    await PCardRef.updateMany({_id: {$in: pCardIds}}, {$set: {server: ""}}).exec(); // empty server string = not in play
}


async function emitGameState(socket, user, game) {
    const [players, gamePhase, jCards, visiblePCards, pCardIndex, endTime, isSkipping, gameCode] = await Promise.all(
                [game.getPlayers(), game.getGamePhase(), game.getJCards(), game.getVisiblePCards(user),
                game.getPCardIndex(), game.getEndTime(), game.getIsSkipping(), game.getGameCode()]);
    socket.emit('gameState', players, gamePhase, jCards, visiblePCards,
                pCardIndex, endTime, game.getCardsToWin(), isSkipping,  gameCode);
}

/**
creates a socket listener for event, checks that only newGame and joinGame are allowed to not come with a game already made.
Then, for everything but newGame and joinGame, it locks the game object while it runs so that all others on the same game
will await it. Finally it runs the handler and then unlocks.
*/
function createLockedListener(socket, event, gameGetter, func) {
    socket.on(event, async function() {
        console.log("backend handling: " + event)
        const game = gameGetter ? gameGetter() : null;

        if(!game && !(['newGame', 'joinGame'].includes(event))) {
            // WARNING: special values used here!
            console.error("attempted to do game action " + event + " without a game");
            return;
        }

        try {
            if(game) {
                await game.withLock(async () => await func.apply(this, arguments));
            } else {
                await func.apply(this, arguments);
            }
        } catch(err) {
            console.error("socket triggered error while handling " + event + ": " + err + (err.stack ? ("\n" + err.stack) : ""));
        }
    });
}

async function handleSkipRound(game, userTriggered) {
    game.skipRound(userTriggered);
    console.log('about to wait to skip round');
    io.to(game.getGameCode()).emit('skipped');
    setTimeout(async () => {
        try {
            console.log('about to actually skip round');
            await game.withLock(async () => tryStartNewRound(game));
            console.log('success');
        } catch(err) {
            console.error("post-skip-phase timeout in skip had an error: " + err);
        }
    }, WAIT_TIME);
}

async function tryStartNewRound(game) {
    await game.startNewRound();
    io.to(game.getGameCode()).emit('judgeAssign', game.getPlayer_ids(), game.getJCards());
}

function endSubmitPhaseDelayedSendout(game, delay) {
    game.endSubmitPhase();
    setTimeout(async () => {
        try {
            await game.withLock(async () => {
                const pCards = await game.getVisiblePCards();
                io.to(game.getGameCode()).emit('pCards', pCards);
                console.log("sent pCards");
            });
        } catch(err) {
            throw new Error("error in end submit phase delayed sendout: " + err + "\n" + err.stack);
        }
    }, delay);
}

async function onConnection(socket) {
    const user = socket.request.user;
    let game;
    if(!user.logged_in) {
        console.log('not logged in!');
        socket.disconnect(); // close socket fully
        return;
    }
    console.log("user: " + user._id + " joined");

    const gameGetter = () => game;

    createLockedListener(socket, 'newGame', null, async cardsToWin => {
        if(game) {
            throw "tried to create a game on the same socket as an existing one!";
        }
        game = new Game(cardsToWin);
        try {
            await game.addPlayer(user);
        } catch(reason) {
            game = undefined; // make sure doesn't start doing game events as if were part of game
            console.log("rejected connection: " + reason)
            return socket.emit('rejectConnection', reason);
        }
        console.log("game code: " + game.getGameCode());
        socket.join(game.getGameCode());
        emitGameState(socket, user, game);
    });

    createLockedListener(socket, 'joinGame', null, async gameCode => {
        if(game) {
            throw "tried to join game on the same socket as an existing one!";
        }
        try {
            game = Game.gameWithCode(gameCode);
            await game.addPlayer(user);
        } catch(reason) {
            game = undefined; // make sure doesn't start doing game events as if were part of game
            console.log("rejected connection: " + reason)
            return socket.emit('rejectConnection', reason);
        }
        socket.join(game.getGameCode());
        emitGameState(socket, user, game);
        socket.to(game.getGameCode()).emit('nuj', await game.getPlayer(user));
        console.log("nuj sent");
    });

    createLockedListener(socket, 'startGame', gameGetter, async () => {
        await game.start();
        io.to(game.getGameCode()).emit('judgeAssign', game.getPlayer_ids(), game.getJCards());
    });

    createLockedListener(socket, 'jCardChoice', gameGetter, async jCardIndex => {
        game.startSubmitPhase(user, jCardIndex);
        const endTime = game.getEndTime();
        io.to(game.getGameCode()).emit('roundStart', jCardIndex, endTime);
        const round = game.getRound();
        setTimeout(async () => {
            try {
                console.log("about to handle timeout event");
                await game.withLock(async () => {
                    switch(game.getEndSubmitPhaseStatus(round)) {
                        case endSubmitPhaseStatus.CAN_END:
                            // submit phase ended in a timeout
                            console.log("ending submit phase");
                            await endSubmitPhaseDelayedSendout(game, WAIT_TIME - TIME_LIMIT_FORGIVE_MILLIS); // same total delay as usual
                            break;
                        case endSubmitPhaseStatus.SKIP_INSTEAD:
                            // no one submitted, so trigger skip event not caused by any particular user
                            console.log('skipping due to no submission');
                            await handleSkipRound(game, false);
                            break;
                        case endSubmitPhaseStatus.ALREADY_ENDED:
                            // timer is irrelevant since submit phase already ended, so do nothing
                            console.log("old timer did nothing");
                    }
                });
            } catch(err) {
                console.error("end submit phase timeout in jCardChoice had an error: " + err);
            }
        }, endTime - Date.now() + TIME_LIMIT_FORGIVE_MILLIS);
    });

    createLockedListener(socket, 'submitCard', gameGetter, async (image, text) => {
        const pCardRef = await generatePCardRef(user, image, text);
        game.submitCard(pCardRef);
        socket.emit('turnedIn', user._id, pCardRef._id);
        socket.to(game.getGameCode()).emit('turnedIn', user._id);

        if(game.allCardsSubmitted()) {
            await endSubmitPhaseDelayedSendout(game, WAIT_TIME);
        }
    });

    createLockedListener(socket, 'flip', gameGetter, async index => {
        game.flipCard(user, index);
        socket.to(game.getGameCode()).emit('flip', index);
        socket.to(game.getGameCode()).emit('look', index);
    });

    createLockedListener(socket, 'flipAll', gameGetter, async () => {
        game.flipAll(user);
        socket.to(game.getGameCode()).emit('flipAll');
    });

    createLockedListener(socket, 'look', gameGetter, async index => {
        game.look(user, index);
        socket.to(game.getGameCode()).emit('look', index);
    });

    createLockedListener(socket, 'select', gameGetter, async index => {
        game.select(user, index);
        io.to(game.getGameCode()).emit('select', index, game.getCreators());
        setTimeout(async () => {
            try {
                console.log("about to move from round over to new round");
                await game.withLock( async () => {
                    if(game.hasSomeoneWon()) {
                        console.log("game over!");
                        await game.endGame();
                        io.to(game.getGameCode()).emit('gameOver');
                    } else {
                        console.log("trying to start a new round");
                        await tryStartNewRound(game);
                    }
                });
                console.log("finished starting new round/game over-ifying");
            } catch(err) {
                console.error("post-select-phase timeout in select had an error: " + err);
            }
        }, WAIT_TIME);
    });

    createLockedListener(socket, 'disconnect', gameGetter, async () => {
        game.disconnect(user);
        io.to(game.getGameCode()).emit('disconnected', user._id);
        console.log("sent: disconnected");
        await game.tryDestroyAssets();
        game = undefined;
    });

    createLockedListener(socket, 'skip', gameGetter, async () => await handleSkipRound(game, true));

    createLockedListener(socket, 'saveCard', gameGetter, async (pCardId) => {
        try {
            await game.trySave(user, pCardId);
            socket.emit('cardSaved', pCardId);
        } catch(err) {
            console.error("save card had error: " + error + "\n" + error.stack);
            socket.emit('cardSaveFailed', pCardId);
        }
    });
}



if(DEVELOPER_MODE) {
    User.findOne({_id: LAZY_B_ID}).exec().then(async user => {
        game = new Game(3, "XYZ");
        await game.addPlayer(user);
    });
}


module.exports = {onConnection};