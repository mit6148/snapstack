import React from "react";
import HomeNavBtn from "./HomeNavBtn";
import AboutNavBtn from "./AboutNavBtn";
import ProfileNavBtn from "./ProfileNavBtn";
import LogoutNavBtn from "./LogoutNavBtn";
import QuitNavBtn from "./QuitNavBtn";

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
                    <HomeNavBtn appState={this.props.appState} selected={true} />
                    <AboutNavBtn appState={this.props.appState} />
                );
            case 'Home':
                return (
                    <HomeNavBtn appState={this.props.appState} selected={true} />
                    <AboutNavBtn appState={this.props.appState} />
                    <ProfileNavBtn appState={this.props.appState} />
                );
            case 'GameContainer':
                return (
                    <QuitNavBtn appState={this.props.appState} />
                );
            case 'Profile':
                return (
                    <HomeNavBtn appState={this.props.appState} />
                    <AboutNavBtn appState={this.props.appState} />
                    <ProfileNavBtn appState={this.props.appState} selected={this.props.params.id === this.props.appState.userId} />
                    <LogoutNavBtn appState={this.props.appState} logout={this.props.logout} />
                );
            case 'About':
                return (
                    <HomeNavBtn appState={this.props.appState} />
                    <AboutNavBtn appState={this.props.appState} selected={true} />
                    {this.props.appState.userId === null ? null : <ProfileNavBtn appState={this.props.appState} />}
                );
        }
    }
}