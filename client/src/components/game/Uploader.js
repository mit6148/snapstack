import React from "react";

export default class Uploader extends React.Component {
    constructor (props) {
        super(props);

        // let r = new FileReader();
        // r.readAsDataURL('~/Pictures/Avatar.jpg');
        // r.onloadend = this.setState({
        //     image: r.result
        // });
    }

    render() {
        return (
            <div>
                <div onClick={() => this.props.upload(this.props.fakeImage)}>Upload</div>
            </div>
        );
    }
}