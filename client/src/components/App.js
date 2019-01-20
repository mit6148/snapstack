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

    render() {
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
            if(userObj._id !== undefined) {
                this.setState({
                        userId: userObj._id,
                        gameCode: userObj.currentGameCode || null
                    });
            } else {
                this.setState({userId: null, gameCode: null});
            }
        });
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
