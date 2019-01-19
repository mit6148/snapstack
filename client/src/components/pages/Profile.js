import React from "react";
import NavButtons from "../nav/NavButtons";

export default class Profile extends React.Component {
    render() {
        return (
            <div>
            	<NavButtons page='Profile' params={this.props.match.params} logout={this.props.logout} />
                Profile
            </div>
        );
    }
}