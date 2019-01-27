import React from "react";
import update from "immutability-helper";
import NavButtons from "../nav/NavButtons";
import Card from "../univ/Card.js";
import PCard from "../univ/PCard";
import PlayerMedia from "../univ/PlayerMedia.js";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/profile.css";
import "../../css/player.css";

export default class Profile extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
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

        fetch('/api/profile/'+this.props.id).then(res => res.json()).then(async profileObj => {
            this.setState({
                firstName: profileObj.firstName,
                lastName: profileObj.lastName,
                avatar: profileObj.avatar,
                description: profileObj.description,
                media: profileObj.media,
                jCards: profileObj.saved_pairs.map(pair => pair.jCardText),
                pCardIds: profileObj.saved_pairs.map(pair => pair.pCardId)
            });

            await this.loadPCards(6);
            this.setState({
                shouldRender: true
            });
            this.loadPCards();
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

    render() {
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
                            {this.state.pCardIds.map((pCardId, index) => (
                                <div key={index}>
                                    {index < this.state.pCards.length ? (
                                        <PCard  image={this.state.pCards[index].image}
                                                text={this.state.pCards[index].text}
                                                onClick={() => this.viewPCard(this.state.pCards[index])} />
                                    ) : (
                                        <PCard  src={LOADING_CARD} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    viewPCard = (pCard) => {
        this.setState({
            cardModal: (
                <Modal modalType='zoom_card' onClose={() => this.setState({cardModal: null})}>
                    <PCard  image={pCard.image}
                            text={pCard.text}
                            creator={pCard.creator_name}
                            creatorId={pCard.creator_id}
                            enlarged={true} />
                </Modal>
            )
        });
    }
}

// <div className="square_picture_container">
//     <img src="/chris.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/melody.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/nikhil.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/chris.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/melody.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/nikhil.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/chris.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/melody.jpg"/>
// </div>
// <div className="square_picture_container">
//     <img src="/nikhil.jpg"/>
// </div>