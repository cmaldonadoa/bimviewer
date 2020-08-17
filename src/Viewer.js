import React from "react";
import Sidebar from "./gui/Sidebar";
import TreeContextMenu from "./gui/TreeContextMenu";
import Canvas from "./canvas/Canvas";
import ModelTracker from "./canvas/ModelTracker";
import CanvasContextMenu from "./gui/CanvasContextMenu";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

export default class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currentModel: "",
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
    this.modelTracker = new ModelTracker();
    this.canvas = new Canvas({
      modelName: props.match.params.hash,
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

  async componentDidMount() {
    var { hash } = this.props.match.params;
    var urls = [];
    await fetch(`https://bimapi.velociti.cl/dev_get_file/${hash}/`, {
      headers: {
        Authorization: "public_auth",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 202) {
          this.setState({ loading: true });
        } else {
          let files = data.files;
          this.setState({ modelName: hash });
          files.forEach((file) => {
            let url = {
              name: file.filename,
              model: file.gltf,
              metadata: file.metadata,
              xeokitMetadata: file.xeokit,
              tag: file.tag,
            };
            urls.push(url);
          });
        }
      })
      .catch((err) => console.error(err));

    if (!this.state.loading) {
      for (var url of urls) {
        let { tag, model, xeokitMetadata } = url;
        await fetch(`https://bimviewer.velociti.cl/${url.metadata}`)
          .then((res) => res.json())
          .then((res) => {
            this.modelTracker.addModel(
              url.name,
              tag,
              res,
              model,
              xeokitMetadata
            );
          })
          .catch((err) => console.error(err));
      }

      this.canvas.setModelTracker(this.modelTracker);
      this.canvas.build();

      await fetch(`https://bimapi.velociti.cl/dev_get_annotations/${hash}`)
        .then((res) => res.json())
        .then((res) => this.canvas.loadAnnotations(res))
        .catch((err) => console.error(err));
    }
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
  openCanvasContextMenu(x, y, state) {
    this.setState({
      openCanvasContextMenu: true,
      entity: this.modelTracker.getSelected(),
      x: x,
      y: y,
      canvasContextState: state,
    });
  }

  closeCanvasContextMenu() {
    this.setState({
      openCanvasContextMenu: false,
    });
  }

  //------------------------------------------------------------------------------------------------------------------
  // Tools tab
  //------------------------------------------------------------------------------------------------------------------
  setEdges(state) {
    this.canvas ? this.canvas.setEdges(state) : (() => {})();
  }

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

  showAll() {
    this.canvas ? this.canvas.showAll() : (() => {})();
  }

  getModelName(id) {
    return this.modelTracker.getModelName(id);
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
    const rulersDots = document.getElementsByClassName("viewer-ruler-dot");
    const rulersWires = document.getElementsByClassName("viewer-ruler-wire");
    const rulersLabels = document.getElementsByClassName("viewer-ruler-label");

    var cwidth = canvas.width;
    var cheight = canvas.height;

    var doc = new jsPDF({
      orientation: "l",
      unit: "px",
      format: [1.3333 * cwidth, 1.3333 * cheight],
    });

    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, cwidth, cheight); // Draw model;

    for (let element of annotationsMarkers) {
      let left = parseInt(element.style.left);
      let top = parseInt(element.style.top);
      await html2canvas(element, { backgroundColor: "rgba(0,0,0,0)" }).then(
        (canvasElement) => {
          let width = canvasElement.width;
          let height = canvasElement.height;
          doc.addImage(
            canvasElement.toDataURL("image/png"),
            "PNG",
            left,
            top,
            width,
            height
          );
        }
      );
    }

    for (let element of annotationsLabels) {
      let left = parseInt(element.style.left) - 15;
      let top = parseInt(element.style.top);
      await html2canvas(element, { backgroundColor: "rgba(0,0,0,0)" }).then(
        (canvasElement) => {
          let width = canvasElement.width;
          let height = canvasElement.height;
          doc.addImage(
            canvasElement.toDataURL("image/png"),
            "PNG",
            left,
            top,
            width,
            height
          );
        }
      );
    }

    for (let element of rulersDots) {
      let left = parseInt(element.style.left);
      let top = parseInt(element.style.top);
      await html2canvas(element, { backgroundColor: "rgba(0,0,0,0)" }).then(
        (canvasElement) => {
          let width = canvasElement.width;
          let height = canvasElement.height;
          doc.addImage(
            canvasElement.toDataURL("image/png"),
            "PNG",
            left,
            top,
            width,
            height
          );
        }
      );
    }

    for (let element of rulersWires) {
      let left = parseInt(element.style.left);
      let top = parseInt(element.style.top);
      await html2canvas(element, { backgroundColor: "rgba(0,0,0,0)" }).then(
        (canvasElement) => {
          let width = canvasElement.width;
          let height = canvasElement.height;
          doc.addImage(
            canvasElement.toDataURL("image/png"),
            "PNG",
            left,
            top,
            width,
            height
          );
        }
      );
    }

    for (let element of rulersLabels) {
      let left = parseInt(element.style.left);
      let top = parseInt(element.style.top);
      await html2canvas(element, { backgroundColor: "rgba(0,0,0,0)" }).then(
        (canvasElement) => {
          let width = canvasElement.width;
          let height = canvasElement.height;
          doc.addImage(
            canvasElement.toDataURL("image/png"),
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

  saveAnnotations() {
    var { hash } = this.props.match.params;
    var annotations = this.canvas ? this.canvas.getAnnotations() : [];
    fetch(`https://bimapi.velociti.cl/dev_save_annotations/${hash}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        annotations: annotations,
      }),
    })
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  }

  toggleAnnotationVisibility(index) {
    var annotations = [...this.state.annotations];
    var id = annotations[index].id;
    this.canvas ? this.canvas.toggleAnnotationVisibility(id) : (() => {})();
  }

  render() {
    return (
      <React.Fragment>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.loading}
        >
          <Alert elevation={6} variant="filled" severity="error">
            El modelo aún esta siendo procesado, inténtelo más tarde.
          </Alert>
        </Snackbar>
        <CanvasContextMenu
          entity={this.state.entity}
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
          metadata={this.modelTracker.getMetadata()}
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
            setEdges: (mode) => this.setEdges(mode),
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
            saveAnnotations: () => this.saveAnnotations(),
            takeSnapshot: () => this.takeSnapshot(),
            downloadExcel: () => this.downloadExcel(),
            downloadPDF: () => this.downloadPDF(),
            showAll: () => this.showAll(),
            getModelName: (id) => this.getModelName(id),
          }}
        />
      </React.Fragment>
    );
  }
}
