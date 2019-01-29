import React from "react";
import update from "immutability-helper";
import NavButtons from "../nav/NavButtons";
import Card from "../univ/Card";
import PCard from "../univ/PCard";
import PlayerMedia from "../univ/PlayerMedia";
import Modal from "../univ/Modal";
import CardBin from "../game/CardBin";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/profile.css";
import "../../css/player.css";

export default class Profile extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            userId: null,
            shouldRender: false,
            firstName: null,
            lastName: null,
            avatar: null,
            description: null,
            media: null,
            jCards: null,
            pCardIds: null,
            pCards: [],
            cardModal: null
        };
    }

    getData = userId => {
        fetch('/api/profile/'+userId).then(res => res.json()).then(async profileObj => {
            this.setState({
                firstName: profileObj.firstName,
                lastName: profileObj.lastName,
                avatar: profileObj.avatar,
                description: profileObj.description,
                media: profileObj.media,
                jCards: profileObj.saved_pairs.map(pair => pair.jCardText),
                pCardIds: profileObj.saved_pairs.map(pair => pair.pCardId)
            });

            await this.loadPCards(8);
            this.setState({
                shouldRender: true
            });
            while (this.state.pCards.length < this.state.pCardIds.length) {
                await this.loadPCards(4);
            }
        });
    }

    async loadPCards(num) {
        let pCardIds = num ? this.state.pCardIds.slice(this.state.pCards.length, this.state.pCards.length + num) : this.state.pCardIds.slice(this.state.pCards.length);
        if (pCardIds.length === 0) return;

        return fetch('/api/pcards/'+pCardIds).then(res => res.json()).then(pCards => {
            this.setState({
                pCards: update(this.state.pCards, {$push: pCards})
            });
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.id !== prevState.userId) {
            return {
                userId: null,
                shouldRender: false,
                firstName: null,
                lastName: null,
                avatar: null,
                description: null,
                media: null,
                jCards: null,
                pCardIds: null,
                pCards: [],
                cardModal: null
            };
        } else {
            return null;
        }
    }

    render() {
        if (this.state.userId === null) {
            this.state.userId = this.props.id;
            this.getData(this.props.id);
        }

        if (!this.state.shouldRender) {
            return (
                <div className="profile_text profile_page">
                    <NavButtons appState={this.props.appState} page='Profile' profileId={this.props.id} logout={this.props.logout} />
                </div>
            );
        }

        return ( //Todo, work on modals for Edit and Cards!
            <div className="profile_text profile_page">
                <NavButtons appState={this.props.appState} page='Profile' profileId={this.props.id} logout={this.props.logout} />

                <div className="profile_container">
                    <div className="my_profile">

                        <div className="photo_section">
                            <div className="circle_picture_container">
                                <img className="profile_picture" src={this.state.avatar} />
                            </div>
                        </div>

                        <div className="info_section">
                            <div className="profile_name">
                                <h2> {(this.state.firstName && this.state.lastName) ? // handle people having one name
                                    (this.state.firstName + " " + this.state.lastName) :
                                    (this.state.firstName || this.state.lastName || "No Name")}
                                </h2>
                            </div>
                            <div className="profile_description">
                                {this.state.description}
                            </div>
                            <div>
                                <div>
                                    <div className="fab fa-facebook-square fb_btn"></div>
                                    {this.state.media.fb}
                                </div>
                                <div>
                                    <div className="fab fa-instagram insta_btn"></div>
                                    {this.state.media.insta}
                                </div>
                            </div>
                            <div className='edit_btn'>
                                Edit
                            </div>
                        </div>
                    </div>

                    <div className="my_snapstack">
                        <h2> My SnapStack </h2>
                        <div className="saved_cards">
                            <CardBin    type='profile'
                                        pCards={this.state.pCardIds.map((pCardId, index) => index < this.state.pCards.length ? this.state.pCards[index] : LOADING_CARD)}
                                        creators={this.state.pCards.map(pCard => ({_id: pCard.creator_id, name: pCard.creator_name}))}
                                        userId={this.props.id}
                                        onClick={this.viewSaved} />
                        </div>
                    </div>
                </div>
                {this.state.cardModal}
            </div>
        );
    }

    viewSaved = index => {
        if (index >= this.state.pCards.length) return;

        this.setState({
            cardModal: (
                <Modal onClose={() => this.setState({cardModal: null})}>
                    <CardBin    type='jpmodal'
                                jCards={[this.state.jCards[index]]}
                                pCards={[this.state.pCards[index]]}
                                creators={[{_id: this.state.pCards[index].creator_id, name: this.state.pCards[index].creator_name}]}
                                userId={this.props.id} />
                </Modal>
            )
        });
    }
}