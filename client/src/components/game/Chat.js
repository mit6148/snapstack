import React from "react";

import "../../css/game.css";

export default class Timer extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            minimized: false,
            unread: 0,
            messages: [] // pairs of form [message, sender name]
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
                        this.state.messages.map((pair, index) => 
                                <ChatMessage message={pair[0]} sender={pair[1]} key={index} />
                            );
                    }
                </div>
                <div className="chatBox-entry">
                    <input /> {/*TODO*/}
                </div>
            </div>
        );
    }
}