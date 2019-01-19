import React from "react";
import NavButtons from "../nav/NavButtons";

export default class About extends React.Component {
    render() {
        return (
            <div>
            	<NavButtons page='About' />
                <p><strong>We are the 18.600 Cuddle Buddies &lt;3</strong></p>
            </div>
        );
    }
}