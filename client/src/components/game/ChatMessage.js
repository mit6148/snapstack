import React from "react";

import "../../css/chat.css";

export default class ChatMessage extends React.Component {
    render() {
        return <div>{this.props.message}</div>
    }
}