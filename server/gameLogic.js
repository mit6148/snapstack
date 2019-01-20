const User = require('./models/user');
const PCard = require('./models/pcard');
const {gameStates, MAX_PLAYERS} = require("../config");
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

class Player { // do not use constructor, use fromUser
    constructor(user) {
        this._id = user._id,
        this.media = user.media,
        this.score = 0;
        this.hasPlayed = false;
        this.pCardRef = null;
        this.connected = true;
        this.name = user.name;
        this.avatar = user.avatar;
    }

    getPCardRef() {
        return this.pCardRef;
    }

    redacted() {
        return {_id: this._id, media: this.media, score: this.score, hasPlayed: this.hasPlayed,
                connected: this.connected, name: this.name, avatar: this.avatar};
    }
}
Player._idToPlayerMap = {}; // keep right after class Player definition
Player.fromUser = (user) => {
    const found = Player._idToPlayerMap[user._id];
    if(found) {
        return found;
    } else {
        return new Player(user);
    }
};


class Game {
    constructor(code, cardsToWin) {
        this.players = [];
        this.gameState = gameStates.LOBBY;
        this.jCards = null;
        this.pCardRefArray = null;
        this.pCardIndex = null;
        this.endTime = null;
        this.gameCode = code;
        this.cardsToWin = cardsToWin;
    }

    allPCardsPromise(player) {
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


// PUBLIC METHODS

    addPlayer(player) {
        this.players.push(player);
    }

    emitRefreshGame(socket, player) {
        this.allPCardsPromise(player)
            .then(pCards => socket.emit('refreshGame',
                this.players.map(player => player.redacted()), this.gameState, this.jCards,
                pCards, this.pCardIndex, this.endTime, this.cardsToWin, this.gameCode));
    }

    isFull() {
        return this.players.length >= MAX_PLAYERS;
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
        console.log("todo: finish remove player");
        //TODO(niks)
    }

    addPlayerToGame(socket, player, game) {
        const previous = this.userToGameMap[player._id];
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

    handleStartGame(socket, player) {
        const game = this.getCurrentGame(player);
        if(!game || game.gameState != gameStates.LOBBY) {
            return console.log("player " + player._id + "tried to start game in wrong state");
        }
        game.start();
    }
}

const manager = new GameManager();

function onConnection(socket) {
    const user = socket.request.user;
    if(!user.logged_in) {
        socket.disconnect(true); // close socket fully
        return;
    }

    const player = Player.fromUser(user);

    socket.on('newGame', cardsToWin => manager.handleNewGame(socket, player, cardsToWin));
    socket.on('joinGame', gameCode => manager.handleJoinGame(socket, player, gameCode));
    socket.on('startGame', () => manager.handleStartGame(socket, player));
}

function getCurrentGame(user) {
    return manager.getCurrentGame(user);
}



module.exports = {onConnection, getCurrentGame};