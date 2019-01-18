import React from "react";
import "../css/app.css";
import Route from "react-router-dom/es/Route";
import Switch from "react-router-dom/es/Switch"
import Root from "./Root"

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user_id: null
        };
    }

    componentDidMount() {
        this.getUser();
    }

    render() {
        if (this.state.user_id === null) {
            return this.withNavButtons(
                <Switch>
                    <Route exact path="/" render={() => <Login appState={this.state} />} />
                    <Route exact path="/about" render={() => <About appState={this.state} />} />
                    <Redirect from="*" to="/" />
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
                    <Redirect from="*" to="/" />
                </Switch>
            );
        }
    }

    withNavButtons = (element) => {
        return (
            <div>
                <NavButtons {...element.props} page={element.type} logout={this.logout} />
                {element}
            </div>
        );
    }

    getUser = () => {
        this.setState({
            user_id: '12345' // TODO
        });
    }

    logout = () => {
        this.setState({
            user_id: null
        });
    }
}