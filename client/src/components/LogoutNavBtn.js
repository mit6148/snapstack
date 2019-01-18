import React from "react";

export default class LogoutNavBtn extends React.Component {
    render() {
        return (
            <div>
                <a className="logout_nav_btn" href="/logout" onClick={this.props.logout}>Log Out</a>
            </div>
        );
    }
}