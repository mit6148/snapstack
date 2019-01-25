import React, { Component } from "react";
import Image from "./Image";
import Caption from "./Caption";
import Modal from "./Modal";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/card.css";

export default class JCard extends Component {
    render() {
        switch (this.props.src) {
            case NO_CARD:
                return (
                    <div className="jcard_empty" onClick={this.props.onClick}>
                    </div>
                );
            case CARDBACK:
            case FACEDOWN_CARD:
                return (
                    <div className="jcard_back" onClick={this.props.onClick}>
                        <div className="card_logo">
                            <img src="/pancakes.png"/>
                        </div>
                    </div>
                );
            default:
                if (this.props.faceup === false) {
                    return (
                        <div className="jcard_back" onClick={this.props.onClick}>
                            <div className="card_logo">
                                <img src="/pancakes.png"/>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className={this.props.enlarged ? 'jcard_enlarged' : 'jcard'} onClick={this.props.onClick}>
                            <div className="jcard_prompt">
                                {this.props.text}
                            </div>
                        </div>
                    );
                }
        }
    }
}