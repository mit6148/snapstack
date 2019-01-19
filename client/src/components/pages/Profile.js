import React from "react";
import NavButtons from "../nav/NavButtons";

export default class Profile extends React.Component {
    render() {
        return (
            <div>
            	<NavButtons appState={this.props.appState} page='Profile' profileId={this.props.id} logout={this.props.logout} />
                Profile
            </div>
        );
    }
}