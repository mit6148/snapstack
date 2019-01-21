import React, { Component } from "react";

export default class Caption extends Component {
    render() {
        return (
            <div>
                {this.props.text}
            </div>
        );
    }
}