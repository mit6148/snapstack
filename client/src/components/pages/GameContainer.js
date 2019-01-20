import React from "react";
import io from "socket.io-client";
import update from 'immutability-helper';
import NavButtons from "../nav/NavButtons";
import { gameStates } from "../../../../config.js";

export default class GameContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gameState: gameStates.LOBBY, // LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER
            playerIds: [], // judge is playerIds[0]
            players: new Map(), // {_id: {_id, name, avatar, media{fb, insta}, score, hasPlayed, connected}}
            jCards: null, // [string]; [3] if JCHOOSE, [1] otherwise
            jCardIndex: null, // selected if SUBMIT, JUDGE, ROUND_OVER, or GAME_OVER
            pCards: null, // [{_id, image, text, faceup, creator_id}]; [0] if JCHOOSE, [0] or [1] if SUBMIT, [n] otherwise
            pCardIndex: null, // selected if JUDGE, winner if ROUND_OVER or GAME_OVER
            endTime: null, // if SUBMIT
            cardsToWin: null,
            winnerId: null, // if ROUND_OVER or GAME_OVER
            judgeQuit: false // if JCHOOSE, SUBMIT, or JUDGE
        };

        this.socket = connect();
    }

    render() {
        return (
            <div>
            	<NavButtons appState={this.props.appState} page='GameContainer' quitGame={this.props.quitGame} />
                Game
            </div>
        );
    }

    connect = () => {
        let socket = io();
        socket.on('refreshGame', (players, gameState, judgeId, jCards, pCards, pCardIndex, endTime, cardsToWin, gameCode) => {
            this.props.enterGame(gameCode);
            this.setState({
                gameState: gameState,
                playerIds: players.map(player => player._id),
                players: new Map(players.map(player => [player._id, player])),
                jCards: jCards,
                jCardIndex: 0,
                pCards: pCards,
                pCardIndex: pCardIndex,
                endTime: endTime,
                cardsToWin: cardsToWin
            });
        });
        socket.on('nuj', player => {
            this.setState({
                playerIds: update(this.state.playerIds, {$push: [player._id]}),
                players: update(this.state.players, {[player._id]: {$set: player}})
            });
        });
        socket.on('judgeAssign', (playerIds, jCards) => {
            this.setState({
                gameState: gameStates.JCHOOSE,
                playerIds: playerIds,
                jCards: jCards
            });
        });
        socket.on('roundStart', (jCardIndex, endTime) =>
            this.setState({
                gameState: gameStates.SUBMIT,
                jCardIndex: jCardIndex,
                endTime: endTime
            });
        )
        socket.on('turnedIn', (creator_id, pCard_id) => {
            this.setState({
                players: update(this.state.players, {[creator_id]: {hasPlayed: {$set: true}}})
                pCards: (pCard_id !== null && pCards.length === 1 && creator_id === pCards[0].creator_id)
                            ? update(this.state.pCards, {0: {_id: {$set: pCard_id}}})
                            : this.state.pCards
            });
        });
        socket.on('pCards', pCards => {
            this.setState({
                gameState: gameStates.JUDGE,
                pCards: pCards
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
                players: update(this.state.players, {[winnerId]: {score: {$apply: (score => score + 1)}}}),
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
        socket.on('quit', playerId => {
        });
    }
}