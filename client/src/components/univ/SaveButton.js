import React, { Component } from "react";

export default class SaveButton extends Component {
    render() {
        return (
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
        );
    }
}