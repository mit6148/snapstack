import React from "react";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD } = specialCards;

export default class CardBin extends React.Component {
    render() {
        if (this.props.jCards !== undefined) {
            return (
                <div>
                    {this.props.jCards.map((jCard, index) => (
                        <div>
                            <div>
                                <JCard  src={jCard}
                                        text={jCard}
                                        onClick={this.props.onClick ? (() => this.props.onClick(index, jCard)) : null}
                                        enlarged={this.props.enlarged}
                                        key={index} />
                            </div>
                            <div>
                                {!this.props.owners || !this.props.owners[index] ? null : (
                                    <PlayerInfo name={this.props.owners[index].name}
                                                avatar={this.props.owners[index].avatar}
                                                media={this.props.owners[index].media}
                                                score={this.props.owners[index].score}
                                                connected={this.props.owners[index].connected}
                                                key={index} />
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
                        <div>
                            <div>
                                <PCard  src={pCard}
                                        image={pCard.image}
                                        text={pCard.text}
                                        faceup={pCard.faceup}
                                        onClick={this.props.onClick ? (() => this.props.onClick(index, pCard)) : null}
                                        saveState={pCard.saveState}
                                        save={() => this.props.save(pCard._id)}
                                        key={index} />
                            </div>
                            <div>
                                {!this.props.owners || !this.props.owners[index] ? null : (
                                    <PlayerInfo name={this.props.owners[index].name}
                                                avatar={this.props.owners[index].avatar}
                                                media={this.props.owners[index].media}
                                                score={this.props.owners[index].score}
                                                connected={this.props.owners[index].connected}
                                                key={index} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    }
}