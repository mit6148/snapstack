import React from "react";
import NavButtons from "../nav/NavButtons";
import Card from "../univ/Card.js";
import "../../css/about.css";
import "../../css/profile.css";

export default class About extends React.Component {
    render() {
        return (
            <div className="about_page">
            	<NavButtons appState={this.props.appState} page='About' />
                <h1> About </h1>

                <h2> Get to know the SnapStack team!</h2>

                <div className="snapstack_team">
                	<div className="member">
            			  <div className="circle_picture_container">
                			<img className="profile_pic" src="/chris.jpg"/>
                		</div>	
                		<h3>
                			Chris Chang
               			</h3>
               			<div className="member_bio">
               				Lead Front-End Engineer
               			</div>
                	</div>

                	<div className="member">
            			<div className="circle_picture_container">
                			<img className="profile_pic" src="/melody.jpg"/>
                		</div>	
                		<h3>
                			Melody Phu
               			</h3>
               			<div className="member_bio">
               				Lead UI/UX Designer
               			</div>
                	</div>

                	<div className="member">
            			<div className="circle_picture_container">
                			<img className="profile_pic" src="/nikhil.jpg"/>
                		</div>	
                		<h3>
                			Nik Singhal
               			</h3>
               			<div className="member_bio">
               				Lead Back-End Engineer
               			</div>
                	</div>

                </div>

            </div>
        );
    }
}