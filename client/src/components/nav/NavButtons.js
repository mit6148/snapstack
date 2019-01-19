import React from "react";
import HomeNavBtn from "./HomeNavBtn";
import AboutNavBtn from "./AboutNavBtn";
import ProfileNavBtn from "./ProfileNavBtn";
import LogoutNavBtn from "./LogoutNavBtn";

export default class NavButtons extends React.Component {
    render() {
        return (
            <div className = 'nav_buttons'>
                getNavButtons();
            </div>
        );
    }

    getNavButtons = () => {
        switch(this.props.page) {
            case 'Login':
                return (
                    <React.Fragment>
                        <AboutNavBtn appState={this.props.appState} />
                    </React.Fragment>
                );
            case 'Home':
                return (
                    <React.Fragment>
                        <AboutNavBtn appState={this.props.appState} />
                        <ProfileNavBtn appState={this.props.appState} />
                    </React.Fragment>
                );
            case 'GameContainer':
                return (
                    null
                );
            case 'Profile':
                return (
                    <React.Fragment>
                        <HomeNavBtn appState={this.props.appState} />
                        <ProfileNavBtn appState={this.props.appState} selected={this.props.params.id === this.props.appState.userId} />
                        {this.props.params.id === this.props.appState.userId ? <LogoutNavBtn appState={this.props.appState} logout={this.props.logout} /> : null}
                    </React.Fragment>
                );
            case 'About':
                return (
                    <React.Fragment>
                        <HomeNavBtn appState={this.props.appState} />
                    </React.Fragment>
                );
        }
    }
}