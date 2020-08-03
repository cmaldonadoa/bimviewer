import React from "react";
import Sidebar from "./gui/Sidebar";
import TreeContextMenu from "./gui/TreeContextMenu";
import Canvas from "./canvas/Canvas";
import CanvasContextMenu from "./gui/CanvasContextMenu";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metadata: {},
      modelName: "",
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
  }

  async componentDidMount() {
    var { hash } = this.props.match.params;
    var urls = {};
    await fetch(`https://bimapi.velociti.cl/dev_get_file/${hash}/`, {
      headers: {
        Authorization: "public_auth",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ modelName: data.name });
        urls.model = data.model;
        urls.metadata = data.metadata;
        urls.xeokitMetadata = data.xeokit;
      })
      .catch((err) => console.error(err));

    await fetch(`https://bimviewer.velociti.cl/${urls.metadata}`)
      .then((res) => res.json())
      .then((res) => {
        this.setState({ metadata: res });
        this.canvas = new Canvas({
          allIds: Object.keys(res),
          modelUrl: `https://bimviewer.velociti.cl/${urls.model}`,
          metadataUrl: `https://bimviewer.velociti.cl/${urls.xeokitMetadata}`,
          modelName: this.state.modelName,
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
    this.canvas ? this.canvas.mountTree() : (() => {})();
  }

  signalMount() {
    this.setState({
      mounting: false,
    });
  }

  unmountTree() {
    this.canvas ? this.canvas.unmountTree() : (() => {})();
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
    this.canvas ? this.canvas.toggleVisibility(node, flag) : (() => {})();
  }

  toggleXray(node, flag) {
    this.canvas ? this.canvas.toggleXray(node, flag) : (() => {})();
  }

  toggleSelect(node, flag) {
    this.canvas ? this.canvas.toggleSelect(node, flag) : (() => {})();
  }

  lookAt(id) {
    this.canvas ? this.canvas.lookAt(id) : (() => {})();
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
    this.canvas ? this.canvas.setProjection(mode) : (() => {})();
  }

  setFirstPerson(mode) {
    this.canvas ? this.canvas.setFirstPerson(mode) : (() => {})();
  }

  getStoreys() {
    return this.canvas ? this.canvas.getStoreys() : (() => {})();
  }

  setStorey(value) {
    this.canvas ? this.canvas.setStorey(value) : (() => {})();
  }

  setCameraMode(mode) {
    this.canvas ? this.canvas.setCameraMode(mode) : (() => {})();
  }

  createSectionPlane() {
    this.canvas ? this.canvas.createSectionPlane() : (() => {})();
  }

  destroySectionPlane() {
    this.canvas ? this.canvas.destroySectionPlane() : (() => {})();
  }

  fitModel() {
    this.canvas ? this.canvas.fitModel() : (() => {})();
  }

  measureDistance() {
    this.canvas ? this.canvas.measureDistance() : (() => {})();
  }

  destroyMeasurements() {
    this.canvas ? this.canvas.destroyMeasurements() : (() => {})();
  }

  createAnnotations() {
    this.canvas ? this.canvas.createAnnotations() : (() => {})();
  }

  takeSnapshot() {
    this.canvas ? this.canvas.takeSnapshot() : (() => {})();
  }

  downloadExcel() {
    var { hash } = this.props.match.params;

    fetch(`https://bimapi.velociti.cl/dev_get_excel/${hash}/`, {
      headers: {
        Authorization: "public_auth",
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = `${this.state.modelName}.xlsx`;
        a.click();
        a.remove();
      })
      .catch((err) => console.error(err));
  }

  async downloadPDF() {
    const canvas = document.getElementById("canvas");
    const annotationsMarkers = document.getElementsByClassName(
      "annotation-marker"
    );
    const annotationsLabels = document.getElementsByClassName(
      "annotation-label"
    );
    var cwidth = canvas.width;
    var cheight = canvas.height;

    var doc = new jsPDF({
      orientation: "l",
      unit: "px",
      format: [1.3333 * cwidth, 1.3333 * cheight],
    });

    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, cwidth, cheight); // Draw model);
    for (let marker of annotationsMarkers) {
      let left = parseInt(marker.style.left);
      let top = parseInt(marker.style.top);
      await html2canvas(marker, { backgroundColor: "rgba(0,0,0,0)" }).then(
        (cmarker) => {
          let width = cmarker.width;
          let height = cmarker.height;
          doc.addImage(
            cmarker.toDataURL("image/png"),
            "PNG",
            left,
            top,
            width,
            height
          );
        }
      );
    }
    for (let label of annotationsLabels) {
      let left = parseInt(label.style.left) - 15;
      let top = parseInt(label.style.top);
      await html2canvas(label, { backgroundColor: "rgba(0,0,0,0)" }).then(
        (clabel) => {
          let width = clabel.width;
          let height = clabel.height;
          doc.addImage(
            clabel.toDataURL("image/png"),
            "PNG",
            left,
            top,
            width,
            height
          );
        }
      );
    }
    doc.save(this.state.modelName + ".pdf");
  }

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
    this.canvas ? this.canvas.destroyAnnotation(id) : (() => {})();
    this.setState((prevState) => ({
      annotations: annotations,
    }));
  }

  updateAnnotation(index, name, description) {
    var annotations = [...this.state.annotations];
    var id = annotations[index].id;
    var newAnnotation = { id: id, name: name, description: description };
    annotations[index] = newAnnotation;
    this.canvas
      ? this.canvas.updateAnnotation(id, name, description)
      : (() => {})();
    this.setState((prevState) => ({
      annotations: annotations,
    }));
  }

  toggleAnnotationVisibility(index) {
    var annotations = [...this.state.annotations];
    var id = annotations[index].id;
    this.canvas ? this.canvas.toggleAnnotationVisibility(id) : (() => {})();
  }

  render() {
    console.log("rendering...", Object.keys(this.state.metadata).length);
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
          metadata={this.state.metadata}
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
            destroySectionPlane: () => this.destroySectionPlane(),
            fitModel: () => this.fitModel(),
            measureDistance: () => this.measureDistance(),
            clearMeasurements: () => this.destroyMeasurements(),
            createAnnotations: () => this.createAnnotations(),
            destroyAnnotation: (index) => this.removeAnnotation(index),
            toggleAnnotation: (index) => this.toggleAnnotationVisibility(index),
            saveAnnotation: (index, name, description) =>
              this.updateAnnotation(index, name, description),
            takeSnapshot: () => this.takeSnapshot(),
            downloadExcel: () => this.downloadExcel(),
            downloadPDF: () => this.downloadPDF(),
          }}
        />
      </React.Fragment>
    );
  }
}
