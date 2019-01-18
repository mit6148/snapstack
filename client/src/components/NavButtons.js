import React from "react";

export default class NavButtons extends React.Component {
    render() {
        switch(this.props.page) {
            case 'Root':
                return (
                    <ProfileNavBtn appState={this.props.appState} />
                    <AboutNavBtn appState={this.props.appState} />
                );
            case 'Login':
                return (
                    <AboutNavBtn appState={this.props.appState} />
                );
            case 'Profile':
                return (
                    <LogoNavBtn appState={this.props.appState} />
                    <ProfileNavBtn appState={this.props.appState} selected={true} />
                    <AboutNavBtn appState={this.props.appState} />
                    <LogoutNavBtn appState={this.props.appState} logout={this.props.logout} />
                );
            case 'About':
                return (
                    <LogoNavBtn appState={this.props.appState} />
                    <ProfileNavBtn appState={this.props.appState} />
                    <AboutNavBtn appState={this.props.appState} selected={true} />
                );
            case 'GameContainer':
                return (
                    <QuitNavBtn appState={this.props.appState} />
                );
        }
    }
}