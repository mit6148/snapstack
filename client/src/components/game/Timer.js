import React from "react";

import "../../css/game.css";

export default class Timer extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            current: new Date().getTime()
        };

        this.interval = setInterval(() => this.setState({current: new Date().getTime()}), 7);
    }

    render() {
        let ms = Math.max(this.props.end - this.state.current, 0);
        if (ms === 0) {
            clearInterval(this.interval);
        }
        let minutes = Math.floor(ms / 60000);
        ms %= 60000;
        let seconds = ('0' + Math.floor(ms / 1000)).slice(-2);
        ms = ('00' + ms).slice(-3);
        return (
            <div className="timer">
                {minutes+':'+seconds+(false ? ('.'+ms) : '')}
            </div>
        );
    }
}