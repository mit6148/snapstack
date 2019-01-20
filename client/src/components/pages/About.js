import React from "react";
import NavButtons from "../nav/NavButtons";

import "../../css/about.css";

export default class About extends React.Component {
    render() {
        return (
            <div className="about_page">
            	<NavButtons appState={this.props.appState} page='About' />
                <p><strong>We are the 18.600 Cuddle Buddies &lt;3</strong></p>
            </div>
        );
    }
}