import React from "react";
import NavButtons from "../nav/NavButtons";
import Card from "../univ/Card.js";
import PlayerMedia from "../univ/PlayerMedia.js";

import "../../css/profile.css";
import "../../css/player.css";

export default class Profile extends React.Component {
    render() {
        return ( //Todo, work on modals for Edit and Cards!
            <div className="profile_text profile_page">
	            <NavButtons appState={this.props.appState} page='Profile' profileId={this.props.id} logout={this.props.logout} />

	            <div className="profile_container">
	            	<div className="my_profile">

	            		<div className="photo_section">
            			  	<div className="circle_picture_container">
                				<img className="profile_picture" src="/pancakes.jpg"/>
                			</div>
                			<div className='edit_btn'>
            					Edit
            				</div>
            			</div>

	                	<div className="info_section">
	            		    <div className="profile_name">
                				<h2> Melody Phu </h2>
                			</div>	
                			<div className="profile_description">
                				Hi, welcome to SnapStack! The profile is still a work in progress,
                				so thank you for your patience as we improve it :D xoxo, the SnapStack team
                			</div>
	            			<div className='edit_btn'>
	            				Edit
	            			</div>
	            		</div>
	            	</div>

	            	<div className="my_snapstack">
	            		<h2> My SnapStack </h2>
	            		<div className="saved_cards">
	            			<div className="square_picture_container">
	            				<img src="/chris.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/melody.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/nikhil.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/chris.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/melody.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/nikhil.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/chris.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/melody.jpg"/>
	            			</div>
	            			<div className="square_picture_container">
	            				<img src="/nikhil.jpg"/>
	            			</div>
	            		</div>
	            	</div>
	            </div>
           	</div>
        );
    }
}