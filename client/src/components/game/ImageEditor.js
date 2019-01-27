import React from "react";

// WIDTH and HEIGHT are dimensions of final image produced and of the view canvas
import {IMAGE_WIDTH, IMAGE_HEIGHT, drawingMode, MAX_OVERZOOM} from "../../../../config";

import "../../css/imageEditor.css";

//NOTE: this component doesn't follow normal react styles due to efficiency concerns with setting state
// when the state is already taken care of by mutable canvas objects

// expects props: image, color, mode
export default class ImageEditor extends React.Component {

    constructor(props) {
        super(props);

        this.isReady = false; // while not ready, don't draw anything
        this.viewCanvas = null; // while null, can't draw anything

        const minWidth = IMAGE_WIDTH * MAX_OVERZOOM;
        const minHeight = IMAGE_WIDTH * MAX_OVERZOOM;
        this.image = new Image();
        this.image.onload = () => {
            let width = this.image.width;
            let height = this.image.height;
            let scaleUp = 1;
            if(width < minWidth || height < minHeight) {
                scaleUp = Math.max(minWidth / width, minHeight / height);
                width = Math.round(width * scaleUp);
                height = Math.round(height * scaleUp);
            }
            this.hiddenCanvas = document.createElement("canvas");
            this.hiddenCanvas.width = width;
            this.hiddenCanvas.height = height;
            this.hiddenContext = this.hiddenCanvas.getContext("2d");
            this.hiddenContext.drawImage(this.image, 0, 0, width, height);
            this.viewCenterX = width / 2;
            this.viewCenterY = height / 2;
            this.maxZoomLevel = Math.min(width / IMAGE_WIDTH, height / IMAGE_HEIGHT);
            this.zoomLevel = maxZoomLevel; // most zoomed out
            this.isReady = true;
            this.redraw();
        }
        this.image.src = this.props.image;
    }

    render() {
        return (
            <canvas className="canvas-image-editor"
                    width={IMAGE_WIDTH}
                    height={IMAGE_HEIGHT}
                    ref={this.saveViewCanvas} />
            );
    }

    saveViewCanvas = (viewCanvas) => {
        this.viewCanvas = viewCanvas;
        this.viewContext = this.viewCanvas.getContext("2d");
        this.redraw();
    };

    redraw = () => {
        if(!this.isReady || !this.viewCanvas) {
            return; // can't draw yet
        }
        const visibleWidth = IMAGE_WIDTH * this.zoomLevel; // amount of hidden canvas to show
        const visibleHeight = IMAGE_HEIGHT * this.zoomLevel;
        this.viewContext.drawImage(this.hiddenCanvas,
            this.viewCenterX - visibleWidth / 2,
            this.viewCenterY - visibleHeight / 2,
            visibleWidth,
            visibleHeight,
            0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    };
};