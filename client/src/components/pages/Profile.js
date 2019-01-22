import React from "react";
import NavButtons from "../nav/NavButtons";
import Card from "../univ/Card.js";

import "../../css/profile.css";

export default class Profile extends React.Component {
    render() {
        return ( //Todo, work on modals for Edit and Cards!
            <div className="profile_text profile_page">
            	<NavButtons appState={this.props.appState} page='Profile' profileId={this.props.id} logout={this.props.logout} />
                <h1> Profile </h1>

                <h2> About Me </h2>
                <div className="about_me">
	                <div className="picture_container">
	                	<img className="profile_pic" src="/pancakes.jpg"/>
	                </div>

	                <div className="user_name">
	                	First Last
	                </div>

	                <div className="user_description">
	                	User Description
	                </div>

	                <div className="edit_btn"> 
	                	Edit
	                </div>
	            </div>

	            <h2> Social Media </h2>
	            <div className="social_media">
	            	<div className="social_media_link">
	            		Facebook
	            	</div>
	            	<div className="edit_btn">
	            		Edit
	            	</div>
	            </div>
                
              	<h2> My Snapstack </h2>
              	<div className="saved_cards">
              		<Card faceup={true} zoome={false}>
              		</Card>
              	</div>

            </div>
        );
    }
}