import React, { Component } from "react";
import { saveStates } from "../../../../config.js";
const { UNSAVED, SAVING, SAVED } = saveStates;

import "../../css/card.css";

export default class SaveButton extends Component {
    render() {
        switch (this.props.saveState) {
            case UNSAVED:
                return (
                    <div class="fas fa-plus" id="unsaved_status_btn" onClick={this.props.save}></div>
                );
            case SAVED:
                return (
                    <div class="lds-spinner" id="saving_status_btn"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                );
            case SAVING:
                return (
                    <div class="fas fa-check" id="saved_status_btn"></div>
                );
            default:
                return (
                    <div> Error! </div>
                )

        }
    }
}