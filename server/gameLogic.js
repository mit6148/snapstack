const User = require('./models/user');
const PCard = require('./models/pcard');
const {gameStates} = require("../config.js");

let codeToGameMap = {};
let userToGameMap = {};

function getCurrentGame(user) {
    return userToGameMap[user._id];
}

function generateRoomCode(length) {
    let code = "";
    for(let i = 0; i < length; i++) {
        text += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
}

function generateUnusedRoomCode() {
    const size = Object.keys(codeToGameMap).length;
    const minLetters = Math.ceil(Math.pow(size + 1, 1.0 / 26)) + 2;
    while(true) {
        const code = generateRoomCode(minLetters);
        if(code in codeToGameMap) {
            return code;
        }
    }
}

function createGame(user, cardsToWin) {
    if(user._id in userToGameMap) {
        removePlayer(user, userToGameMap[user._id].gameCode);
    }
    const code = generateUnusedRoomCode();
    const game = codeToGameMap[code] = {
        players: [],
        _idToPlayerMap: {}, // must contain references to same player object
        gameState: gameStates.LOBBY,
        judge_id: null,
        jCards: null,
        pCard_ids: null,
        pCardIndex: null,
        gameCode: code,
        "cardsToWin": cardsToWin,
    }
    addPlayer(user, game);
    return game;
}

function removePlayer(user, gameCode) {

}

function addPlayer(user, game) {
    const player = {
        _id: user._id,
        media: {
            fb: user.facebookLink,
            insta: user.instaLink
        },
        score: 0,
        hasPlayed: false,
        pCard_id: null,
        connected: true,
        avatar: user.avatar,
        // can add socket _id/ref here if need be, but then watch out for sending game.players
    };
    game.players.push(player);
    game._idToPlayerMap[user._id] = player;
    userToGameMap[user._id] = game;
}

function redact(object, fields) {
    const ans = {};
    for(let key in object) {
        if(!(key in fields)) {
            ans[key] = object[key];
        }
    }
    return ans;
}

function getImagePromise(imageRef) {

}

function fullPCardPromise(pCard_id, redactCreator) {
    return PCard.findOne({_id: pCard_id}).exec()
    .then(card => getImagePromise(card.image_ref)
                .then(image => {_id: card._id, image: image, text: card.text, creator: card.creator}))
    .then(card => redactCreator ? redact(card, ["creator"]) : card);
}

function allPCardsPromise(user, game) {
    if(game.gameState == gameStates.SUBMIT) {
        const pCard_id = game._idToPlayerMap[user._id].pCard_id;
        return pCard_id == null ? Promise.resolve([]) : fullPCardPromise(pCard_id, false).then(card => [card]);
    } else if(game.gameState != gameStates.JUDGE && game.gameState != gameStates.ROUND_OVER) {
        return Promise.resolve(null);
    }
    return Promise.all(game.pCard_ids.map(pCard_id => fullPCardPromise(pCard_id, game.gameState != gameStates.ROUND_OVER)));
}



function emitRefreshGame(socket, user, game) {
    allPCardsPromise(user, game)
    .then(pCards => socket.emit('refreshGame',
        game.players.map(player => redact(player, ["pCard_id"])),
        game.gameState, game.judge_id, game.jCards, pCards, game.pCardIndex, game.gameCode, game.cardsToWin));
}

function onConnection(socket, io) {
    const user = socket.request.user;
    if(!user.logged_in) {
        socket.disconnect(true); // close socket fully
        return; // stop 
    }

    socket.on('newGame', function(cardsToWin) {
        const game = createGame(user, cardsToWin);
        socket.join(game);
        emitRefreshGame(socket, user, game);
    });
}




module.exports = {onConnection, getCurrentGame};
