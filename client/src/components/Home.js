import React from "react";
import NavButtons from "./NavButtons";
import Title from "./Title";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gameCode: 'XZXZ' // TODO
        };
    }

    render() {
        return (
            <div>
                <NavButtons page='Home' />
                <Title />
                <div className="home_btn" onClick={this.onNewGame}>New Game</div>
                <div className="home_btn" onClick={this.onJoinGame}>Join Game</div>
            </div>
        );
    }

    onNewGame = () => {

    }

    onJoinGame = () => {

    }
}
