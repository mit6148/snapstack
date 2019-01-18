import React, { Component } from "react";

export default class Image extends Component {
    constructor(props) {
        super(props)

        fetch('/api/image', {'_id': this.props.imageId})
        .then(image => {
            this.state.image = image;
        });
    }

    render() {
        return (
            <div>
                <img src={'data:image/jpeg;base64' + this.state.image.toString('base64')}/>
            </div>
        );
    }
}