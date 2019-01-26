const gamePhases = {
    LOBBY: 0,
    JCHOOSE: 1,
    SUBMIT: 2,
    JUDGE: 3,
    ROUND_OVER: 4,
    GAME_OVER: 5,
};

const saveStates = {
    UNSAVED: 0,
    SAVING: 1,
    SAVED: 2,
};

const endSubmitPhaseStatus = {
    CAN_END: 0,
    ALREADY_ENDED: 1,
    SKIP_INSTEAD: 2,
}

const specialCards = {
    NO_CARD: 0,
    CARDBACK: 1,
    FACEDOWN_CARD: 2,
    LOADING_CARD: 3,
};

const MIN_PLAYERS = 3;

const MAX_PLAYERS = 7;

const TIME_LIMIT_MILLIS = 180000;

const TIME_LIMIT_FORGIVE_MILLIS = 2000;

const NUM_JCARDS = 3;

const CARDS_TO_WIN = 3;

const GAME_CODE_LENGTH = 3;

const WAIT_TIME = 2000; // between events that would otherwise be emitted concurrently

const DEVELOPER_MODE = true;

const LAZY_B_ID = "5c46ec131c9d440000ea85a4";
const LETHARGIC_B_ID = "5c4a8e621c9d44000084e078";

module.exports = {gamePhases, saveStates, endSubmitPhaseStatus, specialCards, MAX_PLAYERS, TIME_LIMIT_MILLIS, TIME_LIMIT_FORGIVE_MILLIS,
    NUM_JCARDS, CARDS_TO_WIN, GAME_CODE_LENGTH, WAIT_TIME, MIN_PLAYERS, DEVELOPER_MODE, LAZY_B_ID, LETHARGIC_B_ID};
