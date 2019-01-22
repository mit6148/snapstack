const User = require('./models/user');
const UserDetail = require('./models/user_detail');
const PCardRef = require('./models/pcardref');
const JCard = require('./models/jcard');
const {gamePhases, endSubmitPhaseStatus, MAX_PLAYERS, TIME_LIMIT_MILLIS, TIME_LIMIT_FORGIVE_MILLIS,
    NUM_JCARDS, CARDS_TO_WIN, GAME_CODE_LENGTH, WAIT_TIME, saveStates, DEVELOPER_MODE} = require("../config");
const {uploadImagePromise, downloadImagePromise} = require("./storageTalk");
const {io} = require('./requirements');

class Player {
    constructor(user, detail) {
        this._id = user._id;
        this.name = detail.name;
        this.avatar = detail.avatar;
        this.media = detail.media;
        this.detail_id = detail._id
        this.score = 0;
        this.hasPlayed = false;
        this.connected = true;
        this.pCardRef = null;
    }

    connect() {
        this.connected = true;
    }

    disconnect() {
        this.connected = false;
    }

    resetRoundState() { // after having been removed from a round, so round state is reset
        this.hasPlayed = false;
        this.connected = true;
        this.pCardRef = null;
    }

    format() {
        return {_id: this._id, name: this.name, avatar: this.avatar, media: this.media,
                score: this.score, hasPlayed: this.hasPlayed, connected: this.connected};
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
        this.pCardRefPairs = []; // array of pairs [pCardRef, flipped]
        this.pCardIndex = null;
        this.endTime = null;
        this.gameCode = _devCode || Game.generateUnusedGameCode();
        this.cardsToWin = cardsToWin;
        this.jCardsSeen = [];
        this.pCardsMade = [];
        this.pausedForTooFewPlayers = false;
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
            return new Promise(function(resolve, reject) {
                this._lock.push(resolve);
            });
        }
    }

    unlock() {
        if(this._lock.length === 0) {
            this._lock = null;
        } else {
            const next = this._lock[0];
            delete this._lock[0]; // WARNING: O(n) when could be O(1) with linked list. can fix later
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
                    throw "Sorry, you're already in this game. Check your other windows!";
                } else {
                    player.connect(); // just reconnect, nothing really changes
                }
            } else {
                // add player to end of player list
                this.checkRoomFull();
                player.resetRoundState();
                this.players.push(player);
            }
        } else {
            // new!
            this.checkRoomFull();
            try {
                const player = await Player.from(user);
                this.players.push(player);
                this.userToPlayerMap[user._id] = player;
            } catch(err) {
                console.error("addPlayer had unknown error: " + err);
                throw "Sorry, we're having some trouble. Try again later";
            }
        }
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
        const player = userOrUndefined ? this.getPlayer(userOrUndefined) : undefined;
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
        for(let i = this.players.length; i >= 2;) {
            const r = Math.floor(Math.random() * i);
            i--;
            const t = this.players[i];
            this.players[i] = this.players[r];
            this.players[r] = t;
        }
        await this.startNewRound();
    }

    async startNewRound() {
        // TODO. must handle pausing for too few players, and resetting all states
        this.gamePhase = gamePhases.JCHOOSE;
        this.players = this.players.filter(player => player.connected);
        for(let player of this.players) {
            player.resetRoundState();
        }
        this.jCards = [];
        this.pCardRefPairs = [];
        this.pCardIndex = null;
        this.endTime = null;
        this.pausedForTooFewPlayers = this.players.length < MIN_PLAYERS;
        this.isSkipping = false;
        this.round++;
    }

    async tryDestroyAssets() {
        // TODO. must remove from codetogamemap. only run if there are no players
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
        if(!userTriggered || (userTriggered && !this.pausedForTooFewPlayers &&
            ![gamePhases.LOBBY, gamePhases.GAME_OVER, gamePhases.ROUND_OVER].includes(this.gamePhase) && !this.players[0].connected)) {
            this.isSkipping = true;
        } else {
            throw new Error("illegal skip triggered! userTriggered: " + userTriggered);
        }
    }

    disconnect(user) {
        this.getPlayer(user).disconnect();
    }

    pausedAndShouldResume() {
        return this.pausedForTooFewPlayers && !this.getTooFewPlayers();
    }

    resume() {
        if(this.pausedAndShouldResume()) {
            this.pausedForTooFewPlayers = false;
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
        }
    }

    getCreators() {
        // TODO
    }

    select(user, index) {
        // TODO
    }

    look(user, index) {
        // TODO
    }

    flipAll(user) {
        // TODO
    }

    flipCard(user, index) {
        // TODO. must check is judge and index in bounds and not flipped
    }

    submitCard(pCardRef) {
        // TODO
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
        // TODO
    }

    startSubmitPhase(user, jCardIndex) {
        // TODO. check is judge. doesn't need to handle starting timeout, but does need to check for too few players. check in bounds
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
        return this.jCards;
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

            // WARNING: maybe we don't want this?
            socket.disconnect();
        }
    });
}

