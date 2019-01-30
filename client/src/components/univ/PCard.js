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
        } else if ([CARDBACK, FACEDOWN_CARD].includes(this.props.src)) {
            return (
                <div className='pcard_back' onClick={this.props.onClick}>
                    <div className='content'>
                        <img src='/pancakes.png' />
                    </div>
                </div>
            );
        } else if (this.props.src === LOADING_CARD) {
            return null;
        } else {
            return (
                <React.Fragment>
                    <div className='flipcard' flipped={this.props.faceup !== false ? 'true' : 'false'} clickable={this.props.onClick ? 'true' : 'false'}>
                        <div className='flipcard_inner'>
                            <div className='pcard_back' onClick={this.props.onClick}>
                                <div className='content'>
                                    <img src='/pancakes.png' />
                                </div>
                            </div>
                            <div className='pcard' onClick={this.props.onClick}>
                                <div className='image_content'>
                                    <img src={this.props.image} />
                                </div>
                                <div className='caption_content'>
                                    <Caption text={this.props.text} creator={this.props.creator} creatorId={this.props.creatorId} userId={this.props.userId} />

                                </div>
                                {![null, undefined].includes(this.props.saveState) ? (
                                    <div className='save_btn_container'>
                                        <SaveButton saveState={this.props.saveState} save={this.props.save} />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    {this.props.highlight ? (
                        <div className='highlight' />
                    ) : null}
                </React.Fragment>
            );
        }
    }
}