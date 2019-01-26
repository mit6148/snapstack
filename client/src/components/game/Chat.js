import React from "react";

import ChatMessage from "./ChatMessage";

import "../../css/chat.css";

import {LAZY_B_ID} from "../../../../config";

export default class Chat extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            minimized: false,
            messages: [["test message asdf asdf asdf asdf", LAZY_B_ID], ["test message asdf asdf asdf asdf", LAZY_B_ID], ["my message", this.props.userId], ["my different message", this.props.userId], ["another message", this.props.userId], ["my different message", this.props.userId], ["my different message", this.props.userId]] // pairs of form [message, sender name]
        }
    }

    render() {
        return (
            <div className="chatBox">
                <div className="chatBox-titleBar">
                    <div className="chatBox-titleBar-text"> Game Chat </div>
                    <div className="chatBox-titleBar-minimizeButton"></div>
                </div>
                <div className="chatBox-history">
                    {
                        this.state.messages.map((pair, index) => (
                                <ChatMessage
                                    message={pair[0]}
                                    sender={pair[1]}
                                    previousSender={(this.state.messages[index - 1] || [])[1]}
                                    nextSender={(this.state.messages[index + 1] || [])[1]}
                                    playerMap={this.props.playerMap}
                                    userId={this.props.userId}
                                    key={index} />
                            ))
                    }
                </div>
                <div className="chatBox-entry">
                    {/*TODO*/}
                </div>
            </div>
        );
    }
}