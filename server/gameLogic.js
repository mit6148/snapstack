const User = require('./models/user');
const UserDetail = require('./models/user_detail');
const PCardRef = require('./models/pcardref');
const JCard = require('./models/jcard');
const {gamePhases, MAX_PLAYERS, TIME_LIMIT_MILLIS, TIME_LIMIT_FORGIVE_MILLIS,
    NUM_JCARDS, CARDS_TO_WIN, GAME_CODE_LENGTH, WAIT_TIME, saveStates} = require("../config");
const {uploadImagePromise, downloadImagePromise} = require("./storageTalk");
const {io} = require('./requirements');

class Player {
    constructor(user, details) {
        this._id = user._id;
        this.name = details.name;
        this.avatar = details.avatar;
        this.media = details.media;
        this.score = 0;
        this.hasPlayed = false;
        this.connected = true;
        this.pCardRef = null;
    }

    connect() {
        this.connected = true;
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
}

Player.from = async user => {
    await details = UserDetail.findOne({_id: user.detail_id}).exec();
    return new Player(user, details);
}


class Game {
    constructor(cardsToWin) {
        this.gamePhase = gamePhases.LOBBY;
        this.players = []; // first player is judge
        this.userToPlayerMap = {}; // still keeps removed players
        this.jCards = [];
        this.pCardRefPairArray = []; // array of pairs [pCardRef, flipped]
        this.pCardIndex = null;
        this.endTime = null;
        this.gameCode = Game.generateUnusedGameCode();
        this.cardsToWin = cardsToWin;
        this.jCardsSeen = [];
        this.pCardsMade = [];
        this.pausedForTooFewPlayers = false;
        this.isSkipping = false;
        this._lock = null;
        this.round = 0;
        Game.codeToGameMap[this.gameCode] = game;
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
            if(player in this.players) {
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
                this.players.push(await Player.from(user));
            } catch(err) {
                console.error("addPlayer had unknown error: " + err);
                throw "Sorry, we're having some trouble. Try again later";
            }
        }
    }

    async getVisiblePCards(userOrUndefined) {
        // TODO:
        /*
        In jchoose: return []
        In submit: user is provided, give back array with only zero/one elem: the user's submitted pcard, including it's saveState
        In judge: no user provided, 
        */
    }

    async start() {
        // TODO
    }

    async tryDestroyAssets() {
        // TODO. must remove from codetogamemap
    }

    async startNewRound() {
        // TODO
    }

    checkRoomFull() {
        if(this.players.length >= MAX_PLAYERS) {
            throw "Sorry, room full";
        }
    }

    getPlayer(user) {
        const player = this.userToPlayerMap[user._id];
        if(!player) {
            throw "tried to get player who isn't in game!";
        }
        return player.format();
    }

    getPlayers() {
        return this.players.map(player => player.format());
    }

    skipRound() {
        // TODO
    }

    disconnect(user) {
        // TODO
    }

    pausedAndShouldResume() {
        // TODO
    }

    resume() {
        // TODO
    }

    hasSomeoneWon() {
        // TODO
    }

    endGame() {
        // TODO
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

    canEndSubmitPhase(round) {
        return round === this.round && this.gamePhase === gamePhases.SUBMIT;
    }

    endSubmitPhase() {
        // TODO. must add on placeholders for all those who didn't submit
    }

    startSubmitPhase(user, jCardIndex) {
        // TODO. check is judge. doesn't need to handle starting timeout, but does need to check for too few players.
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
        return this.gameCode
    }
}

Game.codeToGameMap = {};

Game.gameWithCode(gameCode) {
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
            text += String.fromCharCode(65 + Math.floor(Math.random() * 26));
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
                pCardIndex, endTime, cardsToWin, isSkipping,  gameCode);
}

/**
creates a socket listener for event, checks that only newGame and joinGame are allowed to not come with a game already made.
Then, for everything but newGame and joinGame, it locks the game object while it runs so that all others on the same game
will await it. Finally it runs the handler and then unlocks.
*/
function createLockedListener(socket, event, gameGetter, func) {
    socket.on(event, async args => {
        const game = gameGetter();

        if(!game && !(event in ['newGame', 'joinGame'])) {
            // WARNING: special values used here!
            console.error("attempted to do game action " + event + " without a game");
            return;
        }

        try {
            if(game) {
                await game.withLock(async () => await func.apply(this, args));
            } else {
                await func.apply(this, args);
            }
        } catch(err) {
            console.error("socket triggered error: " + err);

            // WARNING: maybe we don't want this?
            socket.disconnect();
        }
    });
}

function tryStartNewRound(game) {
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

    createLockedListener(socket, 'startGame', game, async () => {
        await game.start();
        io.to(game.getGameCode()).emit('judgeAssign', game.getPlayer_ids(), game.getJCards());
    });

    createLockedListener(socket, 'jCardChoice', game, async jCardIndex => {
        const endTime = game.startSubmitPhase(user, jCardIndex);
        io.to(game.getGameCode()).emit('roundStart', jCardIndex, endTime);
        const round = game.getRound();
        setTimeout(async () => {
            try {
                await game.withLock(() => {
                    if(game.canEndSubmitPhase(round)) {
                        // the timer is actually relevant
                        await game.endSubmitPhase();
                        io.to(game.getGameCode()).emit('pCards', await game.getVisiblePCards());
                    }
                });
            } catch(err) {
                console.error("end submit phase timeout in jCardChoice had an error: " + err);
            }
        }, endTime - Date.now() + TIME_LIMIT_FORGIVE_MILLIS);
    });

    createLockedListener(socket, 'submitCard', game, async (image, text) => {
        const pCardRef = await generatePCardRef(user, image, text);
        game.submitCard(pCardRef);
        socket.emit('turnedIn', user._id, pCard._id);
        socket.to(game.getGameCode()).emit('turnedIn', user._id);
    });

    createLockedListener(socket, 'flip', game, async index => {
        game.flipCard(user, index);
        socket.to(game.getGameCode()).emit('flip', index);
    });

    createLockedListener(socket, 'flipAll', game, async () => {
        game.flipAll(user);
        socket.to(game.getGameCode()).emit('flipAll');
    });

    createLockedListener(socket, 'look', game, async index => {
        game.look(user, index);
        socket.to(game.getGameCode()).emit('look', index);
    });

    createLockedListener(socket, 'select', game, async index => {
        game.select(user, index);
        io.to(game.getGameCode()).emit('select', game.getCreators());
        setTimeout(async () => {
            try {
                await game.withLock(() => {
                    if(game.hasSomeoneWon()) {
                        game.endGame();
                        io.to(game.getGameCode()).emit('gameOver');
                    } else {
                        tryStartNewRound(game);
                    }
                });
            } catch(err) {
                console.error("post-select-phase timeout in select had an error: " + err);
            }
        }, WAIT_TIME);
    });

    createLockedListener(socket, 'disconnect', game, async () => {
        game.disconnect(user);
        io.to(game.getGameCode()).emit('disconnected', user._id);
        await game.tryDestroyAssets();
    });

    createLockedListener(socket, 'skip', game, async () => {
        game.skipRound();
        io.to(game.getGameCode()).emit('skipped');
    });
}


module.exports = {onConnection};