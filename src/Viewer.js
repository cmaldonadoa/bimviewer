import React from "react";
import Sidebar from "./gui/Sidebar";
import TreeContextMenu from "./gui/TreeContextMenu";
import Canvas from "./canvas/Canvas";
import CanvasContextMenu from "./gui/CanvasContextMenu";

export default class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.modelPath = "/models/ifc/"
    this.modelName = "IFC_Schependomlaan"
    this.state = {
      mounting: true,
      currentEntity: null,
      openTreeContextMenu: null,
      treeContextId: null,
      treeContextState: {},
      openCanvasContextMenu: null,
      canvasContextState: {},
      x: 0,
      y: 0,
      annotations: [],
    };

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `${this.modelPath}${this.modelName}_id.json`, false);
    xhttp.send();
    this.xresponse = JSON.parse(xhttp.response);

    this.canvas = new Canvas({
      allIds: Object.keys(this.xresponse),
      modelName: this.modelName,
      modelPath: this.modelPath,
      updateEntity: (id) => this.updateEntity(id),
      openTreeContextMenu: (node, x, y, element, state) =>
        this.openTreeContextMenu(node, x, y, element, state),
      closeTreeContextMenu: () => this.closeTreeContextMenu(),
      openCanvasContextMenu: (x, y, element, state) =>
        this.openCanvasContextMenu(x, y, element, state),
      closeCanvasContextMenu: () => this.closeCanvasContextMenu(),
      signalNewAnnotation: (annotation) => this.addAnnotation(annotation),
      signalMount: () => this.signalMount(),
    });
  }

  //------------------------------------------------------------------------------------------------------------------
  // Show metadata
  //------------------------------------------------------------------------------------------------------------------
  updateEntity(id) {
    this.setState({
      currentEntity: id,
    });
  }

  //------------------------------------------------------------------------------------------------------------------
  // Load tree view
  //------------------------------------------------------------------------------------------------------------------
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

  //------------------------------------------------------------------------------------------------------------------
  // Tree context menu
  //------------------------------------------------------------------------------------------------------------------
  openTreeContextMenu(node, x, y, element, state) {
    this.setState({
      openTreeContextMenu: element,
      treeNode: node,
      x: x,
      y: y,
      treeContextState: state,
    });
  }

  closeTreeContextMenu() {
    this.setState({
      openTreeContextMenu: null,
      treeNode: null,
      treeContextState: {},
    });
  }

  toggleVisibility(node, flag) {
    this.canvas.toggleVisibility(node, flag);
  }

  toggleXray(node, flag) {
    console.log(node);
    this.canvas.toggleXray(node, flag);
  }

  toggleSelect(node, flag) {
    this.canvas.toggleSelect(node, flag);
  }

  lookAt(id) {
    this.canvas.lookAt(id);
  }

  isolate(node) {
    console.error("NOT IMPLEMENTED");
  }

  //------------------------------------------------------------------------------------------------------------------
  // Canvas context menu
  //------------------------------------------------------------------------------------------------------------------
  openCanvasContextMenu(x, y, element, state) {
    this.setState({
      openCanvasContextMenu: element,
      entity: element,
      x: x,
      y: y,
      canvasContextState: state,
    });
  }

  closeCanvasContextMenu() {
    this.setState({
      openCanvasContextMenu: null,
    });
  }

  //------------------------------------------------------------------------------------------------------------------
  // Tools tab
  //------------------------------------------------------------------------------------------------------------------
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
    this.canvas.setStorey(value);
  }

  setCameraMode(mode) {
    this.canvas.setCameraMode(mode);
  }

  createSectionPlane() {
    this.canvas.createSectionPlane();
  }

  fitModel() {
    this.canvas.fitModel();
  }

  measureDistance() {
    this.canvas.measureDistance();
  }

  createAnnotations() {
    this.canvas.createAnnotations();
  }

  takeSnapshot() {
    this.canvas.takeSnapshot();
  }

  downloadExcel () {
    fetch("/php/xml_xls.php", {
      method: "POST",
      body: JSON.stringify({
        filename: this.modelName,
        folder: this.modelPath,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        var a = document.createElement("a");
        a.href = res.file;
        a.download = `${this.modelName}.xlsx`;
        a.click();
      })
      .catch((err) => console.error(err));
  };

  //------------------------------------------------------------------------------------------------------------------
  // Signals
  //------------------------------------------------------------------------------------------------------------------

  addAnnotation(annotation) {
    this.setState((prevState) => ({
      annotations: [...prevState.annotations, annotation],
    }));
  }

  removeAnnotation(index) {
    var annotations = [...this.state.annotations];
    var id = annotations[index].id;
    delete annotations[index];
    this.canvas.destroyAnnotation(id);
    this.setState((prevState) => ({
      annotations: annotations,
    }));
  }

  updateAnnotation(index, name, description) {
    var annotations = [...this.state.annotations];
    var id = annotations[index].id;
    var newAnnotation = { id: id, name: name, description: description };
    annotations[index] = newAnnotation;
    this.canvas.updateAnnotation(id, name, description);
    this.setState((prevState) => ({
      annotations: annotations,
    }));
  }

  toggleAnnotationVisibility(index) {
    var annotations = [...this.state.annotations];
    var id = annotations[index].id;
    this.canvas.toggleAnnotationVisibility(id);
  }

  render() {
    return (
      <React.Fragment>
        <CanvasContextMenu
          entity={this.state.openCanvasContextMenu}
          open={this.state.openCanvasContextMenu}
          close={() => this.closeCanvasContextMenu()}
          reopen={(target) =>
            this.openCanvasContextMenu(
              target.offsetLeft,
              target.offsetTop,
              target
            )
          }
          state={this.state.canvasContextState}
          x={this.state.x}
          y={this.state.y}
          callbacks={{
            toggleVisibility: (node) => this.toggleVisibility(node, false),
            toggleXray: (node) => this.toggleXray(node, false),
            toggleSelect: (node) => this.toggleSelect(node, false),
            lookAt: (id) => this.lookAt(id),
            isolate: (node) => this.isolate(node, false),
          }}
        />
        <TreeContextMenu
          node={this.state.treeNode}
          open={this.state.openTreeContextMenu}
          close={() => this.closeTreeContextMenu()}
          reopen={(target) =>
            this.openTreeContextMenu(
              target.offsetLeft,
              target.offsetTop,
              target
            )
          }
          state={this.state.treeContextState}
          x={this.state.x}
          y={this.state.y}
          callbacks={{
            toggleVisibility: (node) => this.toggleVisibility(node, true),
            toggleXray: (node) => this.toggleXray(node, true),
            toggleSelect: (node) => this.toggleSelect(node, true),
            lookAt: (id) => this.lookAt(id),
            isolate: (node) => this.isolate(node, true),
          }}
        />
        <Sidebar
          loading={this.state.mounting}
          metadata={this.xresponse}
          onClick={() => this.closeTreeContextMenu()}
          tree={{
            mount: () => this.mountTree(),
            unmount: () => this.unmountTree(),
            currentEntity: this.state.currentEntity,
          }}
          annotations={this.state.annotations}
          tools={{
            getStoreys: () => this.getStoreys(),
            setStorey: (value) => this.setStorey(value),
            setProjection: (mode) => this.setProjection(mode),
            setFirstPerson: (mode) => this.setFirstPerson(mode),
            setCameraMode: (mode) => this.setCameraMode(mode),
            createSectionPlane: () => this.createSectionPlane(),
            fitModel: () => this.fitModel(),
            measureDistance: () => this.measureDistance(),
            createAnnotations: () => this.createAnnotations(),
            destroyAnnotation: (index) => this.removeAnnotation(index),
            toggleAnnotation: (index) => this.toggleAnnotationVisibility(index),
            saveAnnotation: (index, name, description) =>
              this.updateAnnotation(index, name, description),
            takeSnapshot: () => this.takeSnapshot(),
            downloadExcel: () => this.downloadExcel()
          }}
        />
      </React.Fragment>
    );
  }
}
