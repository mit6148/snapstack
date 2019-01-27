import React from "react";

import "../../css/uploader.css";

export default class Uploader extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            formDragOver: false,
            inputHasFocus: false
        };

    }

    render() {
        return (
            <div id="dragndrop_box" className={this.state.formDragOver ? "is-dragover" : ""} onDrag={this.mute} onDragStart={this.mute}
                onDragEnd={this.endDrag} onDragOver={this.startDrag} onDragEnter={this.startDrag} onDragLeave={this.endDrag} onDrop={this.drop}>
                <input type="file" name="files[]" id="dragndrop_file_input" accept="image/*" className={this.state.inputHasFocus ? "has-focus" : ""}
                    onChange={this.clickUpload} onFocus={this.focusInput} onBlur={this.unfocusInput}/>
                <label htmlFor="dragndrop_file_input"><strong>Choose</strong> or drag an image.</label>
            </div>
        );
    }

    mute = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    startDrag = (e) => {
        this.mute(e);
        this.setState({formDragOver: true});
    };

    endDrag = (e) => {
        this.mute(e);
        this.setState({formDragOver: false});
    };

    drop = async (e) => {
        console.log("start drop");
        this.endDrag(e);
        const url = e.dataTransfer.getData("URL");
        try {
            if(url) {
                try {
                    const blob = await (await fetch(url, {
                        mode: "no-cors"
                    })).blob();
                    const image = await this.loadImage(blob);
                    this.props.upload(image);
                    return;
                } catch(err) {
                    console.log("initial uploader attempt failed with error: " + err + "\n trying proxy load");
                }
                const response = await fetch("/api/download/" + encodeURIComponent(url)).then(res => res.json());
                if(response.image) {
                    return this.props.upload(response.image);
                } else {
                    console.error("uploader failed with known reason: " + response.message);
                }
            } else {
                const file = e.dataTransfer.files[0];
                const image = await this.loadImage(file);
                this.props.upload(image);
            }
        } catch(err) {
            console.error("uploader failed with unknown reason: " + (err.stack || err));
        }
    };

    loadImage = async blob => {
        return new Promise(function(resolve, reject) {
            const r = new FileReader();
            r.onloadend = () => {
                if(r.error) {
                    reject(r.error.message);
                    return;
                } else if(r.result.length < 10) { // result length 5="data:" --> failed read
                    reject("truncated response");
                    return;
                } else {
                    resolve(r.result);
                }
            }
            r.readAsDataURL(blob);
        });
    };

    clickUpload = async e => {
        const image = this.loadImage(document.getElementById("dragndrop_file_input").files[0]);
        this.props.upload(image);
    };

    focusInput = (e) => {
        this.setState({inputHasFocus: true});
    };

    unfocusInput = (e) => {
        this.setState({inputHasFocus: false});
    };
}