import React from "react";

import "../../css/uploader.css";

export default class Uploader extends React.Component {
    constructor (props) {
        super(props);

        // let r = new FileReader();
        // r.readAsDataURL('~/Pictures/Avatar.jpg');
        // r.onloadend = this.setState({
        //     image: r.result
        // });

    }

    componentDidMount() {
        const input = document.getElementById("dragndrop_file_input");
        const box = document.getElementById("")
    }

    render() {
        return (
            <div id="dragndrop_box" onDrag={this.mute} onDragStart={this.mute} onDragEnd={this.endDrag}
                onDragOver={this.startDrag} onDragEnter={this.startDrag} onDragLeave={this.endDrag} onDrop={this.drop}>
                <input type="file" name="files[]" id="dragndrop_file_input" accept="image/*"
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
        document.getElementById("dragndrop_box").classList.add('is-dragover');
    };

    endDrag = (e) => {
        this.mute(e);
        document.getElementById("dragndrop_box").classList.remove('is-dragover');
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
        this.submit(fileOrBlob);
    };

    clickUpload = (e) => {
        this.submit(document.getElementById("dragndrop_file_input").files[0]);
    };

    submit = async (fileOrBlob) => {
        const r = new FileReader();
        r.onloadend = () => {
            this.props.submit(r.result);
        }
        r.readAsDataURL(fileOrBlob);
    };

    focusInput = (e) => {
        document.getElementById("dragndrop_file_input").classList.add("has-focus");
    };

    unfocusInput = (e) => {
        document.getElementById("dragndrop_file_input").classList.remove("has-focus");
    };
}