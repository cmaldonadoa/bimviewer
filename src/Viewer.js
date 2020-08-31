import React from "react";
import Sidebar from "./gui/Sidebar";
import TreeContextMenu from "./gui/TreeContextMenu";
import Canvas from "./canvas/Canvas";
import ModelTracker from "./canvas/ModelTracker";
import CanvasContextMenu from "./gui/CanvasContextMenu";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Alert from "./components/Alert";

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
      bcf: [],
      currentBcf: -1,
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
      signalDownloadBcf: (annotations) => this.renderBcf(annotations),
    });
  }

  async componentDidMount() {
    var { hash } = this.props.match.params;
    var urls = [];
    await fetch(`https://bimapi.velociti.cl/dev_get_projects/${hash}/`, {
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
          this.setState({ modelName: data.project.replace(/\s/g, "_") });
          files.forEach((file) => {
            let url = {
              id: file.id,
              name: file.name,
              model: file.gltf,
              metadata: file.metadata,
              xeokitMetadata: file.xeokit,
              tag: file.tag,
            };
            urls.push(url);
          });
        }
      })
      .catch((err) =>
        Alert.alertError("Oh no!", "Ocurrió un error inesperado.")
      );

    if (!this.state.loading) {
      for (let url of urls) {
        let { id, name, tag, model, xeokitMetadata, metadata } = url;
        await fetch(`https://bimviewer.velociti.cl/${metadata}`)
          .then((res) => res.json())
          .then((res) => {
            this.modelTracker.addModel(tag, res, model, xeokitMetadata, {
              id: id,
              name: name,
            });
          })
          .catch((err) =>
            Alert.alertError("Oh no!", "Ocurrió un error inesperado.")
          );
      }

      this.canvas.setModelTracker(this.modelTracker);
      this.canvas.build();

      await fetch(`https://bimapi.velociti.cl/dev_get_bcf/${hash}`, {
        headers: {
          Authorization: "public_auth",
        },
      })
        .then((res) => res.json())
        .then((res) => this.setState({ bcf: res }))
        .catch((err) => console.log("No BCF"));
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

  getStoreys(type) {
    return this.canvas ? this.canvas.getStoreys(type) : (() => {})();
  }

  setStorey(value) {
    this.canvas ? this.canvas.setStorey(value) : (() => {})();
  }

  setCameraMode(mode) {
    this.canvas ? this.canvas.setCameraMode(mode) : (() => {})();
  }

  setZoom(value) {
    this.canvas ? this.canvas.setZoomRatio(value) : (() => {})();
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

  getModelMeta(id) {
    return this.modelTracker.getModelMeta(id);
  }

  getModelsByType(type) {
    return this.modelTracker.getModelsMetaByType(type);
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
    const alert = Alert.toastInfo("Generando archivo");
    const onSuccess = () => {
      alert.close();
      Alert.toastSuccess("Listo");
    };
    const onError = () => {
      alert.close();
      Alert.toastError("Algo salió mal");
    };
    this.canvas ? this.canvas.takeSnapshot(onSuccess, onError) : (() => {})();
  }

  loadBcf(index, download) {
    this.setState({ annotations: [], currentBcf: index });
    this.canvas
      ? this.canvas.loadBcf(this.state.bcf[index], download)
      : (() => {})();
  }

  downloadExcel(id) {
    const alert = Alert.toastInfo("Generando archivo");
    var { hash } = this.props.match.params;

    fetch(`https://bimapi.velociti.cl/dev_get_excel/${hash}/${id}`, {
      headers: {
        Authorization: "public_auth",
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        alert.close();
        Alert.toastSuccess("Listo");
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = `${this.state.modelName}.xlsx`;
        a.click();
        a.remove();
      })
      .catch((err) => {
        alert.close();
        Alert.toastError("Algo salió mal");
      });
  }

  async downloadPdf() {
    const alert = Alert.toastInfo("Generando archivo");
    try {
      const canvas = document.getElementById("canvas");
      const annotationsMarkers = document.getElementsByClassName(
        "annotation-marker"
      );
      const annotationsLabels = document.getElementsByClassName(
        "annotation-label"
      );
      const rulersDots = document.getElementsByClassName("viewer-ruler-dot");
      const rulersWires = document.getElementsByClassName("viewer-ruler-wire");
      const rulersLabels = document.getElementsByClassName(
        "viewer-ruler-label"
      );

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

      alert.close();
      Alert.toastSuccess("Listo");
      doc.save(this.state.modelName + ".pdf");
    } catch (error) {
      alert.close();
      Alert.toastError("Algo salió mal");
    }
  }

  async downloadBcf(annotations) {
    const alert = Alert.toastInfo("Generando archivo");
    try {
      const canvas = document.getElementById("canvas");
      const annotationsMarkers = document.getElementsByClassName(
        "annotation-marker"
      );

      var cwidth = canvas.width;
      var cheight = canvas.height;

      var doc = new jsPDF({
        orientation: "l",
        unit: "px",
        format: [1.3333 * cwidth, 1.3333 * cheight],
      });

      /* Draw canvas */
      doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, cwidth, cheight); // Draw model;

      var annotationsCount = 0;
      for (let element of annotationsMarkers) {
        let canvasPos = annotations[annotationsCount++].canvasPos;
        //let rect = element.getBoundingClientRect();
        let left = canvasPos[0];
        let top = canvasPos[1];
        await html2canvas(element, {
          backgroundColor: "rgba(0,0,0,0)",
        }).then((canvasElement) => {
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
        });
      }

      /* Write annotations content */
      doc.addPage();
      var top = 40;
      const left = 20;
      const innerWidth = cwidth - 20 - 20;

      doc.setFontSize(24);
      doc.text("Observaciones", left, top);
      top += 40;

      var number = 1;
      for (let element of annotations) {
        doc.setFontSize(20);
        let title = number++ + ". " + element.name;
        let tsize = doc.getTextDimensions(title);
        let tsplit = doc.splitTextToSize(title, innerWidth);
        doc.text(tsplit, left, top);
        top += tsize.h * tsplit.length;

        doc.setFontSize(16);
        let bsize = doc.getTextDimensions(element.description);
        let bsplit = doc.splitTextToSize(element.description, innerWidth);
        doc.text(bsplit, left, top);
        top += bsize.h * bsplit.length;

        doc.line(0, top, 1.3333 * cwidth, top);
        top += 40;
      }

      alert.close();
      Alert.toastSuccess("Listo");
      doc.save(this.state.modelName + ".pdf");
    } catch (error) {
      alert.close();
      Alert.toastError("Algo salió mal");
    }
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

  updateAnnotation(index, data) {
    const { name, description, responsible, specialty, date } = data;
    const annotations = [...this.state.annotations];
    const annotation = annotations[index];
    const id = annotation.id;
    const newAnnotation = {
      id: id,
      name: name,
      description: description,
      worldPos: annotation.worldPos,
      entity: annotation.entity,
      responsible: responsible,
      specialty: specialty,
      date: date,
    };
    annotations[index] = newAnnotation;
    this.canvas
      ? this.canvas.updateAnnotation(id, name, description)
      : (() => {})();
    this.setState({
      annotations: annotations,
    });
  }

  saveReply(index, data) {
    const { hash } = this.props.match.params;
    const { author, comment, date } = data;
    const annotations = [...this.state.annotations];
    const annotation = annotations[index];
    const replies = annotation.replies;
    const newAnnotation = {
      ...annotation,
      replies: [...replies, { author, comment, date }],
    };
    annotations[index] = newAnnotation;
    const bcf = this.state.bcf[this.state.currentBcf];
    bcf.annotations = annotations;

    const bcfs = this.state.bcf;
    bcfs[this.state.currentBcf] = bcf;

    this.setState({
      annotations: annotations,
      bcf: bcfs,
    });

    const alert = Alert.toastInfo("Guardando...");
    fetch(`https://bimapi.velociti.cl/dev_save_bcf/${hash}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bcf: bcfs,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        alert.close();
        Alert.toastSuccess("Guardado");
      })
      .catch((err) => {
        alert.close();
        Alert.toastError("Algo salió mal");
      });
  }

  toggleAnnotationVisibility(index) {
    var annotations = [...this.state.annotations];
    var id = annotations[index].id;
    this.canvas ? this.canvas.toggleAnnotationVisibility(id) : (() => {})();
  }

  saveBcf() {
    const alert = Alert.toastInfo("Guardando...");
    const { hash } = this.props.match.params;
    const newBcf = this.canvas ? this.canvas.createBcf() : {};
    const annotations = this.state.annotations;
    const bcf = [...this.state.bcf, { bcf: newBcf, annotations: annotations }];

    this.setState({
      bcf: bcf,
    });

    fetch(`https://bimapi.velociti.cl/dev_save_bcf/${hash}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bcf: bcf,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        alert.close();
        Alert.toastSuccess("Guardado");
      })
      .catch((err) => {
        alert.close();
        Alert.toastError("Algo salió mal");
      });
  }

  destroyBcf(index) {
    const { hash } = this.props.match.params;
    var bcf = [...this.state.bcf];
    delete bcf[index];

    this.setState((prevState) => ({
      bcf: bcf,
    }));

    fetch(`https://bimapi.velociti.cl/dev_save_bcf/${hash}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bcf: bcf,
      }),
    })
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  }

  renderBcf(annotations) {
    this.downloadBcf(annotations);
  }

  clearBcf() {
    this.canvas ? this.canvas.clearAnnotations() : (() => {})();
    this.setState({
      annotations: [],
      currentBcf: -1,
    });
  }

  render() {
    if (this.state.loading) {
      Alert.alertError(
        "Oops...",
        "Alguno de los modelos aún esta siendo procesado, inténtelo nuevamente más tarde."
      );
      return null;
    }

    return (
      <React.Fragment>
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
          }}
        />
        <Sidebar
          project={this.state.modelName}
          loading={this.state.mounting}
          metadata={this.modelTracker.getMetadata()}
          onClick={() => this.closeTreeContextMenu()}
          tree={{
            mount: () => this.mountTree(),
            unmount: () => this.unmountTree(),
            currentEntity: this.state.currentEntity,
          }}
          annotations={this.state.annotations}
          bcf={this.state.bcf}
          isBcfLoaded={this.state.currentBcf >= 0}
          clearBcf={() => this.clearBcf()}
          tools={{
            getStoreys: (type) => this.getStoreys(type),
            setStorey: (value) => this.setStorey(value),
            setEdges: (mode) => this.setEdges(mode),
            setProjection: (mode) => this.setProjection(mode),
            setFirstPerson: (mode) => this.setFirstPerson(mode),
            setCameraMode: (mode) => this.setCameraMode(mode),
            setZoom: (value) => this.setZoom(value),
            createSectionPlane: () => this.createSectionPlane(),
            destroySectionPlane: () => this.destroySectionPlane(),
            fitModel: () => this.fitModel(),
            measureDistance: () => this.measureDistance(),
            clearMeasurements: () => this.destroyMeasurements(),
            createAnnotations: () => this.createAnnotations(),
            destroyAnnotation: (index) => this.removeAnnotation(index),
            toggleAnnotation: (index) => this.toggleAnnotationVisibility(index),
            saveAnnotation: (index, data) => this.updateAnnotation(index, data),
            saveReply: (index, data) => this.saveReply(index, data),
            takeSnapshot: () => this.takeSnapshot(),
            downloadExcel: (id) => this.downloadExcel(id),
            downloadPdf: () => this.downloadPdf(),
            showAll: () => this.showAll(),
            getModelMeta: (id) => this.getModelMeta(id),
            getModelsByType: (type) => this.getModelsByType(type),
            saveBcf: () => this.saveBcf(),
            loadBcf: (index, download) => this.loadBcf(index, download),
            destroyBcf: (index) => this.destroyBcf(index),
            downloadBcf: (index) => this.downloadBcf(index),
          }}
        />
      </React.Fragment>
    );
  }
}
