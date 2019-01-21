import React from "react";
import NavButtons from "../nav/NavButtons";
import Title from "../univ/Title";
import Modal from "../univ/Modal";

import "../../css/home.css";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            joinGameModal: false
        };
    }

    render() {
        return (
            <div>
                <div className="home_center">
                    <Title/>
                    <div className="home_btn new_game" onClick={this.onNewGame}>New Game</div>
                    <div className="home_btn join_game" onClick={this.onJoinGame}>Join Game</div>
                </div>
                {this.state.joinGameModal ? // TODO
                    <Modal modalType="join_game" onClose={() => this.setState({joinGameModal: false})}>
                        <h3> Enter game code: </h3>
                        <input className="modal_text_input" type="text" />
                        <div className="modal_btn" onClick={() => this.props.enterGame('XZXZ')}>Play!</div>
                    </Modal>
                : null}
                <NavButtons appState={this.props.appState} page='Home' />
            </div>

        );
    }

    onNewGame = () => {
        this.props.enterGame('?');
    }

    onJoinGame = () => {
        this.setState({
            joinGameModal: true
        });
    }
}
