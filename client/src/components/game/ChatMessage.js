import React from "react";

import "../../css/chat.css";

export default class ChatMessage extends React.Component {
    render() {
        let tightRowClasses = ["messageRow-tight"];
        if(this.props.sender === this.props.userId) {
            tightRowClasses.push("message-sent-from-self");
        } else {
            tightRowClasses.push("message-sent-from-other");
        }
        if(this.props.sender !== this.props.previousSender) {
            tightRowClasses.push("message-first-in-group");
        }
        if(this.props.sender !== this.props.nextSender) {
            tightRowClasses.push("message-last-in-group");
        }
        return (
            <div className="messageRow-outer">
                <div className={tightRowClasses.join(" ")}>
                    <div className="messageRow-left">
                        <div className="message-avatar-outer">
                            <img className="message-avatar-inner" src={this.props.playerMap[this.props.sender].avatar}/>
                        </div>
                    </div>
                    <div className="messageRow-right">
                        <div className="messageRow-inner">
                            <p className="message"> {this.props.message} </p>
                        </div>
                    </div>
                </div>
            </div>
            );
    }
}