const User = require('./models/user');
const UserDetail = require('./models/user_detail');
const PCardRef = require('./models/pcardref');
const JCard = require('./models/jcard');
const {gamePhases, MAX_PLAYERS, TIME_LIMIT_MILLIS, TIME_LIMIT_FORGIVE_MILLIS,
    NUM_JCARDS, CARDS_TO_WIN, GAME_CODE_LENGTH, WAIT_TIME, saveStates} = require("../config");
const {uploadImagePromise, downloadImagePromise} = require("./storageTalk");
const {io} = require('./requirements');

class Game {
    constructor(cardsToWin) {
        this.gamePhase = gamePhases.LOBBY;
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
        this.pCardsMade = [];
        this.pausedForTooFewPlayers = false;
        this.isSkipping = false;
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
        // TODO. must also handle RE-ADDING players, including the judge. Must return problem: null if no issues, otherwise an informative message
    }

    async getPlayer(user) {
        // TODO
    }

    async getPlayers() {
        // TODO
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
        // TODO
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

    startNewRound() {
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

    getIsJudgeConnected() {
        // TODO
    }

    getTooFewPlayers() {
        // TODO
    }

    getGameCode() {
        return this.gameCode
    }
}

Game.codeToGameMap = {};

Game.create = async (cardsToWin, user) => {
    try {
        const game = new Game(cardsToWin);
        await game.addPlayer(user); // WARNING: if someone guesses code, can cause race condition
        Game.codeToGameMap[this.gameCode] = game;
        return game;
    } catch (err) {
        console.error('create game had an error: ' + err);
        throw "Sorry, we're having a problem on the back end :(";
    }
};

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
        await game.lock();
        let problem;
        try {
            problem = await game.addPlayer(user);
        } catch(err) {
            game.unlock(); // WATCH OUT: NEEDED BEFORE ANY EXIT
            throw "Sorry, we're having a problem on the back end :/";
        }
        game.unlock(); // WATCH OUT: NEEDED BEFORE ANY EXIT
        if(problem) {
            throw problem;
        }
        return game;
    }
};

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
    const [players, gamePhase, jCards, visiblePCards, pCardIndex, endTime, isSkipping, tooFewPlayers, gameCode] = await Promise.all(
                [game.getPlayers(), game.getGamePhase(), game.getJCards(), game.getVisiblePCards(user),
                game.getPCardIndex(), game.getEndTime(), game.getIsSkipping(), game.getTooFewPlayers(), game.getGameCode()]);
    socket.emit('gameState', players, gamePhase, jCards, visiblePCards,
                pCardIndex, endTime, cardsToWin, isSkipping, tooFewPlayers,  gameCode);
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

function tryStartNewRound(game) {
    game.startNewRound();
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
            await game.lock();
            try {
                if(game.canEndSubmitPhase(round)) {
                    // the timer is actually relevant
                    await game.endSubmitPhase();
                    io.to(game.getGameCode()).emit('pCards', await game.getVisiblePCards());
                }
            } catch(err) {
                console.error("end submit phase timeout in jCardChoice had an error, caught to preserve lock safety: " + err);
            }
            game.unlock();
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
            await game.lock();
            try {
                if(game.hasSomeoneWon()) {
                    game.endGame();
                    io.to(game.getGameCode()).emit('gameOver');
                } else {
                    tryStartNewRound(game);
                }

            } catch(err) {
                console.error("post-select-phase timeout in select had an error, caught to preserve lock safety: " + err);
            }
            game.unlock();
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