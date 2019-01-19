import React from "react";

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
                    <ProfileNavBtn appState={this.props.appState} />
                    <AboutNavBtn appState={this.props.appState} />
                );
            case 'GameContainer':
                return (
                    <QuitNavBtn appState={this.props.appState} />
                );
            case 'Profile':
                return (
                    <HomeNavBtn appState={this.props.appState} />
                    <ProfileNavBtn appState={this.props.appState} selected={this.props.params.id === this.props.appState.userId} />
                    <AboutNavBtn appState={this.props.appState} />
                    <LogoutNavBtn appState={this.props.appState} logout={this.props.logout} />
                );
            case 'About':
                return (
                    <HomeNavBtn appState={this.props.appState} />
                    {this.props.appState.userId === null ? null : <ProfileNavBtn appState={this.props.appState} />}
                    <AboutNavBtn appState={this.props.appState} selected={true} />
                );
        }
    }
}