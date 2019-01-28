import React from "react";

import ImageEditor from "./ImageEditor";

import {MAX_CAPTION_LENGTH, drawingMode} from "../../../../config";

export default class PCardEditor extends React.Component {
    constructor(props) {
        super(props);

        this.imageEditor = React.createRef();
        this.zoomSlider = React.createRef();
        this.colorPicker = React.createRef();

        this.state = {
            color: "#000000",
            isDrawing: false
        }
    }


    render() {
        return (
            <div style={{"backgroundColor": "blue" }}>
                <div style={{width: "86px", height: "98px"}}>
                    <ImageEditor image={this.props.image} ref={this.imageEditor}
                            mode={this.state.isDrawing ? drawingMode.DRAW : drawingMode.MOVE}
                            color={this.state.color}
                        />
                </div>
                <input id="caption-input" type="text" maxLength={MAX_CAPTION_LENGTH} autoComplete="off"/>
                <div onClick={this.submit}>Submit</div>
                <input type="range" min="0" max="1" defaultValue="1" step="any"
                        onChange={this.zoom} onInput={this.zoom} ref={this.zoomSlider}/>
                <input type="color" defaultValue="#000000"
                        onChange={this.pickColor} onInput={this.pickColor} ref={this.colorPicker}/>
                <input type="button" value="Move mode" onClick={this.moveMode} />
                <input type="button" value="Draw mode" onClick={this.drawMode} />
            </div>
        );
    }

    moveMode = e => {
        this.setState({
            isDrawing: false
        });
    };

    drawMode = e => {
        this.setState({
            isDrawing: true
        });
    };

    pickColor = e => {
        this.setState({
            color: this.colorPicker.current.value
        });
    };

    zoom = e => {
        this.imageEditor.current.zoom(parseFloat(this.zoomSlider.current.value));
        return e;
    };


    submit = () => {
        try {
            this.props.submit(this.imageEditor.current.getImage(), document.getElementById('caption-input').value);
        } catch(err) {
            console.log("submit failed: " + err);
        }
    };


}