import React from "react";

// WIDTH and HEIGHT are dimensions of final image produced and of the view canvas
import {IMAGE_WIDTH, IMAGE_HEIGHT, drawingMode, MAX_OVERZOOM, IMAGE_COMPRESSION_OPTION} from "../../../../config";

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
            this.zoomLevel = this.maxZoomLevel; // most zoomed out
            this.isReady = true;
            this.redraw();
        }
        this.image.src = this.props.image;
    }

    zoom = fraction => {
        this.zoomLevel = 1 + (this.maxZoomLevel - 1) * fraction;
        const [visibleWidth, visibleHeight] = this.getVisibleDims();
        this.viewCenterX = Math.min(Math.max(visibleWidth / 2, this.viewCenterX),
                                    this.hiddenCanvas.width - visibleWidth / 2);
        this.viewCenterY = Math.min(Math.max(visibleHeight / 2, this.viewCenterY),
                                    this.hiddenCanvas.height - visibleHeight / 2);
        this.redraw();
    };

    getVisibleDims = () => {
        return [IMAGE_WIDTH * this.zoomLevel, IMAGE_HEIGHT * this.zoomLevel]; // amount of hidden canvas to show
    };

    getImage = () => {
        if(!this.isReady || !this.viewCanvas) {
            throw "image not ready";
        } else {
            return this.viewCanvas.toDataURL("image/jpg", IMAGE_COMPRESSION_OPTION);
        }
    };

    render() {
        return (
            <canvas className="canvas-image-editor"
                    width={IMAGE_WIDTH}
                    height={IMAGE_HEIGHT}
                    ref={this.saveViewCanvas} />
            );
    }

    saveViewCanvas = (viewCanvas) => {
        console.log("save view canvas");
        if(!viewCanvas) {
            console.log("no canvas");
            return;
        }
        this.viewCanvas = viewCanvas;
        this.viewContext = this.viewCanvas.getContext("2d");
        this.redraw();
    };

    redraw = () => {
        if(!this.isReady || !this.viewCanvas) {
            return; // can't draw yet
        }
        const [visibleWidth, visibleHeight] = this.getVisibleDims();
        this.viewContext.drawImage(this.hiddenCanvas,
            this.viewCenterX - visibleWidth / 2,
            this.viewCenterY - visibleHeight / 2,
            visibleWidth,
            visibleHeight,
            0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    };
};