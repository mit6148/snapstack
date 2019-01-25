import React from "react";

export default class PCardEditor extends React.Component {
    render() {
        return (
            <div>
                <img src={this.props.image} />
                <input id="caption-input" type="text" />
                <div onClick={() => this.submit(this.props.image, document.getElementById('caption-input').value)}>Submit</div>
            </div>
        );
    }

    submit = (image, text) => {
        this.props.submit(image, text);
        this.props.onClose();
    }
}