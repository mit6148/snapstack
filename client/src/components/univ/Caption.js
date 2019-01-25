import React, { Component } from "react";

export default class Caption extends Component {
    render() {
        return (
            <div>
                {this.props.text}
                {this.props.creatorId ? (
                    <Link to={'/profile/'+this.props.creatorId}>{' — '+this.props.creator}</Link>
                ) : null}
            </div>
        );
    }
}