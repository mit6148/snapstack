import React from "react";
import NavButtons from "../nav/NavButtons";

import "../../css/game.css";

export default class Lobby extends React.Component {
    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="game_page">
                <NavButtons appState={this.props.appState} page='Lobby' quitGame={this.actions.quitGame} />
                Lobby
            </div>
        );
    }

    canStartGame = () => {
        return this.gameState.playerIds.length >= MIN_PLAYERS;
    }
}