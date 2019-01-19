import React from "react";

export default class Root extends React.Component {
    render() {
        if (this.props.appState.user_id === null) {
            return (
                <div>
                    <Login appState={this.props.appState} />
                </div>
            );
        }
        else if (this.props.appState.game_code === null) {
            return (
                <div>
                    <Home appState={this.props.appState} />
                </div>
            );
        }
        else {
            return (
                <div>
                    <GameContainer appState={this.props.appState} />
                </div>
            );
        }
    }
}
