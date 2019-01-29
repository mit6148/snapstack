import React, { Component } from "react";
import textFit from 'textfit';
import Link from "react-router-dom/es/Link";

export default class Caption extends Component {
    constructor(props) {
        super(props);

        this.key = Math.floor(Math.random() * 100);
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        textFit(document.getElementsByClassName('fit'+this.key), {alignHoriz: true, alignVert: true, minFontSize: 8, maxFontSize: 16, multiLine: true});
    }

    render() {
        return this.props.creatorId && this.props.creatorId !== this.props.userId ? (
            <div className={'fit_resize fit'+this.key}>
                {this.props.text}
                <br/>
                {'—  '}
                <Link to={'/profile/'+this.props.creatorId}>{this.props.creator}</Link>
            </div>
        ) : (
            <div className={'fit_resize fit'+this.key}>
                {this.props.text}
            </div>
        );
    }
}