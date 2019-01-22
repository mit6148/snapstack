import React, { Component } from "react";
import { saveStates } from "../../../../config.js";
const { UNSAVED, SAVING, SAVED } = saveStates;

export default class SaveButton extends Component {
    render() {
        switch (this.props.saveState) {
            case UNSAVED:
                return (
                    <div onClick={this.props.save}>Save</div>
                );
            case SAVING:
                return (
                    <div>Saving</div>
                );
            case SAVED:
                return (
                    <div>Saved!</div>
                );
        }
    }
}