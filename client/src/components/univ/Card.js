import React, { Component } from "react";

export default class Card extends Component {
    constructor(props) { // type {J, P}, faceup (Boolean), cardId; enlarged, [flipStatus]
        super(props)
        if (this.props.faceup === undefined) this.props.faceup = true;
    }

    render() {
        if (this.props.faceup) {
            return (
                {null}
            );
        }
        else {
            return (
                {this.props.type == 'J' ? null : null}
            );
        }
    }
}