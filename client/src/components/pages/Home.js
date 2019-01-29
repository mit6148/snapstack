import React from "react";
import NavButtons from "../nav/NavButtons";
import Title from "../univ/Title";
import Modal from "../univ/Modal";
import Card from "../univ/Card";

import "../../css/home.css";

import "../../css/card.css";

import "../../css/modal.css";

import "../../css/about.css";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            joinGameModal: false,
        };
    }   

    render() {
        return (
            <div className='home_page'>
                <div className="home_center">
                    <Title/>
                    <div className="logo_container">
                        <img className="logo" src="/pancakes.jpg"/>
                    </div>
                    <div className="home_btn new_game" onClick={this.onNewGame}>New Game</div>
                    <div className="home_btn join_game" onClick={this.onJoinGame}>Join Game</div>
                </div>
                {this.state.joinGameModal ?
                    <Modal withBox={true} onClose={() => this.setState({joinGameModal: false})}>
                        <h3> Enter game code: </h3>
                        <input id="game-code-input" onKeyUp={this.tryEnterGame} autoComplete="off" className="modal_text_input" type="text" />
                        <div className="modal_btn" onClick={this.enterGame}>Play!</div>
                    </Modal>
                : null}

                <NavButtons appState={this.props.appState} page='Home' />

                {
                    this.props.appState.isNew ? (
                            <Modal disableCloseByWindow={true} onClose={this.closeTutorial}>
                                <div className='tutorial'>
                                    <h2>
                                        Welcome
                                    </h2>
                                    
                                    <div className="tutorial_caption">
                                        Welcome to SnapStack, the party game where you match The Meme to the Theme!
                                    </div>
                                    <div className="logo_container">
                                        <img className="logo" src="/pancakes.jpg"/>
                                    </div>

                                    <div className="tutorial_caption">
                                        This quick tutorial will explain the game, or you can skip it by clicking the X in the top right corner.
                                    </div>
                                    
                                    <div className="tutorial_caption">
                                        Each game consists of several rounds, where you and your friends will take turns as judge.
                                    </div>
                                    
                                    <div className="tutorial_caption">
                                        At the start of each round, the judge will choose The Theme which the players follow.
                                    </div>
                                    <img className="tutorial_image" src="/1.PNG"/>
                                    
                                    <div className="tutorial_caption">
                                        When the timer starts, all players will have 2 minutes to make a customized Meme to fit the prompt. Exploit your friends’ social media accounts to find the perfect, (just slightly) embarrassing photo of them!
                                    </div>
                                    <img className="tutorial_image" src="/2.PNG"/>
                                    
                                    <div className="tutorial_caption">
                                        Once you upload a photo, you can also go crazy with the caption and drawing editor. Make sure to submit your Meme before time runs out!
                                    </div>
                                    
                                    <div className="tutorial_caption">
                                        After all Memes are submitted, the lucky judge will flip and view the cards (anonymously of course), and narrow them down until you have a winner. 
                                    </div>
                                    
                                    <div className="tutorial_caption">
                                        This is the perfect time for everyone to squabble and totally not influence the judge’s decision!
                                    </div>
                                    
                                    <div className="tutorial_caption">
                                        Once a winner is declared, the Theme goes to them and another round commences. This process will continue f o r e v e r (jk, it ends when someone wins 3 Themes)
                                    </div>
                                    
                                    <div className="tutorial_caption">
                                        Throughout the entire game, if you see any high-quality Memes, go ahead and save them to your personal SnapStack for future reference! 
                                    </div>
                                    
                                    <div className="tutorial_caption">
                                        Ready to play? Make sure to upload your social media links to your profile before you start!
                                    </div>
                                </div>
                            </Modal>
                        ) : null
                }
            </div>

        );
    };

    tryEnterGame = e => {
        if(e.keyCode === 13) {
            this.enterGame();
        }
    }

    closeTutorial = () => {
        this.props.markVisited();
    }

    enterGame = () => {
        this.props.enterGame(document.getElementById("game-code-input").value);
    };

    onNewGame = () => {
        this.props.enterGame('?');
    };

    onJoinGame = () => {
        this.setState({
            joinGameModal: true
        });
    };


}
