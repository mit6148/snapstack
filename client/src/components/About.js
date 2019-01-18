import React from "react";

export default class About extends React.Component {
    render() {
        return (
            <div>
                <NavButtons appState={this.props.appState} page="about" />
                <p><strong>We are the 18.600 Cuddle Buddies &lt;3</strong></p>
            </div>
        );
    }
}