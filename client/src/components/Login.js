import React from "react";

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