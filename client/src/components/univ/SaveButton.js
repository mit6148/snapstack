import React, { Component } from "react";
import { saveStates } from "../../../../config.js";
const { UNSAVED, SAVING, SAVED } = saveStates;

import "../../css/card.css";

export default class SaveButton extends Component {
    render() {
        switch (this.props.saveState) {
            case UNSAVED:
                return (
                    <div className="fas fa-plus" id="unsaved_status_btn" onClick={this.props.save}></div>
                );
            case SAVING:
                return (
                    <div className="lds-spinner" id="saving_status_btn"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                );
            case SAVED:
                return (
                    <div className="fas fa-check" id="saved_status_btn"></div>
                );
            default:
                return (
                    <div> Error! </div>
                )

        }
    }
}