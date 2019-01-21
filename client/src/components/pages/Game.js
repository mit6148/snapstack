import React from "react";
import NavButtons from "../nav/NavButtons";

import "../../css/game.css";

export default class Game extends React.Component {
    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="game_page">
                <NavButtons appState={this.props.appState} page='Game' quitGame={this.actions.quitGame}/>
                Game
            </div>
        );
    }

    getWinner = () => {
        return [ROUND_OVER, GAME_OVER].includes(this.gameState.gamePhase) && this.gameState.pCards[this.gameState.pCardIndex].creator_id || null
    }

    isJudgeDisconnected = () => {
        return [JCHOOSE, SUBMIT, JUDGE].includes(this.gameState.gamePhase) && !this.gameState.players[this.gameState.playerIds[0]].connected
    }
}