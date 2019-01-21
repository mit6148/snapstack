import React, { Component } from "react";

export default class Image extends Component {
    constructor(props) {
        super(props)

        this.state = {
            image: null
        };

        // fetch('/api/image', {'_id': this.props.imageId})
        // .then(image => {
        //     this.setState({
        //         image: image
        //     });
        // });
    }

    render() {
        return (
            <div>
                <img src='/pancakes.jpg' />
            </div>
        );
    }
}