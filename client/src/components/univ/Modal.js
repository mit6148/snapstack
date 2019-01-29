import React from "react";
import ModalCloseButton from "./ModalCloseButton";
import "../../css/modal.css";
import "../../css/card.css";

export default class Modal extends React.Component {
    render () {
        return (
            <div className='modal_window' onClick={this.props.disableCloseByWindow ? null : this.props.onClose}>
                <div className='modal' onClick={e => e.stopPropagation()}>
                    {this.props.withBox ? (
                        <div className='modal_box'>
                            {this.props.children}
                        </div>
                    ) : this.props.withUnpaddedBox ? (
                        <div className='modal_box_unpadded'>
                            {this.props.children}
                        </div>
                    ) : this.props.children}
                    {this.props.disableCloseByButton || !this.props.onClose ? null : (
                        <ModalCloseButton onClose={this.props.onClose} />
                    )}
                </div>
            </div>
        );
    }
}
