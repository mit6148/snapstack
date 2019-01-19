import React from "react";

export default class HomeNavBtn extends React.Component {
    render() {
        return (
            <div>
                <Link to="/" class='fas fa-home' className="nav_btn" id='home_nav_btn'>Home</Link>
            </div>
        );
    }
}