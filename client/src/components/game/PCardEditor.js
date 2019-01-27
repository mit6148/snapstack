import React from "react";

import ImageEditor from "./ImageEditor";

import {MAX_CAPTION_LENGTH} from "../../../../config";

export default class PCardEditor extends React.Component {
    constructor(props) {
        super(props);

        this.imageEditor = React.createRef();
    }


    render() {
        return (
            <div>
                <div style={{width: "86px", height: "98px"}}>
                    <ImageEditor image={this.props.image} ref={this.imageEditor}/>
                </div>
                <input id="caption-input" type="text" maxLength={MAX_CAPTION_LENGTH} autoComplete="off"/>
                <div onClick={this.submit}>Submit</div>
            </div>
        );
    }


    submit = () => {
        try {
            this.props.submit(this.imageEditor.current.getImage(), document.getElementById('caption-input').value);
        } catch(err) {
            console.log("submit failed: " + err);
        }
    }


}