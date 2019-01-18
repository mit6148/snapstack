import React from "react";

export default class Login extends React.Component {
    render() {
        return (
            <div>
                <NavButtons appState={this.props.appState} page="login" />
                <Title />
                <a className="home_btn" href="/auth/facebook">Log In</a>
            </div>
        );
    }
}