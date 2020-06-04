import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Viewer from "./Viewer";

export default class App extends React.Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route
            path="/"
            render={(props) => <Viewer {...props} />}
          />
        </Switch>
      </Router>
    );
  }
}
