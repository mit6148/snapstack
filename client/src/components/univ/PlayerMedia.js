import React from "react";

export default class PlayerMedia extends React.Component {
    render() {
        return (
            <div className="player_media">
				<div className={"fab fa-facebook-square fb_btn" + (this.props.media.fb ? "" : " media-missing")}
                        onClick={this.redirectFB}></div>
                <div className={"fab fa-instagram insta_btn" + (this.props.media.insta ? "" : " media-missing")}
                        onClick={this.redirectInsta}></div>

            </div>
        );
    }

    redirectFB = () => {
        if(this.props.media.fb) {
            window.open(this.props.media.fb, '_blank');
        }
    };

    redirectInsta = () => {
        if(this.props.media.insta) {
            window.open("https://www.instagram.com/" + this.props.media.insta, '_blank');
        }
    }
}