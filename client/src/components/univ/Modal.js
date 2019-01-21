import React from "react";
import "../../css/univ.css";

export default class Modal extends React.Component {
    render() {
        return (
            <div className="modal_window">
                <div className="modal_container">
                    <div className="modal_contents">
                        {this.props.children}
                    </div>
                    <div className="modal_close_btn fas fa-times" onClick={this.props.onClose} />
                </div>
            </div>
        );
    }
}
