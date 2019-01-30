import React, { Component } from "react";
import textFit from 'textfit';
import Image from "./Image";
import Caption from "./Caption";
import Modal from "./Modal";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/card.css";

export default class JCard extends Component {
    constructor(props) {
        super(props);

        this.key = Math.floor(Math.random() * 100);
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        textFit(document.getElementsByClassName('fit'+this.key), {alignHoriz: true, alignVert: true, minFontSize: 8, maxFontSize: 16, multiLine: true});
    }

    render() {
        if (this.props.src === NO_CARD) {
            return (
                <div className='jcard_empty' onClick={this.props.onClick}></div>
            );
        } else if ([CARDBACK, FACEDOWN_CARD].includes(this.props.src)) {
            return (
                <div className='jcard_back' onClick={this.props.onClick}>
                    <div className='content'>
                        <img src='/pancakes.png' />
                    </div>
                </div>
            );
        } else if (this.props.src === LOADING_CARD) {
            return null;
        } else {
            return (
                <div className='flipcard' flipped={this.props.faceup !== false ? 'true' : 'false'}>
                    <div className='flipcard_inner'>
                        <div className='jcard_back' onClick={this.props.onClick}>
                            <div className='content'>
                                <img src='/pancakes.png' />
                            </div>
                        </div>
                        <div className='jcard' onClick={this.props.onClick}>
                            <div className='content'>
                                <div className={'fit_resize fit'+this.key}>
                                    {this.props.text}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}