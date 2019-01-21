import React from "react";

export default class PlayerMedia extends React.Component {
    render() {
        return (
            <div>
                <a href={this.props.media.fb}></a>
                <a href={this.props.media.insta}></a>
            </div>
        );
    }
}