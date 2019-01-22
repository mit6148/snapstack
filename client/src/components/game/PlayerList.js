import React from "react";
import PlayerListCell from "./PlayerListCell";

export default class PlayerList extends React.Component {
    render() {
        return (
            <div>
                Players
                {this.props.players.map(player => (
                    <PlayerListCell player={player} key={player._id} />
                ))}
            </div>
        );
    }
}