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
        this.endDrag(e);
        const url = e.dataTransfer.getData("URL");
        let fileOrBlob;
        if(url) {
            fileOrBlob = await (await fetch(url)).blob();
        } else {
            fileOrBlob = e.dataTransfer.files[0];
        }
        this.upload(fileOrBlob);
    };

    clickUpload = (e) => {
        this.upload(document.getElementById("dragndrop_file_input").files[0]);
    };

    upload = async (fileOrBlob) => {
        const r = new FileReader();
        r.onloadend = () => {
            this.props.upload(r.result);
        }
        r.readAsDataURL(fileOrBlob);
    };

    focusInput = (e) => {
        this.setState({inputHasFocus: true});
    };

    unfocusInput = (e) => {
        this.setState({inputHasFocus: false});
    };
}