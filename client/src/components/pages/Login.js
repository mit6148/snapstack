import React from "react";
import NavButtons from "../nav/NavButtons";
import Title from "../univ/Title";

import "../../css/login.css";

export default class Login extends React.Component {
    render() {
        return (
            <div>
            	<NavButtons appState={this.props.appState} page='Login' />
                <Title />
                <a className="home_btn" href="/auth/facebook">Log In</a>
            </div>
        );
    }
}