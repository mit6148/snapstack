import React from "react";
import NavButtons from "./NavButtons";
import Title from "./Title";

export default class Login extends React.Component {
    render() {
        return (
            <div>
            	<NavButtons page='Login' />
                <Title />
                <a className="home_btn" href="/auth/facebook">Log In</a>
            </div>
        );
    }
}