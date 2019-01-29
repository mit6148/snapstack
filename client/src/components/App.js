import React from "react";
import Route from "react-router-dom/es/Route";
import Redirect from "react-router-dom/es/Redirect";
import Switch from "react-router-dom/es/Switch";
import textFit from 'textfit';
import Root from "./pages/Root";
import About from "./pages/About";
import Profile from "./pages/Profile";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userId: null,
            gameCode: null
        };

        this.resizeTimer = null;
    }

    componentDidMount() {
        this.getUser();
        window.addEventListener('resize', e => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                console.log('asdf');
                textFit(document.getElementsByClassName('fit_resize'), {alignHoriz: true, alignVert: true, minFontSize: 8, maxFontSize: 16, multiLine: true});
            }, 25);
        })
    }

    render() { // TODO don't render until user is fetched; TODO /profile doesn't redirect when not logged in
        return (
            <div className="fill_parent">
                <Switch>
                    <Route exact path="/" render={() => <Root appState={this.state} enterGame={this.enterGame} quitGame={this.quitGame} />} />
                    <Route exact path="/about" render={() => <About appState={this.state} />} />
                    <Route exact path="/profile/:id" render={(props) => <Profile appState={this.state} id={props.match.params.id} logout={this.logout} />} />
                    <Redirect from="*" to="/" />
                </Switch>
            </div>
        );
    }

    getUser = () => {
        fetch("/api/whoami").then(res => res.json()).then(userObj => {
            this.setState({
                userId: userObj._id
            });
            console.log(userObj);
        }).catch(console.error);
    }

    logout = () => {
        this.setState({
            userId: null,
            gameCode: null
        });
    }

    enterGame = (gameCode) => {
        this.setState({
            gameCode: gameCode
        });
    }

    quitGame = () => {
        this.setState({
            gameCode: null
        });
    }
}
