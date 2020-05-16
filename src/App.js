import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Sidebar from "./gui/Sidebar";
import Canvas from "./canvas/Canvas";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentEntity: null };
    this.canvas = new Canvas({ updateEntity: this.updateEntity });
  }

  updateEntity = (id) => {
    this.setState({ currentEntity: id });
  };

  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route
            path="/"
            render={(props) => <Sidebar {...props} canvas={this.canvas} currentEntity={this.state.currentEntity}/>}
          />
        </Switch>
      </Router>
    );
  }
}
