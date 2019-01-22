import React from "react";

export default class PlayerMedia extends React.Component {
    render() {
        return (
            <div className="player_media">
            	<div className="fb_btn">
					<div className="fab fa-facebook-square media_btn fb_logo" href={this.props.media.fb}></div>
                </div>

                <div className="insta_btn">
                	<div className="fab fa-instagram media_btn insta_logo" href={this.props.media.insta}></div>
                </div>
            </div>
        );
    }
}