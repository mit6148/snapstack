import React from "react";
import NavButtons from "../nav/NavButtons";
import {gamePhases, saveStates, MIN_PLAYERS} from "../../../../config.js";
const { LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER } = gamePhases;
const { UNSAVED, SAVING, SAVED } = saveStates;

import "../../css/game.css";

export default class Game extends React.Component {
    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="game_page">
                <NavButtons appState={this.props.appState} page='Game' quitGame={this.actions.quitGame} />
                Game
            </div>
        );
    }

    canFlipAllPCards = () => {
        return this.gameState.pCardsFacedown > 0;
    }

    canSelectPCard = () => {
        return this.gameState.pCardsFacedown === 0 && this.gameState.pCardIndex !== null;
    }

    getWinner = () => {
        return [ROUND_OVER, GAME_OVER].includes(this.gameState.gamePhase) && this.gameState.pCards[this.gameState.pCardIndex].creator_id || null;
    }

    // enable skip round
    isJudgeDisconnected = () => {
        return [JCHOOSE, SUBMIT, JUDGE].includes(this.gameState.gamePhase) && !this.gameState.players[this.gameState.playerIds[0]].connected;
    }

    // stall at JCHOOSE
    tooFewPlayers = () => {
        return this.gameState.playerIds.length < MIN_PLAYERS;
    }
}