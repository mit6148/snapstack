import React from "react";
import Login from "./Login";
import Home from "./Home";
import GameContainer from "./GameContainer";

import "../../css/game.css";
import "../../css/home.css";
import "../../css/login.css";
import "../../css/nav.css";

export default class Root extends React.Component {
    render() {
        if (this.props.appState.userId === null) {
            return (
                <div className='login_page'>
                    <Login appState={this.props.appState} />
                </div>
            );
        }
        else if (this.props.appState.gameCode === null) {
            return (
                <div className='home_page'>
                    <Home appState={this.props.appState} enterGame={this.props.enterGame} quitGame={this.props.quitGame} />
                </div>
            );
        }
        else {
            return (
                <div className='game_page'>
                    <GameContainer appState={this.props.appState} enterGame={this.props.enterGame} quitGame={this.props.quitGame} />
                </div>
            );
        }
    }
}
