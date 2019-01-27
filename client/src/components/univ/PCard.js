import React, { Component } from "react";
import Image from "./Image";
import Caption from "./Caption";
import Modal from "./Modal";
import SaveButton from "./SaveButton";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/card.css";

export default class PCard extends Component {
    render() {
        switch (this.props.src) {
            case NO_CARD:
                return (
                    <div className="pcard_empty" onClick={this.props.onClick}>
                    </div>
                );
            case CARDBACK:
            case FACEDOWN_CARD:
                return (
                    <div className="pcard_back" onClick={this.props.onClick}>
                        <img src="/pancakes.png"/>
                    </div>
                );
            case LOADING_CARD: // TODO styling
                return (
                    <div>
                    </div>
                );
            default:
                if (this.props.faceup === false) {
                    return (
                        <div className="pcard_back" onClick={this.props.onClick}>
                            <img src="/pancakes.png"/>
                        </div>
                    );
                } else {
                    return (
                        <div className={this.props.enlarged ? 'pcard_enlarged' : 'pcard'} onClick={this.props.onClick}>
                            <div className='container'>
                                <img src={this.props.image} />
                            </div>
                            <Caption text={this.props.text} creator={this.props.creator} creatorId={this.props.creatorId} />
                            <SaveButton saveState={this.props.saveState} save={this.props.save} />
                        </div>
                    );
                }
        }
    }
}
        // if (this.props.faceup) {
        //     if (this.props.zoomed) {
        //         return (
        //         <Modal modalType="zoom_card">
        //             <div className="container"> 
        //                 <Image />
        //             </div>
        //             <Caption text=':chrissexy:' />
        //         </Modal>
        //         );
        //     } else {
        //         return (
        //         <div className="card">
        //             <div className="container"> 
        //                 <Image />
        //             </div>
        //             <Caption text=':chrissexy:' />
        //         </div>
        //         );
        //     }

        // }
        // else {
        //     return (
        //         null
        //     );
        //     // return (
        //     //     <div>
        //     //         <Cardback type={this.props.type} />
        //     //     </div>
        //     // );
        // }