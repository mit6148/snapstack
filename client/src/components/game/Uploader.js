import React from "react";
import Modal from "../univ/Modal";

import "../../css/uploader.css";

const URL_FAIL_STRING = "Sorry, we couldn't find your image.\nIf you're using facebook, make sure to click all the way into the image before dragging it.\nOtherwise, try dragging it to your desktop and then into the game";

export default class Uploader extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            formDragOver: false,
            inputHasFocus: false,
            modalMessage: null
        };

    }

    render() {
        return (
            <div id="dragndrop_box" className={this.state.formDragOver ? "is-dragover" : ""} onDrag={this.mute} onDragStart={this.mute}
                onDragEnd={this.endDrag} onDragOver={this.startDrag} onDragEnter={this.startDrag} onDragLeave={this.endDrag} onDrop={this.drop}>
                <input type="file" name="files[]" id="dragndrop_file_input" accept="image/*" className={this.state.inputHasFocus ? "has-focus" : ""}
                    onChange={this.clickUpload} onFocus={this.focusInput} onBlur={this.unfocusInput}/>
                <label htmlFor="dragndrop_file_input"><strong>Choose</strong> or drag an image.</label>
                {
                    (this.state.modalMessage !== null) ? (
                            <Modal onClose={this.closeModal} modalType="join_game">
                                {this.state.modalMessage}
                            </Modal>
                        ) : null
                }
            </div>
        );
    }


    closeModal = () => {
        this.setState({modalMessage: null});
    };

    mute = (e) => { // mutes actions from traveling further
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
                    const preblob = await fetch(url);
                    const blob = await preblob.blob();
                    if(typeof(blob) !== "object") {
                        console.log("blob failed in uploader");
                        this.setState({modalMessage: URL_FAIL_STRING});
                        return;
                    }
                    const image = await this.loadImage(blob);
                    this.props.upload(image);
                    return;
                } catch(err) {
                    console.log("initial uploader attempt failed with error: " + err + "\n trying secondary load");
                }
                const response = await fetch("/api/download/" + encodeURIComponent(url)).then(res => res.json());
                if(response.image) {
                    return this.props.upload(response.image);
                } else {
                    this.setState({modalMessage: URL_FAIL_STRING});
                    console.error("uploader failed with known reason: " + response.message);
                }
            } else {
                console.log("dragged file");
                const file = e.dataTransfer.files[0];
                const image = await this.loadImage(file);
                this.props.upload(image);
            }
        } catch(err) {
            this.setState({modalMessage: "Oops! Either that wasn't an image, or we messed up!"});
            console.error("uploader failed with unknown reason: " + err + "\n" + (err.stack || ""));
        }
    };

    loadImage = async blob => {
        return new Promise(function(resolve, reject) {
            const r = new FileReader();
            r.onloadend = () => {
                if(r.error) {
                    reject(r.error.message);
                    return;
                } else if(r.result.length < 50) { // too short, failed read or just obnoxious image
                    reject("truncated response");
                    return;
                } else if(!r.result.startsWith("data:image/")) {
                    reject("incorrect format");
                    return;
                } else {
                    resolve(r.result);
                }
            }
            r.readAsDataURL(blob);
        });
    };

    clickUpload = async e => {
        const image = await this.loadImage(document.getElementById("dragndrop_file_input").files[0]);
        this.props.upload(image);
    };

    focusInput = (e) => {
        this.setState({inputHasFocus: true});
    };

    unfocusInput = (e) => {
        this.setState({inputHasFocus: false});
    };
}