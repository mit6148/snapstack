import React from "react";

export default class Uploader extends React.Component {
    render() {
        return (
            <div>
                <div onClick={() => this.props.upload('/pancakes.jpg')}></div>
            </div>
        );
    }
}