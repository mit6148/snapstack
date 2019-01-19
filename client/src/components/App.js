import React from "react";
import Route from "react-router-dom/es/Route";
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
                        <Route exact path="/profile/:id" render={() => <Profile appState={this.state} logout={this.logout} />} />}
                    <Redirect from="*" to="/" />
                </Switch>
            </div>
        );
    }

    getUser = () => {
        this.setState({
            userId: '12345', // TODO
            gameCode: null
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

        let socket = null; // TODO
    }

    quitGame = () => {
        this.setState({
            gameCode: null
        });
    }
}
