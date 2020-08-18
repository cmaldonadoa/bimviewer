import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Viewer from "./Viewer";
import ModelUploaderHome from "./ModelUploaderHome";

export default class App extends React.Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route
            path="/:hash"
            render={(props) => <Viewer {...props} />}
          />
          
          <Route
            path="/"
            render={(props) => <ModelUploaderHome {...props} />}
          />
        </Switch>
      </Router>
    );
  }
}
