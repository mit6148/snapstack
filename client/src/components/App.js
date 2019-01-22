import React from "react";
import Route from "react-router-dom/es/Route";
import Redirect from "react-router-dom/es/Redirect";
import Switch from "react-router-dom/es/Switch";
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
    }

    componentDidMount() {
        this.getUser();
    }

    render() { // TODO don't render until user is fetched; TODO /profile doesn't redirect when not logged in
        return (
            <div>
                <Switch>
                    <Route exact path="/" render={() => <Root appState={this.state} enterGame={this.enterGame} quitGame={this.quitGame} />} />
                    <Route exact path="/about" render={() => <About appState={this.state} />} />
                    {this.state.user_id === null ? null :
                        <Route exact path="/profile/:id" render={(props) => <Profile appState={this.state} id={props.match.params.id} logout={this.logout} />} />}
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
