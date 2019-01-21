import React from "react";
import NavButtons from "../nav/NavButtons";
import Card from "../univ/Card.js";

import "../../css/profile.css";

export default class Profile extends React.Component {
    render() {
        return (
            <div className="profile_page">
            	<NavButtons appState={this.props.appState} page='Profile' profileId={this.props.id} logout={this.props.logout} />
                <h1> Profile </h1>
            </div>
        );
    }
}