import React from "react";
import Login from "./Login";
import Home from "./Home";
import GameContainer from "./GameContainer";

export default class Root extends React.Component {
    render() {
        if (this.props.appState.userId === null) {
            return (
                <div>
                    <Login appState={this.props.appState} />
                </div>
            );
        }
        else if (this.props.appState.gameCode === null) {
            return (
                <div>
                    <Home appState={this.props.appState} enterGame={this.props.enterGame} quitGame={this.props.quitGame} />
                </div>
            );
        }
        else {
            return (
                <div>
                    <GameContainer appState={this.props.appState} enterGame={this.props.enterGame} quitGame={this.props.quitGame} />
                </div>
            );
        }
    }
}
