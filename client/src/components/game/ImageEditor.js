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
            this.startPosition = null; // screen coords for move, hidden canvas coords for draw, draw is last position
            this.mouseDownCenter = null;
        }
        this.image.src = this.props.image;
    }

    zoom = fraction => {
        this.zoomLevel = 1 + (this.maxZoomLevel - 1) * fraction;
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


    clientToHiddenCoords = (x, y) => {
        const rect = this.viewCanvas.getBoundingClientRect();
        const viewXProp = Math.min(Math.max(0, x - rect.left), rect.width) / rect.width;
        const viewYProp = Math.min(Math.max(0, y - rect.top), rect.height) / rect.height;

        const [visibleWidth, visibleHeight] = this.getVisibleDims();
        const hiddenX = this.viewCenterX + visibleWidth * (viewXProp - 0.5);
        const hiddenY = this.viewCenterY + visibleHeight * (viewYProp - 0.5);
        console.log(hiddenX, hiddenY);
        return [hiddenX, hiddenY];
    };

    localMouseDown = e => {
        if(this.props.mode === drawingMode.MOVE) {
            this.startPosition = [e.screenX, e.screenY];
        } else {
            this.startPosition = this.clientToHiddenCoords(e.clientX, e.clientY);
            this.hiddenContext.moveTo(this.startPosition[0], this.startPosition[1]);
        }
        this.mouseDownCenter = [this.viewCenterX, this.viewCenterY];
        e.stopPropagation();
    };

    globalMouseUp = e => {
        this.startPosition = null;
        this.mouseDownCenter = null;
    };

    localMouseMove = e => {
        if(!this.mouseDownCenter || !this.startPosition || this.props.mode !== drawingMode.DRAW) {
            return; // not drawing
        }
        e.stopPropagation();

        const newLoc = this.clientToHiddenCoords(e.clientX, e.clientY);

        this.hiddenContext.strokeStyle = this.props.color;
        this.hiddenContext.lineWidth = 5 * this.zoomLevel;
        this.hiddenContext.lineTo(newLoc[0], newLoc[1]);
        this.hiddenContext.stroke();
        this.redraw();
    };

    globalMouseMove = e => {
        if(!this.mouseDownCenter || !this.startPosition || this.props.mode !== drawingMode.MOVE) {
            return; // not dragging
        }
        e.stopPropagation();
        const mouseDisplacement = [e.screenX - this.startPosition[0],
                                    e.screenY - this.startPosition[1]];
        this.viewCenterX = this.mouseDownCenter[0] - mouseDisplacement[0] * this.zoomLevel;
        this.viewCenterY = this.mouseDownCenter[1] - mouseDisplacement[1] * this.zoomLevel;
        this.redraw();
    };

    render() {
        return (
            <canvas className="canvas-image-editor"
                    width={IMAGE_WIDTH}
                    height={IMAGE_HEIGHT}
                    ref={this.saveViewCanvas}
                    onMouseDown={this.localMouseDown}
                    onMouseMove={this.localMouseMove}
                     />
            );
    }

    componentDidMount() {
        document.addEventListener('mousemove', this.globalMouseMove);
        document.addEventListener('mouseup', this.globalMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.globalMouseMove);
        document.removeEventListener('mouseup', this.globalMouseUp);
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

        // make sure view is still within image
        this.viewCenterX = Math.min(Math.max(visibleWidth / 2, this.viewCenterX),
                                    this.hiddenCanvas.width - visibleWidth / 2);
        this.viewCenterY = Math.min(Math.max(visibleHeight / 2, this.viewCenterY),
                                    this.hiddenCanvas.height - visibleHeight / 2);

        this.viewContext.drawImage(this.hiddenCanvas,
            this.viewCenterX - visibleWidth / 2,
            this.viewCenterY - visibleHeight / 2,
            visibleWidth,
            visibleHeight,
            0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    };
};