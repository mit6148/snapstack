import React from "react";
import HomeNavBtn from "./HomeNavBtn";
import AboutNavBtn from "./AboutNavBtn";
import ProfileNavBtn from "./ProfileNavBtn";
import LogoutNavBtn from "./LogoutNavBtn";
import LeaveNavBtn from "./LeaveNavBtn";

import "../../css/nav.css";

export default class NavButtons extends React.Component {
    render() {
        return (
            <div className = 'nav_buttons'>
                {this.getNavButtons()}
            </div>
        );
    }

    getNavButtons = () => {
        switch(this.props.page) {
            case 'Login':
                return (
                    <React.Fragment>
                        <HomeNavBtn appState={this.props.appState} selected={true} />
                        <AboutNavBtn appState={this.props.appState} />
                    </React.Fragment>
                );
            case 'Home':
                return (
                    <React.Fragment>
                        <HomeNavBtn appState={this.props.appState} selected={true} />
                        <AboutNavBtn appState={this.props.appState} />
                        <ProfileNavBtn appState={this.props.appState} />
                    </React.Fragment>
                );
            case 'Profile':
                return (
                    <React.Fragment>
                        <HomeNavBtn appState={this.props.appState} />
                        <ProfileNavBtn appState={this.props.appState} selected={this.props.profileId === this.props.appState.userId} />
                        {this.props.profileId === this.props.appState.userId ? <LogoutNavBtn appState={this.props.appState} logout={this.props.logout} /> : null}
                    </React.Fragment>
                );
            case 'About':
                return (
                    <React.Fragment>
                        <HomeNavBtn appState={this.props.appState} />
                    </React.Fragment>
                );
            case 'Lobby':
                return (
                    <React.Fragment>
                        <LeaveNavBtn appState={this.props.appState} quitGame={this.props.quitGame} />
                    </React.Fragment>
                );
            case 'Game':
                return (
                    null
                );
        }
    }
}