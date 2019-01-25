import React from "react";
import io from "socket.io-client";
import update from "immutability-helper";
import Lobby from "./Lobby";
import Game from "./Game";
import {gamePhases, saveStates, CARDS_TO_WIN, MIN_PLAYERS} from "../../../../config.js";
const { LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER } = gamePhases;
const { UNSAVED, SAVING, SAVED } = saveStates;

import "../../css/game.css";

export default class GameContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gamePhase: LOBBY, // LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER
            playerIds: [], // judge is playerIds[0]
            players: {}, // {_id: {_id, name, avatar, media{fb, insta}, score, hasPlayed, connected}}
            jCards: null, // [string]; [NUM_JCARDS] if JCHOOSE, [NUM_JCARDS or 1] otherwise
            jCardIndex: null, // selected if SUBMIT, JUDGE, ROUND_OVER, or GAME_OVER
            pCards: null, // [{_id, image, text, faceup, creator_id, saveState}]; [0] if JCHOOSE, [0] or [1] if SUBMIT, [n] otherwise
            pCardIndex: null, // selected or null if JUDGE, winner if ROUND_OVER or GAME_OVER
            pCardsFacedown: 0, // if JUDGE
            endTime: null, // if SUBMIT
            cardsToWin: null,
            roundSkipped: false // if JCHOOSE, SUBMIT, or JUDGE
        };

        this.actions = {
            startGame: this.startGame,
            selectJCard: this.selectJCard,
            submitPCard: this.submitPCard,
            viewPCard: this.viewPCard,
            flipAllPCards: this.flipAllPCards,
            selectPCard: this.selectPCard,
            skipRound: this.skipRound,
            savePCard: this.savePCard,
            quitGame: this.quitGame
        }

        this.socket = this.createSocket();
    }

    componentWillUnmount() {
        this.socket.disconnect();
    }

    render() {
        console.log(this.state);
        console.log(this.props.appState);
        return (
            <div className='game_page'>
                {this.state.gamePhase === LOBBY ? (
                    <Lobby  appState={this.props.appState}
                            gameState={this.state}
                            actions={this.actions} />
                ) : (
                    <Game   appState={this.props.appState}
                            gameState={this.state}
                            actions={this.actions} />
                )}
            </div>
        );
    }

    startGame = () => {
        this.socket.emit('startGame');
    }

    // judge action
    selectJCard = jCardIndex => {
        this.setState({
            jCardIndex: jCardIndex
        });
        this.socket.emit('jCardChoice', jCardIndex);
    }

    // player action
    submitPCard = (image, text) => {
        this.setState({
            pCards: [{
                image: image,
                text: text,
                creator_id: this.props.appState.userId,
                faceup: true,
                saveState: UNSAVED
            }]
        });
        this.socket.emit('submitCard', image, text);
    }

    // judge action
    viewPCard = pCardIndex => {
        if (!this.state.pCards[pCardIndex].faceup) {
            this.setState({
                pCards: update(this.state.pCards, {[pCardIndex]: {faceup: {$set: true}}}),
                pCardIndex: pCardIndex,
                pCardsFacedown: this.state.pCardsFacedown - 1
            });
            this.socket.emit('flip', pCardIndex);
        } else {
            this.setState({
                pCardIndex: pCardIndex
            });
            this.socket.emit('look', pCardIndex);
        }
    }

    // judge action
    flipAllPCards = () => {
        this.setState({
            pCards: this.state.pCards.map(pCard => update(pCard, {faceup: {$set: true}})),
            pCardsFacedown: 0
        });
        this.socket.emit('flipAll');
    }

    // judge action
    selectPCard = () => {
        this.setState({
            gamePhase: ROUND_OVER
        });
        this.socket.emit('select', this.state.pCardIndex);
    }

    skipRound = () => {
        this.setState({
            roundSkipped: true
        });
        this.socket.emit('skip');
    }

    savePCard = pCardIndex => {
        let pCardId = this.state.pCards[pCardIndex]._id;
        this.setState({
            pCards: this.state.pCards.map(pCard =>
                        pCard._id === pCardId
                        ? update(pCard, {saveState: {$set: SAVING}})
                        : pCard
                    )
        });
        this.socket.emit('saveCard', pCardId);
    }

    quitGame = () => {
        this.socket.disconnect();
        this.props.quitGame();
    }

    onConnect = () => { // TODO move logic to Home so Lobby is immediately populated
        if (this.props.appState.gameCode === '?') {
            this.socket.emit('newGame', CARDS_TO_WIN);
        } else {
            this.socket.emit('joinGame', this.props.appState.gameCode);
        }
    }

    createSocket = () => {
        let socket = io();
        socket.on('connect', () => {
            this.onConnect();
        });
        socket.on('rejectConnection', reason => {
            this.quitGame();
        });
        socket.on('gameState', (players, gamePhase, jCards, pCards, pCardIndex, endTime, cardsToWin, roundSkipped, gameCode) => {
            this.props.enterGame(gameCode);
            this.setState({
                gamePhase: gamePhase,
                playerIds: players.map(player => player._id),
                players: Object.assign({}, ...players.map(player => ({[player._id]: player}))),
                jCards: jCards,
                jCardIndex: 0,
                pCards: pCards,
                pCardIndex: pCardIndex,
                endTime: endTime,
                cardsToWin: cardsToWin,
                roundSkipped: roundSkipped
            });
        });
        socket.on('nuj', player => {
            let playerIds = player._id in this.state.players
                            ? this.state.playerIds
                            : update(this.state.playerIds, {$push: [player._id]});
            this.setState({
                playerIds: playerIds,
                players: update(this.state.players, {[player._id]: {$set: player}})
            });
        });
        socket.on('judgeAssign', (playerIds, jCards) => {
            this.setState({
                gamePhase: JCHOOSE,
                playerIds: playerIds,
                players: update(this.state.players, Object.assign({}, ...this.state.playerIds.map(playerId =>
                            ({[playerId]: {hasPlayed: {$set: false}}})))),
                jCards: jCards,
                pCards: [],
                roundSkipped: false
            });
        });
        socket.on('roundStart', (jCardIndex, endTime) => {
            this.setState({
                gamePhase: SUBMIT,
                jCardIndex: jCardIndex,
                endTime: endTime
            });
        });
        socket.on('turnedIn', (creator_id, pCard_id) => {
            this.setState({
                players: update(this.state.players, {[creator_id]: {hasPlayed: {$set: true}}}),
                pCards: this.state.pCards.map(pCard =>
                            (pCard.creator_id === creator_id ||
                            pCard._id === pCard_id && this.state.gamePhase !== SUBMIT)
                            ? update(pCard, {
                                _id: {$set: pCard_id},
                                creator_id: {$set: creator_id}
                            })
                            : pCard
                        )
            });
        });
        socket.on('pCards', pCards => {
            this.setState({
                gamePhase: JUDGE,
                pCards: pCards.map(pCard => // TODO flip own card facedown first in animation
                            this.state.pCards.length === 1 && pCard._id === this.state.pCards[0]._id
                            ? update(pCard, {
                                creator_id: {$set: this.state.pCards[0].creator_id},
                                saveState: {$set: this.state.pCards[0].saveState}
                            })
                            : update(pCard, {
                                creator_id: {$set: null},
                                saveState: {$set: UNSAVED}
                            })
                        ),
                pCardIndex: null,
                pCardsFacedown: pCards.length
            });
        });
        socket.on('flip', pCardIndex => {
            this.setState({
                pCards: update(this.state.pCards, {[pCardIndex]: {faceup: {$set: true}}}),
                pCardIndex: pCardIndex,
                pCardsFacedown: this.state.pCardsFacedown - 1
            });
        });
        socket.on('flipAll', () => {
            this.setState({
                pCards: this.state.pCards.map(pCard => update(pCard, {faceup: {$set: true}})),
                pCardsFacedown: 0
            });
        });
        socket.on('look', pCardIndex => {
            this.setState({
                pCardIndex: pCardIndex
            });
        });
        socket.on('select', (pCardIndex, creator_ids) => {
            this.setState({
                gamePhase: ROUND_OVER,
                players: update(this.state.players, {[creator_ids[pCardIndex]]: {score: (score => score + 1)}}),
                pCards: this.state.pCards.map((pCard, index) => update(pCard, {creator_id: {$set: creator_ids[index]}})),
                pCardIndex: pCardIndex
            });
        });
        socket.on('gameOver', () => {
            this.setState({
                gamePhase: GAME_OVER
            });
        });
        socket.on('disconnected', dcId => {
            this.setState({
                playerIds: this.state.gamePhase === LOBBY
                            ? this.state.playerIds.filter(playerId => playerId !== dcId)
                            : this.state.playerIds,
                players: update(this.state.players, {[dcId]: {connected: {$set: false}}})
            });
        });
        socket.on('skipped', () => {
            this.setState({
                roundSkipped: true
            });
        });
        socket.on('cardSaved', pCardId => {
            this.setState({
                pCards: this.state.pCards.map(pCard =>
                            pCard._id === pCardId
                            ? update(pCard, {saveState: {$set: SAVED}})
                            : pCard
                        )
            });
        });
        socket.on('cardSaveFailed', pCardId => {
            this.setState({
                pCards: this.state.pCards.map(pCard =>
                            pCard._id === pCardId
                            ? update(pCard, {saveState: {$set: UNSAVED}})
                            : pCard
                        )
            });
        });
        return socket;
    }
}