import React, { Component } from "react";
import { saveStates } from "../../../../config.js";
const { UNSAVED, SAVING, SAVED } = saveStates;

import "../../css/card.css";

export default class SaveButton extends Component {
    render() {
        switch (this.props.saveState) {
            case UNSAVED:
                return (
                    <div class="fas fa-plus" onClick={this.props.save}>Save</div>
                );
            case SAVING:
                return (
                    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                );
            case SAVED:
                return (
                    <div class="fas fa-check saved_status_btn">Saved!</div>
                );
            default:
                return (
                    <div> Error! </div>
                )

        }
    }
}