import React from "react";
import PlayerMedia from "./PlayerMedia";

import "../../css/player.css";

export default class PlayerInfo extends React.Component {
   

    render() {
        return (
            <div className={"player_info" + (this.props.connected ? "" : " gray-out")}>
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
                        <div className="score">
                            <div className="score_icon">
                                <img src="/card_icon.png"/>
                            </div>
                            <div className="player_score">
                                {this.props.score}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

//Cards by Adrien Coquet from the Noun Project (card icon!)