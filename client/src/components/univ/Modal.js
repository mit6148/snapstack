import React from "react";

export default class Modal extends React.Component {
    render() {
        return (
            <div className="modal">
                <div>
                    {this.props.children}
                </div>
                <div className="modal_close_btn" onClick={this.props.onClose} />
            </div>
        );
    }
}
