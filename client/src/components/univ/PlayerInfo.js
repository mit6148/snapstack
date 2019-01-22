import React from "react";
import PlayerMedia from "./PlayerMedia";

import "../../css/player.css";

export default class PlayerInfo extends React.Component {
    render() {
        return (
            <div className="player_info">
                <div className="avatar_container">
                    <div className="cropped_avatar">
                        <img src={this.props.avatar}></img>
                    </div>
                </div>
                <div className="player_details">
                    <div className="user_name">
                        {this.props.name}
                    </div>
                    <div className="player_other">
                        <PlayerMedia media={this.props.media} />
                        <div className="player_score">
                            Score
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}