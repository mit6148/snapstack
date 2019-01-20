import React from "react";

import "../../css/univ.css";

export default class Popup extends React.Component {
    render() {
        return (
            <div className="popup_container">
                <div>
                    {this.props.children}
                </div>
                <div className="popup_close_btn" onClick={this.props.onClose} />
            </div>
        );
    }
}
