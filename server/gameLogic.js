const User = require('./models/user');

let codeToGameMap = {};

function generateRoomCode(length) {
    let code = "";
    for(let i = 0; i < length; i++) {
        text += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
}

function generateUnusedRoomCode() {
    const size = Object.keys(codeToGameMap).length;
    const minLetters = Math.ceil(Math.pow(size, 1.0 / 26)) + 2;
    while(true) {
        const code = generateRoomCode(minLetters);
        if(code in codeToGameMap) {
            return code;
        }
    }
}

function createGame(user, cardsToWin) {
    const code = generateUnusedRoomCode();
    codeToGameMap[code] = {
        players: [],
        
    }
}

function onConnection(socket, io) {
    const user = socket.request.user;
    if(!user.logged_in) {
        socket.disconnect(true); // close socket fully
        return; // stop 
    }

    socket.on('newGame', function(cardsToWin) {
        a
    });
}




module.exports = onConnection;