async function handleSkipRound(userTriggered) {
    game.skipRound(userTriggered);
    io.to(game.getGameCode()).emit('skipped');
    setTimeout(async () => {
        try {
            await game.withLock(tryStartNewRound);
        } catch(err) {
            console.error("post-skip-phase timeout in skip had an error: " + err);
        }
    }, WAIT_TIME);
}

async function tryStartNewRound(game) {
    await game.startNewRound();
    if(!game.getTooFewPlayers()) {
        // can start next round
        io.to(game.getGameCode()).emit('judgeAssign', game.getPlayer_ids(), game.getJCards());
    }
    // otherwise, just wait until a new player comes along
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
            return socket.emit('rejectConnection', reason);
        }
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
            console.log("rejected connection: " + reason)
            return socket.emit('rejectConnection', reason);
        }
        socket.join(gameCode);
        emitGameState(socket, user, game);
        socket.to(gameCode).emit('nuj', await game.getPlayer(user));

        // check to unpause
        if(game.pausedAndShouldResume()) {
            game.resume();
            io.to(game.getGameCode()).emit('judgeAssign', game.getPlayer_ids(), game.getJCards());
        }
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
                await game.withLock(async () => {
                    switch(game.getEndSubmitPhaseStatus(round)) {
                        case endSubmitPhaseStatus.CAN_END:
                            // submit phase ended in a timeout
                            await game.endSubmitPhase();
                            io.to(game.getGameCode()).emit('pCards', await game.getVisiblePCards());
                            break;
                        case endSubmitPhaseStatus.SKIP_INSTEAD:
                            // no one submitted, so trigger skip event not caused by any particular user
                            await handleSkipRound(false);
                            break;
                        case endSubmitPhaseStatus.ALREADY_ENDED:
                            // timer is irrelevant since submit phase already ended
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
        socket.emit('turnedIn', user._id, pCard._id);
        socket.to(game.getGameCode()).emit('turnedIn', user._id);
    });

    createLockedListener(socket, 'flip', gameGetter, async index => {
        game.flipCard(user, index);
        socket.to(game.getGameCode()).emit('flip', index);
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
        io.to(game.getGameCode()).emit('select', game.getCreators());
        setTimeout(async () => {
            try {
                await game.withLock( async () => {
                    if(game.hasSomeoneWon()) {
                        await game.endGame();
                        io.to(game.getGameCode()).emit('gameOver');
                    } else {
                        await tryStartNewRound(game);
                    }
                });
            } catch(err) {
                console.error("post-select-phase timeout in select had an error: " + err);
            }
        }, WAIT_TIME);
    });

    createLockedListener(socket, 'disconnect', gameGetter, async () => {
        game.disconnect(user);
        io.to(game.getGameCode()).emit('disconnected', user._id);
        await game.tryDestroyAssets();
    });

    createLockedListener(socket, 'skip', gameGetter, async () => await handleSkipRound(true));
}



if(DEVELOPER_MODE) {
    User.findOne({_id: "5c46acb51c9d440000ea85a3"}).exec().then(async user => {
        game = new Game(3, "XYZ");
        await game.addPlayer(user);
    });
}


module.exports = {onConnection};