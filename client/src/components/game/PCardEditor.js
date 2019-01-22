import React from "react";

export default class PCardEditor extends React.Component {
    render() {
        return (
            <div>
                <img src={this.props.image} />
                bunbunbun
                <div onClick={() => this.props.submit()}>Submit</div>
            </div>
        );
    }
}