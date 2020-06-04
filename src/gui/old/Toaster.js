import React from "react";
import ReactDOM from "react-dom";
import { Fade } from "react-reveal";

export default class Toaster extends React.Component {
  render() {
    var { toasts } = this.props;
    return (
      <div id="toast-container" style={{ width: "300px" }}>
        {toasts.map(toast =>
          toast ? (
            <Fade bottom className="m-1">
              {toast}
            </Fade>
          ) : null
        )}
      </div>
    );
  }
}
