import React, { Component } from "react";
import Link from "react-router-dom/es/Link";

export default class Caption extends Component {
    render() {
        return (
            <div>
                {this.props.text}
                {this.props.creatorId && this.props.creatorId !== this.props.userId ? (
                    <React.Fragment>
                        <span>  —  </span>
                        <Link to={'/profile/'+this.props.creatorId}>{this.props.creator}</Link>
                    </React.Fragment>
                ) : null}
            </div>
        );
    }
}