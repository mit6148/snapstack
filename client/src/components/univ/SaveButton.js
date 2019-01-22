import React, { Component } from "react";
import { saveStates } from "../../../../config.js";
const { UNSAVED, SAVING, SAVED } = saveStates;

export default class SaveButton extends Component {
    render() {
        switch (this.props.saveState) {
            UNSAVED:
                return (
                    <div onClick={this.props.save}>Save</div>
                );
            SAVING:
                return (
                    <div>Saving</div>
                );
            SAVED:
                return (
                    <div>Saved!</div>
                );
        }
    }
}