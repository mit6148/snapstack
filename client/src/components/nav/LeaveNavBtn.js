import React from "react";

import "../../css/nav.css";

export default class LeaveNavBtn extends React.Component {
    render() {
        return (
            <div>
                <a id="leave_nav_btn" onClick={this.props.quitGame}></a>
            </div>
        );
    }
}