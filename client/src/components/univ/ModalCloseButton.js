import React from "react";
import "../../css/modal.css";

export default class ModalCloseButton extends React.Component {
    render () {
        return (
            <div className='modal_close_btn fas fa-times' onClick={this.props.onClose} />
        );
    }
}
