import React from "react";
import PlayerListCell from "./PlayerListCell";

import "../../css/player.css";

export default class PlayerList extends React.Component {
    render() {
        return (
            <div className="player_list">
                {this.props.players.map(player => (
                    <PlayerListCell player={player} key={player._id} />
                ))}
            </div>
        );
    }
}