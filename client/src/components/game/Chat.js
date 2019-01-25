import React from "react";

import "../../css/game.css";

export default class Timer extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            minimized: false,
            unread: 0,
            messages: [] // pairs of form [message, sender _id]
        }
    }

    render() {
        return (
            <div className="chatBox">
                <div className="chatBox-titleBar">
                    {"Game Chat" + (this.state.unread > 0 : " (" + this.state.unread + ")" : "")}
                </div>
                <div className="chatBox-history">
                    {
                        this.state.messages.map()
                    }
                </div>
                <div className="chatBox-entry">
                </div>
            </div>
        );
    }
}