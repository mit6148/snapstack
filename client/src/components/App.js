import React from "react";
import "../css/app.css";
import Route from "react-router-dom/es/Route";
import Switch from "react-router-dom/es/Switch"
import Root from "./Root"

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null
        };
    }

    componentDidMount() {
        this.getUser();
    }

    render() {
        if (this.state.user === null) {
            return this.withNavButtons(
                <Switch>
                    <Route exact path="/about" render={() => <About appState={this.state} />} />
                    <Route path="/" render={() => <Login appState={this.state} />} />
                </Switch>
            );
        }
        else {
            return this.withNavButtons(
                <Switch>
                    <Route exact path="/" render={() => <Root appState={this.state} />} />
                    <Route exact path="/profile/:id" render={() => <Profile appState={this.state} />} />
                    <Route exact path="/about" render={() => <About appState={this.state} />} />
                    <Route exact path="/game/:code" render={() => <GameContainer appState={this.state} />} />
                </Switch>
            );
        }
    }

    withNavButtons = (element) => {
        return (
            <div>
                <NavButtons appState={this.state} page={element.type} logout={this.logout} />
                {element}
            </div>
        );
    }

    getUser = () => {
        this.setState({
            user: '12345' // TODO
        });
    }

    logout = () => {
        this.setState({
            user: null
        });
    }
}