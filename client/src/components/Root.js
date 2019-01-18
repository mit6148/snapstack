import React from "react";

export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gameCode: 'XZXZ' // TODO
        };
    }

    render() {
        return (
            <div>
                <Title />
                <Link to={"/game/"+this.state.gameCode} className="home_btn">New Game</Link>
                <div className="home_btn" onClick={this.onJoinGame}>Join Game</div>
            </div>
        );
    }

    onJoinGame = () => {

    }
}