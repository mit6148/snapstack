import React from "react";
import "../css/app.css";
import Route from "react-router-dom/es/Route";
import Switch from "react-router-dom/es/Switch"
import Root from "./Root"

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userId: null
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
            userId: '12345' // TODO
        });
    }

    logout = () => {
        this.setState({
            userId: null
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
