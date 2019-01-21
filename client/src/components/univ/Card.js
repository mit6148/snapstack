import React, { Component } from "react";
import Image from "./Image";
import Caption from "./Caption";

export default class Card extends Component {
    constructor(props) { // type {J, P}, faceup (Boolean), cardId; enlarged, [flipStatus]
        super(props)
        if (this.props.faceup === undefined) this.props.faceup = true;
    }

    render() {
        if (this.props.faceup) {
            return (
                <div>
                    <Image />
                    <Caption text=':chrissexy:'/>
                </div>
            );
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