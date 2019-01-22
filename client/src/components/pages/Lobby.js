import React from "react";
import NavButtons from "../nav/NavButtons";
import PlayerList from "../game/PlayerList";
import { MIN_PLAYERS } from "../../../../config.js";

import "../../css/game.css";
import "../../css/lobby.css";

export default class Lobby extends React.Component {
    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="lobby_page">
                <NavButtons appState={this.props.appState} page='Lobby' quitGame={this.actions.quitGame} />
                <h2>
                    Game Code: 
                    <div className="game_code"> {this.props.appState.gameCode}
                    </div>
                </h2>
                
                <h2>
                    # Cards to Win: 
                    <div className="game_settings">
                        {this.gameState.cardsToWin}
                    </div>
                </h2>
                
                <h2> Who's Joined: 
                </h2>
                
                <PlayerList players={this.gameState.playerIds.map(playerId => this.gameState.players[playerId])} />
                
                {this.canStartGame() ? (
                    <div className="enabled_start_btn" onClick={this.actions.gameStart}>Start Game</div>
                ) : (
                    <div className="disabled_start_btn">Start Game</div>
                )}

            </div>
        );
    }

    canStartGame = () => {
        return this.gameState.playerIds.length >= MIN_PLAYERS;
    }
}