import React from "react";

import ImageEditor from "./ImageEditor";

export default class PCardEditor extends React.Component {
    render() {
        this.imageEditor = (
            <ImageEditor image={this.props.image} />
            );


        return (
            <div>
                <div style={{width: "200px", height: "200px"}}>
                    {this.imageEditor}
                </div>
                <input id="caption-input" type="text" />
                <div onClick={this.submit}>Submit</div>
            </div>
        );
    }


    submit = () => {
        try {
            this.props.submit(this.imageEditor.getImage(), document.getElementById('caption-input').value);
        } catch(err) {
            console.log("submit failed: " + err);
        }
    }


}