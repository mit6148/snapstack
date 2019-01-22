import React from "react";
import JCard from "../univ/JCard";
import PCard from "../univ/PCard";
import PlayerInfo from "../univ/PlayerInfo";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD } = specialCards;

export default class CardBin extends React.Component {
    render() {
        if (this.props.jCards !== undefined) {
            return (
                <div>
                    {this.props.jCards.map((jCard, index) => (
                        <div key={index}>
                            <div>
                                <JCard  src={jCard}
                                        text={jCard}
                                        onClick={this.props.onClick ? (() => this.props.onClick(index, jCard)) : null}
                                        enlarged={this.props.enlarged} />
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
        } else { // TODO handle judgeFocusIndex, winnerIndex
            return (
                <div>
                    {this.props.pCards.map((pCard, index) => (
                        <div key={index}>
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