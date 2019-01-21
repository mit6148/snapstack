import React from "react";
import NavButtons from "../nav/NavButtons";

import "../../css/game.css";

export default class Game extends React.Component {
    render() {
        return (
            <div className="game_page">
                <NavButtons appState={this.props.appState} page='Game' quitGame={this.props.quickActions.quitGame}/>
                Game
            </div>
        );
    }
}