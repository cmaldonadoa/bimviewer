import React from "react";
import Sidebar from "./gui/Sidebar";
import TreeContextMenu from "./gui/TreeContextMenu";
import Canvas from "./canvas/Canvas";

export default class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mounting: true,
      currentEntity: null,
      openTreeContextMenu: null,
      treeContextId: null,
      treeContextOptions: {},
      x: 0,
      y: 0,
    };

    this.canvas = new Canvas({
      updateEntity: (id) => this.updateEntity(id),
      openTreeContextMenu: (node, x, y, element, options) =>
        this.openTreeContextMenu(node, x, y, element, options),
      closeTreeContextMenu: () => this.closeTreeContextMenu(),
      signalMount: () => this.signalMount(),
    });
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/models/IFC_Schependomlaan_id.json`, false);
    xhttp.send();
    this.xresponse = JSON.parse(xhttp.response);
  }

  // Show Metadata
  updateEntity(id) {
    this.setState({
      currentEntity: id,
    });
  }

  // Load tree view plugin
  mountTree() {
    this.canvas.mountTree();
  }

  signalMount() {
    this.setState({
      mounting: false,
    });
  }

  unmountTree() {
    this.canvas.unmountTree();
    this.setState({
      mounting: true,
    });
  }

  // Tree view context menu
  openTreeContextMenu(node, x, y, element, options) {
    this.setState({
      openTreeContextMenu: element,
      treeNode: node,
      x: x,
      y: y,
      treeContextOptions: options,
    });
  }

  closeTreeContextMenu() {
    this.setState({
      openTreeContextMenu: null,
    });
  }

  toggleVisibility(node) {
    this.canvas.toggleVisibility(node);
  }

  toggleXray(node) {
    this.canvas.toggleXray(node);
  }

  toggleSelect(node) {
    this.canvas.toggleSelect(node);
  }

  lookAt(id) {
    this.canvas.lookAt(id);
  }

  isolate(node) {
    console.error("NOT IMPLEMENTED");
  }

  // Tools tab
  setProjection(mode) {
    this.canvas.setProjection(mode);
  }

  setFirstPerson(mode) {
    this.canvas.setFirstPerson(mode);
  }

  getStoreys() {
    return this.canvas.getStoreys();
  }

  setStorey(value) {
    this.canvas.setStorey(value)
  }

  render() {
    return (
      <React.Fragment>
        <TreeContextMenu
          node={this.state.treeNode}
          open={this.state.openTreeContextMenu}
          reopen={(target) =>
            this.openTreeContextMenu(
              target.offsetLeft,
              target.offsetTop,
              target
            )
          }
          options={this.state.treeContextOptions}
          x={this.state.x}
          y={this.state.y}
          callbacks={{
            toggleVisibility: (node) => this.toggleVisibility(node),
            toggleXray: (node) => this.toggleXray(node),
            toggleSelect: (node) => this.toggleSelect(node),
            lookAt: (id) => this.lookAt(id),
            isolate: (node) => this.isolate(node),
          }}
        />
        <Sidebar
          loading={this.state.mounting}
          metadata={this.xresponse}
          onClick={() => this.closeTreeContextMenu()}
          tree={{
            mount: () => this.mountTree(),
            unmount: () => this.unmountTree(),
            currentEntity: this.state.currentEntity

          }}
          tools={{
            getStoreys: () => this.getStoreys(),
            setStorey: (value) => this.setStorey(value),
            setProjection: (mode) => this.setProjection(mode),
            setFirstPerson: (mode) => this.setFirstPerson(mode)
          }}
        />
      </React.Fragment>
    );
  }
}
