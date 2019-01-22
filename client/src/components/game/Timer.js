import React from "react";

export default class Timer extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            current: new Date().getTime()
        };

        this.interval = setInterval(() => this.setState({current: new Date().getTime()}), 7);
    }

    render() {
        let ms = max(this.props.end - this.state.current, 0);
        if (ms === 0) {
            clearInterval(this.interval);
        }
        let minutes = ms / 60000;
        ms %= 60000;
        let seconds = ('0' + ms / 1000).slice(-2);
        ms = ('00' + ms).slice(-3);

        return (
            <div>
                {minutes + ':' + seconds + '.' + ms}
            </div>
        );
    }
}