import React from "react";

export default class Popup extends React.Component {
    render() {
        return (
            <div className="popup">
                <div>
                    {this.props.children}
                </div>
                <div className="popup_close_btn" onClick={this.props.onClose} />
            </div>
        );
    }
}
