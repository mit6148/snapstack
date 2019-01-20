const gameStates = {
    LOBBY: 0,
    JCHOOSE: 1,
    SUBMIT: 2,
    JUDGE: 3,
    ROUND_OVER: 4,
    GAME_OVER: 5,
}

const MAX_PLAYERS = 7;

const TIME_LIMIT_MILLIS = 120000;

module.exports = {gameStates, MAX_PLAYERS, TIME_LIMIT_MILLIS};