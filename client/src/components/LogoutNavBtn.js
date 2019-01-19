import React from "react";

export default class LogoutNavBtn extends React.Component {
    render() {
        return (
            <div>
                <a class='fas fa-sign-out-alt' className='faclassName='nav_btn' id="logout_nav_btn" href="/logout" onClick={this.props.logout}>Log Out</a>
            </div>
        );
    }
}