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
            case 'Root':
                return (
                    <HomeNavBtn appState={this.props.appState} selected={true} />
                    <ProfileNavBtn appState={this.props.appState} />
                    <AboutNavBtn appState={this.props.appState} />
                );
            case 'Login':
                return (
                    <HomeNavBtn appState={this.props.appState} selected={true} />
                    <AboutNavBtn appState={this.props.appState} />
                );
            case 'Profile':
                return (
                    <HomeNavBtn appState={this.props.appState} />
                    <ProfileNavBtn appState={this.props.appState} selected={this.props.match.params.id === this.props.appState.user_id} />
                    <AboutNavBtn appState={this.props.appState} />
                    <LogoutNavBtn appState={this.props.appState} logout={this.props.logout} />
                );
            case 'About':
                return (
                    <HomeNavBtn appState={this.props.appState} />
                    {this.props.appState.user_id === null ? null : <ProfileNavBtn appState={this.props.appState} />}
                    <AboutNavBtn appState={this.props.appState} selected={true} />
                );
            case 'GameContainer':
                return (
                    <QuitNavBtn appState={this.props.appState} />
                );
        }
    }
}