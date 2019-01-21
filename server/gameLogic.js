const User = require('./models/user');
const UserDetail = require('./models/user_detail');
const PCard = require('./models/pcard');
const JCard = require('./models/jcard');
const {gameStates, MAX_PLAYERS, TIME_LIMIT_MILLIS, TIME_LIMIT_FORGIVE_MILLIS, NUM_JCARDS, GAME_CODE_LENGTH} = require("../config");
const {uploadImagePromise, downloadImagePromise} = require("./storageTalk");
const {io} = require('./requirements');



class Game {
    constructor(cardsToWin) {
        this.players = []; // first player is judge
        this.formerPlayerMap = {};
        this.userToPlayerMap = {};
        this.jCards = null;
        this.pCardRefArray = null;
        this.pCardIndex = null;
        this.endTime = null;
        this.gameCode = Game.generateUnusedGameCode();
        this.cardsToWin = cardsToWin;
        this.jCardsSeen = [];
        this.isSkipping;
        this._lock = null;
        this.round = 0;
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

    async addPlayer(user) {
        // TODO. must also handle RE-ADDING players
    }

    async getPlayer(user) {
        // TODO
    }

    async getPlayers() {
        // TODO
    }

    async getVisiblePCards() {
        // TODO
    }

    async start() {
        // TODO
    }

    canEndSubmitPhase(round) {
        return round === this.round && this.gameState === gameStates.SUBMIT;
    }

    endSubmitPhase() {
        // TODO. must add on placeholders for all those who didn't submit
    }

    startRound(user, jCardIndex) {
        // TODO. doesn't need to handle starting timeout
    }

    getRound() {
        return this.round;
    }

    getPlayer_ids() {
        return this.players.map(player => player._id);
    }

    getGameState() {
        return this.gameState;
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

Game.create = async (cardsToWin, user) => {
    try {
        const game = new Game(cardsToWin);
        await game.addPlayer(user);
        Game.codeToGameMap[this.gameCode] = game;
        return game;
    } catch (err) {
        console.error('create game had an error: ' + err);
        throw "Sorry, we're having a problem on the back end :(";
    }
}

Game.join = async (gameCode, user) => {
    gameCode = gameCode.toUpperCase();
    if(!gameCode.match(/^[A-Z]{3}$/)) {
        throw "Game codes must be " + GAME_CODE_LENGTH + " letters long";
    }
    let game;
    try {
        game = Game.codeToGameMap[gameCode];
    } catch(err) {
        console.error('join game had an error: ' + err);
        throw "Sorry, we're having a problem on the back end :(";
    }
    if(game === undefined) {
        throw "This is not the game code you are looking for";
    } else {
        const success = await game.addPlayer(user);
        if(!success) {
            throw "Sorry, room full";
        }
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
}



async function emitGameState(socket, user, game) {
    const [players, gameState, jCards, visiblePCards, pCardIndex, endTime, isSkipping, gameCode] = await  Promise.all(
                [game.getPlayers(), game.getGameState(), game.getJCards(), game.getVisiblePCards(user),
                game.getPCardIndex(), game.getEndTime(), game.getIsSkipping(), game.getGameCode()]);
    socket.emit('gameState', players, gameState, jCards, visiblePCards, pCardIndex, endTime, cardsToWin, isSkipping, gameCode);
}

/**
creates a socket listener for event, checks that only newGame and joinGame are allowed to not come with a game already made.
Then, for everything but newGame and joinGame, it locks the game object while it runs so that all others on the same game
will await it. Finally it runs the handler and then unlocks.
*/
function createLockedListener(socket, event, gameGetter, func) {
    socket.on(event, args => {
        const game = gameGetter();

        if(!game && !(event in ['newGame', 'joinGame'])) {
            // WARNING: special values used here!
            console.error("attempted to do game action " + event + " without a game");
            return;
        }

        if(game) {
            await game.lock();
        }
        try {
            await func.apply(this, args);
        } catch(err) {
            console.error("socket triggered error: " + err);

            // WARNING: maybe we don't want this?
            socket.disconnect();
        }
        if(game) {
            game.unlock();
        }
    });
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
        try {
            game = await Game.create(cardsToWin, user);
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
            game = await Game.join(gameCode, user);
        } catch(reason) {
            return socket.emit('rejectConnection', reason);
        }
        socket.join(gameCode);
        emitGameState(socket, user, game);
        socket.to(gameCode).emit('nuj', await game.getPlayer(user));
    });

    createLockedListener(socket, 'startGame', game, async () => {
        await game.start();
        io.to(game.getGameCode()).emit('judgeAssign', game.getPlayer_ids(), game.getJCards());
    });

    createLockedListener(socket, 'jCardChoice', game, async jCardIndex => {
        const endTime = game.startRound(user, jCardIndex);
        io.to(game.getGameCode()).emit('roundStart', jCardIndex, endTime);
        const round = game.getRound();
        setTimeout(async () => {
            await game.lock();
            if(game.canEndSubmitPhase(round)) {
                // the timer is actually relevant
                await game.endSubmitPhase();
                io.to(game.getGameCode()).emit('pCards', await game.getVisiblePCards());
            }
            game.unlock();
        }, endTime - Date.now() + TIME_LIMIT_FORGIVE_MILLIS);
    });

    createLockedListener(socket, 'submitCard', game, async (image, text {

    })
}


module.exports = {onConnection};