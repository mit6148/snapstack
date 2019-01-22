import React from "react";
import JCard from "../univ/JCard";
import PCard from "../univ/PCard";
import PlayerInfo from "../univ/PlayerInfo";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD } = specialCards;

import "../../css/card.css";

export default class CardBin extends React.Component {
    render() {
        if (this.props.jCards !== undefined) {
            return (
                <div className="jcard_bin">
                    {this.props.jCards.map((jCard, index) => (
                        <div key={index} className="jcard_slot">
                            <div className="jcard_object">
                                <JCard  src={jCard}
                                        text={jCard}
                                        onClick={this.props.onClick ? (() => this.props.onClick(index, jCard)) : null}
                                        enlarged={this.props.enlarged} />
                            </div>
                            <div className="jcard_info">
                                {!this.props.owners || !this.props.owners[index] ? null : (
                                    <PlayerInfo name={this.props.owners[index].name}
                                                avatar={this.props.owners[index].avatar}
                                                media={this.props.owners[index].media}
                                                score={this.props.owners[index].score}
                                                connected={this.props.owners[index].connected} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else { // TODO handle judgeFocusIndex, winnerIndex
            return (
                <div className="pcard_bin">
                    {this.props.pCards.map((pCard, index) => (
                        <div key={index} className='pcard_slot'>
                            <div>
                                <PCard  src={pCard}
                                        image={pCard.image}
                                        text={pCard.text}
                                        faceup={pCard.faceup}
                                        onClick={this.props.onClick ? (() => this.props.onClick(index, pCard)) : null}
                                        saveState={pCard.saveState}
                                        save={() => this.props.save(pCard._id)} />
                            </div>
                            <div>
                                {!this.props.owners || !this.props.owners[index] ? null : (
                                    <PlayerInfo name={this.props.owners[index].name}
                                                avatar={this.props.owners[index].avatar}
                                                media={this.props.owners[index].media}
                                                score={this.props.owners[index].score}
                                                connected={this.props.owners[index].connected} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    }
}