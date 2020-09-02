import React from "react";
import Sidebar from "./gui/Sidebar";
import TreeContextMenu from "./gui/TreeContextMenu";
import Canvas from "./canvas/Canvas";
import ModelTracker from "./canvas/ModelTracker";
import CanvasContextMenu from "./gui/CanvasContextMenu";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import Alert from "./components/Alert";
import { v4 as uuidv4 } from "uuid";

export default class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currentModel: "",
      projectName: "",
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
      projectName: props.match.params.hash,
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
          this.setState({ projectName: data.project.replace(/\s/g, "_") });
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

  flyToAnnotation(index) {
    const annotations = [...this.state.annotations];
    const id = annotations[index].id;
    this.canvas ? this.canvas.flyToAnnotation(id) : (() => {})();
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

  downloadExcel(type, id) {
    const alert = Alert.toastInfo("Generando archivo");
    const { hash } = this.props.match.params;
    const modelName = this.getModelsByType(type).find(
      (model) => model.meta.id === id
    ).meta.name;

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
        a.download = `${modelName}.xlsx`;
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
      doc.save(this.state.projectName + ".pdf");
    } catch (error) {
      alert.close();
      Alert.toastError("Algo salió mal");
    }
  }

  async _createBcfPdf(index) {
    const viewpoint = this.state.bcf[index];
    const bcf = viewpoint.bcf;
    const annotations = viewpoint.annotations;

    const canvasBase64 = bcf.snapshot.snapshot_data;
    let width, height;

    const imgLoad = new Promise((resolve, reject) => {
      let i = new Image();
      i.onload = function () {
        width = i.width * 0.75;
        height = i.height * 0.75;
        resolve();
      };
      i.src = canvasBase64;
    });
    await imgLoad;

    const dim = { w: 1920 * 0.75, h: 938 * 0.75 };
    const canvasDim = { w: ((dim.w * 2) / 3) * 0.75, h: dim.h * 0.75 };
    const sideDim = { w: (dim.w / 3) * 0.75, h: dim.h * 0.75 };

    const doc = new jsPDF({
      orientation: "l",
      unit: "px",
      format: [dim.w, dim.h],
    });

    const ratio = Math.min(1, canvasDim.w / width, canvasDim.h / height);
    const actualWidth = width * ratio;
    const actualHeight = height * ratio;
    doc.addImage(canvasBase64, "PNG", sideDim.w, 0, actualWidth, actualHeight);
    doc.line(sideDim.w, 0, sideDim.w, dim.h * 0.75);

    const dx = sideDim.w / 2;
    const dy = (dim.h * 0.75 - actualHeight) / 2;
    annotations.forEach((annotation, idx) => {
      const pos = annotation.canvasPos;
      const glyph = "" + (idx + 1);
      const x = pos[0] * ratio * 0.75 + dx + actualWidth / 4;
      const y = pos[1] * ratio * 0.75 - dy + (canvasDim.h - actualHeight) / 2;
      doc.setLineWidth(1);
      doc.setFillColor(0);
      doc.circle(x, y, 6, "FD");
      doc.setTextColor(1, 1, 1, 1);
      doc.setFontSize(12);
      doc.text(glyph, x - 2, y + 3);
    });

    /* Write annotations content */
    var top = 0;
    const left = 15;
    const innerWidth = sideDim.w - 2 * left;

    annotations.forEach((annotation, idx) => {
      const glyph = "" + (idx + 1);
      doc.setFontSize(16);
      const title = glyph + ". " + annotation.name;
      const tsize = doc.getTextDimensions(title);
      const tsplit = doc.splitTextToSize(title, innerWidth);
      const allContents = [
        new Date(annotation.date).toLocaleString(),
        `Responsable : ${annotation.responsible}`,
        `Especialidad: ${annotation.specialty}`,
        annotation.description,
        ...annotation.replies.map(
          (reply) =>
            `[${new Date(reply.date).toLocaleString()}] ${reply.author}: ${
              reply.comment
            }`
        ),
      ];

      // Precalculate height
      let blockHeight = tsize.h * tsplit.length + 5;
      doc.setFontSize(12);
      allContents.forEach((content) => {
        const size = doc.getTextDimensions(content);
        const split = doc.splitTextToSize(content, innerWidth);
        blockHeight += size.h * split.length + 5;
      });

      if (top + blockHeight >= sideDim.h) {
        doc.addPage();
        top = 0;
        doc.addImage(
          canvasBase64,
          "PNG",
          sideDim.w,
          0,
          actualWidth,
          actualHeight
        );
        doc.line(sideDim.w, 0, sideDim.w, dim.h * 0.75);
        annotations.forEach((annotation, idx) => {
          const pos = annotation.canvasPos;
          const glyph = "" + (idx + 1);
          const x = pos[0] * ratio * 0.75 + dx + actualWidth / 4;
          const y =
            pos[1] * ratio * 0.75 - dy + (canvasDim.h - actualHeight) / 2;
          doc.setLineWidth(1);
          doc.setFillColor(0);
          doc.circle(x, y, 6, "FD");
          doc.setTextColor(1, 1, 1, 1);
          doc.setFontSize(12);
          doc.text(glyph, x - 2, y + 3);
        });
      }

      // Write content
      doc.setTextColor(0);
      doc.line(0, top, sideDim.w, top);
      top += 20;
      doc.setFontSize(16);
      doc.text(tsplit, left, top);
      top += tsize.h * tsplit.length + 5;

      doc.setFontSize(12);
      allContents.forEach((content) => {
        const size = doc.getTextDimensions(content);
        const split = doc.splitTextToSize(content, innerWidth);
        doc.text(split, left, top);
        top += size.h * split.length + 5;
      });
    });

    return doc;
  }

  async downloadBcf(index, name) {
    const alert = Alert.toastInfo("Generando archivo");
    try {
      const doc = await this._createBcfPdf(index);
      doc.save(name + ".pdf");
      alert.close();
      Alert.toastSuccess("Listo");
    } catch (error) {
      alert.close();
      Alert.toastError("Algo salió mal");
    }
  }

  async downloadAllBcf() {
    const _getBcfId = (index) => {
      let num = "" + (index + 1);
      while (num.length < 4) num = "0" + num;
      return "OBS-" + num;
    };

    const alert = Alert.toastInfo("Generando archivo");
    let zip = new JSZip();
    const viewpoints = this.state.bcf;
    let error = false;
    let index = 0;
    for (const viewpoint of viewpoints) {
      if (viewpoint && !error) {
        try {
          const doc = await this._createBcfPdf(index);
          zip.file(`pdf/${_getBcfId(index)}.pdf`, doc.output("blob"));
          const json = JSON.stringify(viewpoint.bcf);
          zip.file(`json/${_getBcfId(index)}.json`, json);
        } catch (err) {
          alert.close();
          error = true;
          Alert.toastError("Algo salió mal");
          break;
        }
      }
      index++;
    }

    if (!error) {
      zip
        .generateAsync({ type: "blob" })
        .then((content) => {
          alert.close();
          Alert.toastSuccess("Listo");
          saveAs(content, this.state.projectName + ".zip");
        })
        .catch((error) => {
          alert.close();
          Alert.toastError("Algo salió mal");
        });
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
      ...annotation,
      name,
      description,
      responsible,
      specialty,
      date,
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
    let annotations = [...this.state.annotations];
    const annotation = annotations[index];
    const replies = annotation.replies;
    const newReply = { guid: uuidv4(), author, comment, date };
    const newAnnotation = {
      ...annotation,
      replies: [...replies, newReply],
    };
    annotations[index] = newAnnotation;
    const bcf = this.state.bcf[this.state.currentBcf];
    const comments = [
      ...bcf.bcf.comments,
      {
        guid: newReply.guid,
        date: newReply.date.toISOString(),
        author: newReply.author,
        comment: newReply.comment,
        reply_to_comment_guid: annotation.guid,
      },
    ];

    bcf.bcf.comments = comments;
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
    const annotations = this.canvas.getAnnotationsCanvasPosition(
      this.state.annotations
    );
    const newBcf = this.canvas ? this.canvas.createBcf(annotations) : {};
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
          project={this.state.projectName}
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
            flyToAnnotation: (index) => this.flyToAnnotation(index),
            saveReply: (index, data) => this.saveReply(index, data),
            takeSnapshot: () => this.takeSnapshot(),
            downloadExcel: (type, id) => this.downloadExcel(type, id),
            downloadPdf: () => this.downloadPdf(),
            showAll: () => this.showAll(),
            getModelMeta: (id) => this.getModelMeta(id),
            getModelsByType: (type) => this.getModelsByType(type),
            saveBcf: () => this.saveBcf(),
            loadBcf: (index, download) => this.loadBcf(index, download),
            destroyBcf: (index) => this.destroyBcf(index),
            downloadBcf: (index, name) => this.downloadBcf(index, name),
            downloadAllBcf: () => this.downloadAllBcf(),
          }}
        />
      </React.Fragment>
    );
  }
}
