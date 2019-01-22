import React from "react";

export default class PlayerMedia extends React.Component {
    render() {
        return (
            <div className="player_media">
				<div className="fab fa-facebook-square fb_btn" href={this.props.media.fb}></div>
                <div className="fab fa-instagram insta_btn" href={this.props.media.insta}></div>

            </div>
        );
    }
}