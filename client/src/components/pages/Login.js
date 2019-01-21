import React from "react";
import NavButtons from "../nav/NavButtons";
import Title from "../univ/Title";

import "../../css/home.css";


export default class Login extends React.Component {
    render() {
        return (
            <div className="login_center">
                <Title />
                <a className="login_btn" href="/auth/facebook">Log In</a>
                <NavButtons appState={this.props.appState} page='Login' />
            </div>
            
        );
    }
}