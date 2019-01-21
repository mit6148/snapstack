import React, { Component } from "react";
import Image from "./Image.js";
import Caption from "./Caption.js";
import Modal from "./Modal.js";

import "../../css/card.css";

export default class Card extends Component {
    constructor(props) { // type {J, P}, faceup (Boolean), cardId; enlarged, [flipStatus]
        super(props)
        if (this.props.faceup === undefined) this.props.faceup = true;
    }

    render() {
        if (this.props.faceup) {
            if (this.props.zoomed) {
                return (
                <Modal modalType="zoom_card">
                    <div className="container"> 
                        <Image />
                    </div>
                    <Caption text=':chrissexy:' />
                </Modal>
                );
            } else {
                return (
                <div className="card">
                    <div className="container"> 
                        <Image />
                    </div>
                    <Caption text=':chrissexy:' />
                </div>
                );
            }

        }
        else {
            return (
                null
            );
            // return (
            //     <div>
            //         <Cardback type={this.props.type} />
            //     </div>
            // );
        }
    }
}