import React from "react";
import ReactDOM from "react-dom";
import { Toast, Spinner } from "react-bootstrap";
import { Zoom, Flip, Fade } from "react-reveal";

export default class Toasty extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: true, destroyed: false };
  }

  destroy() {
    this.setState({ show: false });
    setTimeout(() => this.setState({ destroyed: true }), 150);
  }

  create(variant) {
    switch (variant) {
      case "SAVE":
        return (
          <Toast
            show={this.state.show}
            onClose={() => this.destroy()}
            autohide
          >
            <Toast.Header style={{ backgroundColor: "white" }}>
              <span style={{ color: "#212529" }} className="mr-auto">
                Guardado con éxito
              </span>
            </Toast.Header>
          </Toast>
        );
      case "PDF":
        return (
          <Toast show={this.state.show} onClose={() => this.destroy()}>
            <Toast.Header style={{ height: "2rem" }}>
              <strong className="mr-auto">Archivo PDF</strong>
            </Toast.Header>
            <Toast.Body style={{ backgroundColor: "white" }}>
              <Spinner animation="border" size="sm" /> Preparando la descarga...
            </Toast.Body>
          </Toast>
        );
      case "XLSX":
        return (
          <Toast show={this.state.show} onClose={() => this.destroy()}>
            <Toast.Header style={{ height: "2rem" }}>
              <strong className="mr-auto">Archivo XLXS</strong>
            </Toast.Header>
            <Toast.Body style={{ backgroundColor: "white" }}>
              <Spinner animation="border" size="sm" /> Preparando la descarga...
            </Toast.Body>
          </Toast>
        );
      default:
        console.warn("[TOASTER] Tried to make a toast for a wrong variant.");
        return null;
    }
  }

  render() {
    return this.state.destroyed ? null : this.create(this.props.variant);
  }
}
