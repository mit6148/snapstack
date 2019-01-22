import React from "react";
import NavButtons from "../nav/NavButtons";
import PlayerList from "../game/PlayerList";

import "../../css/game.css";

export default class Lobby extends React.Component {
    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="game_page">
                <NavButtons appState={this.props.appState} page='Lobby' quitGame={this.actions.quitGame} />
                <div>
                    Game Code: {this.props.appState.gameCode}
                </div>
                <div>
                    Play to {this.gameState.cardsToWin} cards
                </div>
                <PlayerList players={this.gameState.playerIds.map(playerId => this.gameState.players[playerId])} />
                {this.canStartGame() ? (
                    <div onClick={this.actions.gameStart}>Start Game</div>
                ) : (
                    <div>sTART gAME</div>
                )}
            </div>
        );
    }

    canStartGame = () => {
        return this.gameState.playerIds.length >= MIN_PLAYERS;
    }
}