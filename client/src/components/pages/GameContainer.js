import React from "react";
import io from "socket.io-client";
import update from 'immutability-helper';
import NavButtons from "../nav/NavButtons";
import { gameStates, CARDS_TO_WIN, MIN_PLAYERS } from "../../../../config.js";

import "../../css/game.css";

const saveStates = {
    UNSAVED: 0,
    SAVED: 1,
    SAVING: 2
};

export default class GameContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gameState: gameStates.LOBBY, // LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER
            playerIds: [], // judge is playerIds[0]
            players: new Map(), // {_id: {_id, name, avatar, media{fb, insta}, score, hasPlayed, connected}}
            jCards: null, // [string]; [NUM_JCARDS] if JCHOOSE, [NUM_JCARDS or 1] otherwise
            jCardIndex: null, // selected if SUBMIT, JUDGE, ROUND_OVER, or GAME_OVER
            pCards: null, // [{_id, image, text, faceup, creator_id, saved}]; [0] if JCHOOSE, [0] or [1] if SUBMIT, [n] otherwise
            pCardIndex: null, // selected if JUDGE, winner if ROUND_OVER or GAME_OVER
            endTime: null, // if SUBMIT
            cardsToWin: null,
            winnerId: null, // if ROUND_OVER or GAME_OVER
            judgeDisconnected: false, // if JCHOOSE, SUBMIT, or JUDGE
            roundSkipped: false, // if JCHOOSE, SUBMIT, or JUDGE
            tooFewPlayers: false // prevent game start if LOBBY, prevent round start if JCHOOSE
        };

        this.socket = this.createSocket();
    }

    componentDidMount() {
        window.addEventListener('beforeunload', () => this.socket.disconnect()); // TODO debug
    }

    render() {
        return (
            <div className="game_page">
            	<NavButtons appState={this.props.appState} page='GameContainer' quitGame={this.props.quitGame} />
                Game
            </div>
        );
    }

    onConnect = () => {
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
            socket.disconnect();
            this.props.quitGame();
        });
        socket.on('gameState', (players, gameState, jCards, pCards, pCardIndex, endTime, cardsToWin, roundSkipped, gameCode) => {
            this.props.enterGame(gameCode);
            this.setState({
                gameState: gameState,
                playerIds: players.map(player => player._id),
                players: new Map(players.map(player => [player._id, player])),
                jCards: jCards,
                jCardIndex: 0,
                pCards: pCards.map(pCard => update(pCard, {saved: {$set: saveStates.UNSAVED}})),
                pCardIndex: pCardIndex,
                endTime: endTime,
                cardsToWin: cardsToWin,
                winnerId: [gameState.ROUND_OVER, gameState.GAME_OVER].includes(gameState) ? pCards[pCardIndex].creator_id : null,
                judgeDisconnected: !players[0].connected,
                roundSkipped: roundSkipped,
                tooFewPlayers: players.length < MIN_PLAYERS
            });
        });
        socket.on('nuj', player => {
            let playerIds = this.state.players.has(player._id)
                            ? this.state.playerIds
                            : update(this.stateplayerIds, {$push: [player._id]});
            this.setState({
                playerIds: playerIds,
                players: update(this.state.players, {[player._id]: {$set: player}}),
                judgeDisconnected: this.state.judgeDisconnected && this.state.playerIds[0] !== player._id,
                tooFewPlayers: playerIds.length < MIN_PLAYERS
            });
        });
        socket.on('judgeAssign', (playerIds, jCards) => {
            this.setState({
                gameState: gameStates.JCHOOSE,
                playerIds: playerIds,
                jCards: jCards,
                pCards: [],
                judgeDisconnected: false,
                roundSkipped: false,
                tooFewPlayers: playerIds.length < MIN_PLAYERS
            });
        });
        socket.on('roundStart', (jCardIndex, endTime) => {
            this.setState({
                gameState: gameStates.SUBMIT,
                players: new Map(Array.from(this.state.players, ([playerId, player]) => [playerId, update(player, {hasPlayed: {$set: false}})])),
                jCardIndex: jCardIndex,
                endTime: endTime
            });
        });
        socket.on('turnedIn', (creator_id, pCard_id) => {
            this.setState({
                players: update(this.state.players, {[creator_id]: {hasPlayed: {$set: true}}}),
                pCards: this.state.pCards.map(pCard =>
                            (pCard.creator_id === creator_id ||
                            pCard._id === pCard_id && this.state.gameState !== gameState.SUBMIT)
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
                gameState: gameStates.JUDGE,
                pCards: this.state.pCards.length === 1 // TODO flip own card facedown first in animation
                        ? pCards.map(pCard =>
                            pCard._id === this.state.pCards[0]._id
                            ? update(pCard, {
                                creator_id: {$set: this.state.pCards[0].creator_id},
                                saved: {$set: this.state.pCards[0].saved}
                            })
                            : pCard
                        )
                        : pCards
            });
        });
        socket.on('flip', pCardIndex => {
            this.setState({
                pCards: update(this.state.pCards, {[pCardIndex]: {$toggle: ['faceup']}}),
                pCardIndex: pCardIndex
            });
        });
        socket.on('flipAll', () => {
            this.setState({
                pCards: this.state.pCards.map(pCard => update(pCard, {faceup: {$set: true}}))
            });
        });
        socket.on('look', pCardIndex => {
            this.setState({
                pCardIndex: pCardIndex
            });
        });
        socket.on('select', (pCardIndex, creator_ids) => {
            let winnerId = creator_ids[pCardIndex];
            this.setState({
                gameState: gameStates.ROUND_OVER,
                players: update(this.state.players, {[winnerId]: {score: (score => score + 1)}}),
                pCards: this.state.pCards.map((pCard, index) => update(pCard, {creator_id: {$set: creator_ids[index]}})),
                pCardIndex: pCardIndex,
                winnerId: winnerId
            });
        });
        socket.on('gameOver', () => {
            this.setState({
                gameState: gameStates.GAME_OVER,
                winnerId: this.state.pCards[this.state.pCardIndex].creator_id
            });
        });
        socket.on('disconnected', playerId => {
            this.setState({
                players: update(this.state.players, {[playerId]: {connected: {$set: false}}}),
                judgeDisconnected: this.state.judgeDisconnected || playerId === playerIds[0]
            });
        });
        socket.on('skipped', () => {
            this.setState({
                roundSkipped: true
            });
        });
        socket.on('cardSaved', pCard_id => {
            this.setState({
                pCards: this.state.pCards.map(pCard =>
                            pCard._id === pCard_id
                            ? update(pCard, {saved: {$set: saveStates.SAVED}})
                            : pCard
                        )
            });
        });
        socket.on('cardSaveFailed', pCard_id => {
            this.setState({
                pCards: this.state.pCards.map(pCard =>
                            pCard._id === pCard_id
                            ? update(pCard, {saved: {$set: saveStates.UNSAVED}})
                            : pCard
                        )
            });
        });
        return socket;
    }
}