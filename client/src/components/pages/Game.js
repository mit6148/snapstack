import React from "react";
import NavButtons from "../nav/NavButtons";
import CardBin from "../game/CardBin";
import Timer from "../game/Timer";
import Uploader from "../game/Uploader";
import PCard from "../univ/PCard";
import PCardEditor from "../game/PCardEditor";
import Modal from "../univ/Modal";
import { gamePhases, saveStates, specialCards, MIN_PLAYERS } from "../../../../config.js";
const { LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER } = gamePhases;
const { UNSAVED, SAVING, SAVED } = saveStates;
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/game.css";
import "../../css/card.css";

export default class Game extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            cardModal: null,
            pCardEditModal: null
        };
    }

    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="game_page">
                <NavButtons appState={this.props.appState} page='Game' quitGame={this.actions.quitGame} />
                
                {this.gameState.gamePhase === JCHOOSE ? (
                    <React.Fragment>
                        <CardBin    jCards={[NO_CARD]}
                                    owners={[this.gameState.players[this.gameState.playerIds[0]]]} />
                        <Modal modalType="jcard_selector">
                            <h2 className='modal_command'> {this.gameState.players[this.gameState.playerIds[0]].name}, select your judge card: </h2>
                            <CardBin    jCards={this.gameState.jCards}
                                        onClick={this.isJudge() ? this.actions.selectJCard : null}
                                        enlarged={true} />
                        </Modal>
                    </React.Fragment>
                ) : (
                    <CardBin    jCards={[this.gameState.jCards[this.gameState.jCardIndex]]}
                                owners={[this.gameState.players[this.gameState.playerIds[0]]]} />
                )}
                
                {[JCHOOSE, SUBMIT].includes(this.gameState.gamePhase) ? (
                    <CardBin    pCards={this.gameState.playerIds.slice(1).map(playerId =>
                                        playerId === this.props.appState.userId
                                        ? (this.gameState.pCards.length === 1 ? this.gameState.pCards[0] : NO_CARD)
                                        : (this.gameState.players[playerId].hasPlayed ? CARDBACK : NO_CARD))}
                                owners={this.gameState.playerIds.slice(1).map(playerId => this.gameState.players[playerId])}
                                onClick={this.viewPCard} />
                ) : this.gameState.gamePhase === JUDGE ? (
                    <CardBin    pCards={this.gameState.pCards}
                                onClick={this.viewPCard}
                                save={this.actions.savePCard}
                                judgeFocusIndex={this.gameState.pCardIndex} />
                ) : (
                    <CardBin    pCards={this.gameState.pCards}
                                owners={this.gameState.pCards.map(pCard => pCard.creator_id ? this.gameState.players[pCard.creator_id] : null)}
                                onClick={this.viewPCard}
                                save={this.actions.savePCard}
                                winnerIndex={this.gameState.pCardIndex} />
                )}
                
                {this.gameState.gamePhase === SUBMIT ? <Timer end={this.gameState.endTime} /> : null}
                {this.canUploadImage() ? <Uploader upload={this.uploadImage} fakeImage={this.gameState.players[this.gameState.playerIds[0]].avatar} /> : null}
                {this.canFlipAllPCards() ? <div onClick={this.actions.flipAllPCards}>Flip All</div> : null}
                {this.canSelectPCard() ? <div onClick={this.actions.selectPCard}>Select</div> : null}
                
                {this.isJudgeDisconnected() && !this.gameState.roundSkipped ? (
                    <div className="round_skip">
                        The judge has disconnected. Skip round?
                        <div className="home_btn" onClick={this.actions.skipRound}> 
                        Sure </div>
                    </div>
                ) : null}
                
                {this.gameState.roundSkipped ? (
                    <div>
                        Skipping to next round...
                    </div>
                ) : null}
                
                {this.gameState.gamePhase === GAME_OVER ? <div>{this.gameState.players[this.getWinner()].name} has won!</div> : null}
                {this.state.cardModal}
                {this.state.pCardEditModal}
            </div>
        );
    }

    uploadImage = image => {
        this.setState({
            pCardEditModal: (
                <Modal modalType="zoom_card" onClose={() => this.setState({pCardEditModal: null})} persistOnWindowClick={true}>
                    <PCardEditor image={image} submit={this.actions.submitPCard} onClose={() => this.setState({pCardEditModal: null})} />
                </Modal>
            )
        });
    }

    viewPCard = (pCardIndex, pCard) => {
        if ([NO_CARD, CARDBACK].includes(pCard)) return;

        if (pCard.faceup !== false) {
            this.setState({
                cardModal: (
                    <Modal modalType='zoom_card' onClose={() => this.setState({cardModal: null})}>
                        <PCard  image={pCard.image}
                                text={pCard.text}
                                saveState={pCard.saveState}
                                save={this.props.save}
                                enlarged={true} />
                    </Modal>
                )
            });
        }
        if (this.isJudge()) {
            this.actions.viewPCard(pCardIndex);
        }
    }

    isJudge = () => {
        return this.props.appState.userId === this.gameState.playerIds[0];
    }

    canUploadImage = () => {
        return this.gameState.gamePhase === SUBMIT && !this.isJudge();
    }

    canFlipAllPCards = () => {
        return this.gameState.gamePhase === JUDGE && this.isJudge() && this.gameState.pCardsFacedown > 0;
    }

    canSelectPCard = () => {
        return this.gameState.gamePhase === JUDGE && this.isJudge() && this.gameState.pCardsFacedown === 0 && this.gameState.pCardIndex !== null;
    }

    getWinner = () => {
        return [ROUND_OVER, GAME_OVER].includes(this.gameState.gamePhase) && this.gameState.pCards[this.gameState.pCardIndex].creator_id || null;
    }

    // enable skip round
    isJudgeDisconnected = () => { // TODO remove temp change
        return [JCHOOSE, SUBMIT, JUDGE].includes(this.gameState.gamePhase) && !this.gameState.players[this.gameState.playerIds[0]].connected;
    }

    // stall at JCHOOSE
    tooFewPlayers = () => {
        return this.gameState.playerIds.length < MIN_PLAYERS;
    }
}