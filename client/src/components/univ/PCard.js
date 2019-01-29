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
        if (this.props.src === NO_CARD) {
            return (
                <div className='pcard_empty' onClick={this.props.onClick}></div>
            );
        } else if ([CARDBACK, FACEDOWN_CARD].includes(this.props.src) || this.props.faceup === false) {
            return (
                <div className='pcard_back' onClick={this.props.onClick}>
                    <div className='content'>
                        <img src='/pancakes.png' />
                    </div>
                </div>
            );
        } else { // TODO loading card
            return (
                <div className='pcard' onClick={this.props.onClick}>
                    <div className='image_content'>
                        <img src={this.props.image} />
                    </div>
                    <div className='caption_content'>
                        <Caption text={this.props.text} creator={this.props.creator} creatorId={this.props.creatorId} userId={this.props.userId} />
                        {this.props.saveState !== undefined ? (
                            <div className='save_btn_container'>
                            <SaveButton saveState={this.props.saveState} save={this.props.save} />
                            </div>
                        ) : null}
                    </div>
                </div>
            );
        }
    }
}