import React from "react";

import ChatMessage from "./ChatMessage";

import "../../css/chat.css";

import {LAZY_B_ID} from "../../../../config";

export default class Chat extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            minimized: false,
            unread: 0,
            messages: [["test message asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf", LAZY_B_ID], ["my message", this.props.userId]] // pairs of form [message, sender name]
        }
    }

    render() {
        return (
            <div className="chatLayer">
                <div className="chatColumn">
                    <div className="chatBox">
                        <div className="chatBox-titleBar">
                            {
                                "Game Chat" + (this.state.unread > 0 ? (" (" + this.state.unread + ")") : "")
                            }
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
                </div>
            </div>
        );
    }
}