import React from "react";
import "../../css/modal.css";
import "../../css/card.css";

export default class Modal extends React.Component {

    render () {
        switch(this.props.modalType) {
            case 'join_game':
                return (
                    <div>
                        <div className="modal_window" onClick={this.props.onClose}>
                        </div>
                        <div className="modal_container_join">
                            <div className="modal_contents_join">
                                {this.props.children}
                            </div>
                            <div className="modal_close_btn fas fa-times" onClick={this.props.onClose} />
                        </div>
                    </div>
                );
            case 'zoom_card':
                return (
                    <div>
                        <div className="modal_window" onClick={this.props.onClose}>
                        </div>
                        <div className="modal_container_card">
                            <div className="modal_contents_card">
                                {this.props.children}
                            </div>
                            <div className="modal_close_btn fas fa-times" onClick={this.props.onClose} />
                        </div>
                    </div>
                );
            default:
                return (
                    <div>
                        <div onClick={this.props.persistOnWindowClick ? null : this.props.onClose}>
                        </div>
                        <div>
                            <div>
                                {this.props.children}
                            </div>
                            <div className="modal_close_btn fas fa-times" onClick={this.props.onClose} />
                        </div>
                    </div>
                );
        }
    }
}
