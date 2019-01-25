import React from "react";
import Login from "./Login";
import Home from "./Home";
import GameContainer from "./GameContainer";

import "../../css/game.css";
import "../../css/home.css";
import "../../css/login.css";
import "../../css/nav.css";

export default class Root extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            gameLoaded: false
        };
    }

    render() {
        if (this.props.appState.userId === null) {
            return (
                <div className='login_page'>
                    <Login appState={this.props.appState} />
                </div>
            );
        }
        else {
            return (
                <React.Fragment>
                    {this.state.gameLoaded ? null : (
                        <Home appState={this.props.appState} enterGame={this.props.enterGame} quitGame={this.props.quitGame} />
                    )}
                    {this.props.appState.gameCode === null ? null : (
                        <GameContainer appState={this.props.appState} enterGame={this.enterGame} quitGame={this.quitGame} />
                    )}
                </React.Fragment>
            );
        }
    }

    enterGame = gameCode => {
        this.setState({
            gameLoaded: true
        });
        this.props.enterGame(gameCode);
    }

    quitGame = reason => { //TODO display reason
        this.setState({
            gameLoaded: false
        });
        this.props.quitGame();
    }
}
