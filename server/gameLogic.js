const User = require('./models/user');
const UserDetail = require('./models/user_detail');
const PCard = require('./models/pcard');
const JCard = require('./models/jcard');
const {gameStates, MAX_PLAYERS, TIME_LIMIT_MILLIS, NUM_JCARDS} = require("../config");
const {uploadImagePromise, downloadImagePromise} = require("./storageTalk");
const {io} = require('./requirements');

function generateRoomCode(length) {
    let code = "";
    for(let i = 0; i < length; i++) {
        text += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
}

function shuffle(array) { // shuffle in place
    let currentIndex = array.length;
    while(currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        const temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array;
}


class PCardRef {
    constructor(_id, faceup) {
        this._id = _id;
        this.faceup = faceup;
    }

    outputRepPromise(redactCreator) {
        return PCard.findOne({_id: this._id}).exec()
            .then(cardInfo => downloadImagePromise(cardInfo.image_ref))
            .then(image => ({_id: this._id, image: image, text: cardInfo.text,
                            creator_id: redactCreator ? undefined : card.creator_id}));
    }
}

class Player { // do not use constructor, use fromUserPromise
    constructor(user, detail) {
        this._id = user._id,
        this.media = detail.media,
        this.score = 0;
        this.hasPlayed = false;
        this.pCardRef = null;
        this.connected = true;
        this.name = detail.name;
        this.avatar = detail.avatar;
    }

    getPCardRef() {
        return this.pCardRef;
    }

    redacted() {
        return {_id: this._id, media: this.media, score: this.score, hasPlayed: this.hasPlayed,
                connected: this.connected, name: this.name, avatar: this.avatar};
    }

    is(player) {
        return this._id === player._id;
    }
}
Player._idToPlayerMap = {}; // keep right after class Player definition
Player.fromUserPromise = (user) => {
    const found = Player._idToPlayerMap[user._id];
    if(found) {
        return Promise.resolve(found);
    } else {
        return UserDetail.findOne({_id: user.detail_id}).exec().then(detail => new Player(user, detail));
    }
};


class Game {
    constructor(code, cardsToWin) {
        this.players = []; // first player is judge when relevant
        this.gameState = gameStates.LOBBY;
        this.jCards = null; // format: [{text, _id}]
        this.pCardRefArray = null;
        this.pCardIndex = null;
        this.endTime = null;
        this.gameCode = code;
        this.cardsToWin = cardsToWin;
        this.jCardsSeen = [];
    }

    formatAllPCardsPromise(player) {
        switch(this.gameState) {
            case gameStates.SUBMIT:
                const pCardRef = player.getPCardRef();
                return pCardRef ? Promise.resolve([]) : pCardRef.outputRepPromise(false).then(card => [card]);
            case gameStates.JUDGE: case gameStates.ROUND_OVER:
                return Promise.all(this.pCardRefArray.map(
                    pCardRef => pCardRef.outputRepPromise(
                        this.gameState == gameStates.ROUND_OVER)));
            default:
                return Promise.resolve(null);
        }
    }

    generateJCardsPromise() {
        return JCard.aggregate([
            {$match: {_id: {$not: {$in: this.jCardsSeen}}}},
            {$sample: {$size: NUM_JCARDS}} // warning: try to prevent concurrent modification error & memory excess (100MB)
            ])
            .then(jCards => {
                this.jCards = jCards;
                this.jCardsSeen += jCards.map(card => card._id);
            });
    }


// PUBLIC METHODS

    addPlayer(player) {
        this.players.push(player);
    }

    isFull() {
        return this.players.length >= MAX_PLAYERS;
    }

    start() {
        // must randomize player order
        shuffle(this.players);
        this.judgeAssign();
    }

    isJudge(player) {
        return this.players.length > 0 && this.players[0].is(player);
    }

// EMIT AND BROADCAST METHODS

    emitRefreshGame(socket, player) {
        this.formatAllPCardsPromise(player)
            .then(pCards => socket.emit('refreshGame',
                this.players.map(player => player.redacted()), this.gameState, this.jCards.map(jCard => jCard.text),
                pCards, this.pCardIndex, this.endTime, this.cardsToWin, this.gameCode))
            .catch(err => console.log("emitRefreshGame had error!!!"));
    }

    judgeAssign() {
        this.generateJCardsPromise().then(() => {
            this.gameState = gameStates.JCHOOSE;
            io.in(this.gameCode)
                .emit('judgeAssign', this.players.map(player => player._id), this.jCards.map(jCard => jCard.text));
        });
    }

    startRoundAndCheckIndex(jCardIndex) {
        if(this.jCardIndex >= this.jCards.length || this.jCardIndex < 0) {
            console.log("judge submitted invalid index");
            return;
        }
        this.jCards = [this.jCards[jCardIndex]];
        this.endTime = Date.now() + TIME_LIMIT_MILLIS;
        io.in(this.gameCode).emit('roundStart', jCardIndex, this.endTime);
    }

}

class GameManager {
    constructor() {
        this.codeToGameMap = {};
        this.userToGameMap = {};
    }

    generateUnusedRoomCode() {
        const size = Object.keys(this.codeToGameMap).length;
        const minLetters = Math.ceil(Math.pow(size + 1, 1.0 / 26)) + 2;
        while(true) {
            const code = generateRoomCode(minLetters);
            if(code in this.codeToGameMap) {
                return code;
            }
        }
    }

    getCurrentGame(userOrPlayer) {
        return this.userToGameMap[userOrPlayer._id];
    }

    removePlayer(player, game) {
        console.log("@nikhil finish remove player");
        //TODO(niks)
    }

    addPlayerToGame(socket, player, game) {
        const previous = getCurrentGame(player);
        if(previous) {
            this.removePlayer(player, previous);
        }
        game.addPlayer(player);
        this.userToGameMap[player._id] = game;
        socket.join(game.gameCode); // add to room listeners
        game.emitRefreshGame(socket, player);
    }


// SOCKET EVENT HANDLERS


    handleNewGame(socket, player, cardsToWin) {
        console.log("new game");
        const code = this.generateUnusedRoomCode();
        const game = new Game(code, cardsToWin);
        codeToGameMap[code] = game;
        this.addPlayerToGame(socket, player, game);
    }

    handleJoinGame(socket, player, gameCode) {
        const game = this.getCurrentGame(player);
        if(!game) {
            socket.emit('rejectConnection', 'Invalid room code');
        } else if(game.isFull()) {
            socket.emit('rejectConnection', "Room full :'(");
        } else {
            this.addPlayerToGame(socket, player, game);
            socket.to(gameCode).emit('nuj', player.redacted()); // emit to all but newcomer
        }
    }

    handleStartGame(player) {
        const game = this.getCurrentGame(player);
        if(!game || game.gameState != gameStates.LOBBY) {
            return console.log("player " + player._id + " tried to start game in wrong state");
        }
        game.start();
    }

    handleJCardChoice(player, jCardIndex) {
        const game = this.getCurrentGame(player);
        if(!game || !game.isJudge(player)) {
            return console.log("player " + player._id + " tried to choose j card in wrong state");
        }
        game.startRoundAndCheckIndex(jCardIndex); // this should be the only mutator
    }

    handleSubmitCard(socket, player, image, text) {
        //TODO(niks)
    }
}

const manager = new GameManager();

function onConnection(socket) {
    const user = socket.request.user;
    if(!user.logged_in) {
        console.log('not logged in!');
        socket.disconnect(true); // close socket fully
        return;
    }
    console.log("user: " + user._id + " joined");

    Player.fromUserPromise(user)
        .then(player => {
            console.log("made player");
            socket.on('newGame', cardsToWin => manager.handleNewGame(socket, player, cardsToWin));
            socket.on('joinGame', gameCode => manager.handleJoinGame(socket, player, gameCode));
            socket.on('startGame', () => manager.handleStartGame(player));
            socket.on('jCardChoice', jCardIndex => manager.handleJCardChoice(player, jCardIndex));
            socket.on('submitCard', (image, text) => manager.handleSubmitCard(socket, player, image, text));
        })
        .catch(err => {
            console.log("failed to get user --> player: " + err);
            socket.disconnect(true);
        });
}

function getCurrentGameCode(user) {
    const game = manager.getCurrentGame(user);
    return game ? game.gameCode : null;
}



module.exports = {onConnection, getCurrentGameCode};