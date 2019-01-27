import React from "react";

import ImageEditor from "./ImageEditor";

import {MAX_CAPTION_LENGTH} from "../../../../config";

export default class PCardEditor extends React.Component {
    constructor(props) {
        super(props);

        this.imageEditor = React.createRef();
        this.zoomSlider = React.createRef();
    }


    render() {
        return (
            <div style={{"backgroundColor": "blue" }}>
                <div style={{width: "86px", height: "98px"}}>
                    <ImageEditor image={this.props.image} ref={this.imageEditor}/>
                </div>
                <input id="caption-input" type="text" maxLength={MAX_CAPTION_LENGTH} autoComplete="off"/>
                <div onClick={this.submit}>Submit</div>
                <input type="range" min="0" max="1" defaultValue="1" step="any"
                        onChange={this.zoom} onInput={this.zoom} ref={this.zoomSlider}/>
            </div>
        );
    }

    zoom = e => {
        this.imageEditor.current.zoom(parseFloat(this.zoomSlider.current.value));
        return e;
    }


    submit = () => {
        try {
            this.props.submit(this.imageEditor.current.getImage(), document.getElementById('caption-input').value);
        } catch(err) {
            console.log("submit failed: " + err);
        }
    }


}