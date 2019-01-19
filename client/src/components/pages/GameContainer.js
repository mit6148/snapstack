import React from "react";
import NavButtons from "../nav/NavButtons";

export default class GameContainer extends React.Component {
    render() {
        return (
            <div>
            	<NavButtons page='GameContainer' quitGame={this.props.quitGame} />
                Game
            </div>
        );
    }
}