import React, { Component } from "react";

export default class Image extends Component {
    constructor(props) {
        super(props);

        // fetch('/api/image', {'_id': this.props.imageId})
        // .then(image => {
        //     this.setState({
        //         image: image
        //     });
        // });
    }

    render() {
        let src = this.props.src === null ? '/pancakes.jpg' : this.props.src.substring(this.props.src.indexOf(',') + 1);
        return (
            <div>
                <img src={src} />
            </div>
        );
    }
}