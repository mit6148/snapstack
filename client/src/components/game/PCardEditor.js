import React from "react";

import ImageEditor from "./ImageEditor";

export default class PCardEditor extends React.Component {
    render() {
        return (
            <div>
                <div style="width: 86px; height: 98px">
                    <ImageEditor image={this.props.image} />
                </div>
                <input id="caption-input" type="text" />
                <div onClick={() => this.props.submit(this.props.image, document.getElementById('caption-input').value)}>Submit</div>
            </div>
        );
    }
}