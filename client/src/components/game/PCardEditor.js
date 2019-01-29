import React from "react";

import ImageEditor from "./ImageEditor";

import {MAX_CAPTION_LENGTH, drawingMode} from "../../../../config";

import "../../css/card.css";
import "../../css/pCardEditor.css";

export default class PCardEditor extends React.Component {
    constructor(props) {
        super(props);

        this.imageEditor = React.createRef();
        this.zoomSlider = React.createRef();
        this.colorPicker = React.createRef();
        this.lineWidthSlider = React.createRef();

        this.state = {
            color: "#000000",
            isDrawing: false,
            lineWidth: 10
        }
    }

    render() {
        return (
            <div className='pcard_editor'>
                <input type="button" value="Pan" clicked={!this.state.isDrawing ? 'true' : 'false'} onClick={this.moveMode} />
                <input type="button" value="Draw" clicked={this.state.isDrawing ? 'true' : 'false'} onClick={this.drawMode} />
                {this.state.isDrawing ? (
                    <div className='draw_tools'>
                        <input id='color' type="color" defaultValue="#000000"
                            onChange={this.pickColor} onInput={this.pickColor} ref={this.colorPicker} />
                        <input id='pen_size' type="range" min="1" max="25" defaultValue="10" step="any"
                            onChange={this.changeLineWidth} onInput={this.changeLineWidth}
                            ref={this.lineWidthSlider} />
                        <div id='pen_preview' ref={this.makePenPreview} />
                    </div>
                ) : (
                    <div className='pan_tools'>
                        <span>Zoom</span>
                        <input id='zoom' type="range" min="0" max="1" defaultValue="1" step="any"
                            onChange={this.zoom} onInput={this.zoom} ref={this.zoomSlider} />
                    </div>
                )}
                <div className='pmodal_edit_card_bin'>
                    <div className='card_slot'>
                        <div className='card_area'>
                            <div className='pcard_editing'>
                                <div className='image_content'>
                                    <ImageEditor    image={this.props.image}
                                                    ref={this.imageEditor}
                                                    mode={this.state.isDrawing ? drawingMode.DRAW : drawingMode.MOVE}
                                                    color={this.state.color}
                                                    lineWidth={this.state.lineWidth}/>
                                </div>
                                <div className='caption_content'>
                                    <textarea id="caption-input" maxLength={MAX_CAPTION_LENGTH} autoComplete="off" wrap="soft"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='submit_card_btn' onClick={this.submit}>Submit</div>
            </div>
        );
    }

    makePenPreview = ref => {
        if (!ref) return;
        this.penPreview = ref;
        this.penPreview.style.width = (42/588*this.state.lineWidth)+'vh'; // TODO use config
        this.penPreview.style.height = (42/588*this.state.lineWidth)+'vh';
        this.penPreview.style.backgroundColor = this.state.color;
    }

    changeLineWidth = e => {
        this.setState({
            lineWidth: parseFloat(this.lineWidthSlider.current.value)
        });
        this.penPreview.style.width = (42/588*this.state.lineWidth)+'vh';
        this.penPreview.style.height = (42/588*this.state.lineWidth)+'vh';
    };

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
        this.penPreview.style.backgroundColor = this.state.color;
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