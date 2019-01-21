import React from "react";
import PlayerMedia from "./PlayerMedia";

export default class PlayerInfo extends React.Component {
    render() {
        return (
            <div>
                <div>
                    {this.props.avatar}
                </div>
                <div>
                    {this.props.name}
                </div>
                <div>
                    <PlayerMedia media={this.props.media} />
                </div>
            </div>
        );
    }
}