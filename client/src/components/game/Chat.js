import React from "react";

import ChatMessage from "./ChatMessage";

import "../../css/chat.css";

import {LAZY_B_ID} from "../../../../config";

export default class Chat extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            minimized: false,
        }
    }

    onPressEnter = event => {
        event.preventDefault();
        if(event.keyCode === 13) {
            this.trySendChat();
        }
    };

    trySendChat = () => {
        const text = this.textInput.value;
        if(text) {
            // don't send empty chat
            this.props.sendChat(text);
            this.textInput.value = '';
        }
    };

    saveInput = (input) => {
        this.textInput = input;
    }

    saveHistory = history => {
        this.history = history;
    }

    scrollToBottom = () => {
        if(this.history) {
            this.history.scrollTop = this.history.scrollHeight;
            console.log("scrolling to bottom");
        }
    }

    toggleMinimized = () => {
        this.setState({minimized: !this.state.minimized});
    }

    render() {

        return (
            <div className={
                "chatBox" + (this.state.minimized ? " chatBox-minimized" : "")
                }>
                <div className="chatBox-titleBar" onClick={this.toggleMinimized}>
                    <div className="chatBox-titleBar-text"> Game Chat </div>
                    <div className="chatBox-titleBar-minimizeButton"></div>
                </div>
                <div className="chatBox-history" ref={this.saveHistory}>
                    {
                        this.props.chatMessages.map((pair, index) => (
                                <ChatMessage
                                    message={pair[0]}
                                    sender={pair[1]}
                                    previousSender={(this.props.chatMessages[index - 1] || [])[1]}
                                    nextSender={(this.props.chatMessages[index + 1] || [])[1]}
                                    playerMap={this.props.playerMap}
                                    userId={this.props.userId}
                                    key={index}
                                    onMount={this.scrollToBottom}
                                    />
                            ))
                    }
                </div>
                <div className="chatBox-entry">
                    <input type="text" autoComplete="off" className="chatBox-textEntry" ref={this.saveInput}
                            placeholder="Type to chat..." onKeyUp={this.onPressEnter}/>
                    <div className="chatBox-sendButton" onClick={this.trySendChat}>
                        <div className="chatBox-sendButton-text"> Send </div>
                    </div>
                </div>
            </div>
        );
    }
}