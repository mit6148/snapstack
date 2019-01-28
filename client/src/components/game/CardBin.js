import React from "react";
import JCard from "../univ/JCard";
import PCard from "../univ/PCard";
import PlayerInfo from "../univ/PlayerInfo";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/card.css";

export default class CardBin extends React.Component {
    render() {
        return (
            <div className={this.props.type+'_card_bin'}>
                {this.props.jCards ? this.props.jCards.map((jCard, index) => (
                    <div key={index} className="card_slot">
                        <div className="card_area">
                            <JCard  src={jCard}
                                    text={jCard}
                                    onClick={this.props.onClick ? (() => this.props.onClick(index, jCard)) : null}
                                    enlarged={this.props.enlarged} />
                        </div>
                        {this.props.type === 'game' ? (
                            <div className="card_info_area">
                                {!this.props.owners || !this.props.owners[index] ? null : (
                                    <PlayerInfo name={this.props.owners[index].name}
                                                avatar={this.props.owners[index].avatar}
                                                media={this.props.owners[index].media}
                                                score={this.props.owners[index].score}
                                                connected={this.props.owners[index].connected} />
                                )}
                            </div>
                        ) : null}
                    </div>
                )) : null}
                {this.props.pCards ? this.props.pCards.map((pCard, index) => (
                    <div key={index} className='card_slot'>
                        <div className="card_area">
                            <PCard  src={pCard}
                                    image={pCard.image}
                                    text={pCard.text}
                                    faceup={pCard.faceup}
                                    onClick={this.props.onClick ? (() => this.props.onClick(index, pCard)) : null}
                                    saveState={pCard.saveState}
                                    save={() => this.props.save(index)} />
                        </div>
                        {this.props.type === 'game' ? (
                            <div className='card_info_area'>
                                {!this.props.owners || !this.props.owners[index] ? null : (
                                    <PlayerInfo name={this.props.owners[index].name}
                                                avatar={this.props.owners[index].avatar}
                                                media={this.props.owners[index].media}
                                                score={this.props.owners[index].score}
                                                connected={this.props.owners[index].connected} />
                                )}
                            </div>
                        ) : null}
                    </div>
                )) : null}
            </div>
        );
    }
}
