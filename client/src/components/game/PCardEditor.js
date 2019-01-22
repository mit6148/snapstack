import React from "react";

export default class PCardEditor extends React.Component {
    render() {
        return (
            <div>
                <img src={this.props.image} />
                bunbunbun
                <div onClick={() => this.submit(this.props.image, 'bunbunbun')}>Submit</div>
            </div>
        );
    }

    submit = (image, text) => {
        this.props.submit(image, text);
        this.props.onClose();
    }
}