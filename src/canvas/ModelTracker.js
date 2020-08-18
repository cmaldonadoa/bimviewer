import React from "react";

export default class ModelTracker extends React.Component {
  constructor(props) {
    super(props);
    this.arc = [];
    this.str = [];
    this.mep = [];
    this.modelCount = 0;
  }

  _createModelObject(id, metadata, modelURL, metadataURL, meta) {
    this.modelCount++;
    return {
      id: id,
      metadata: metadata,
      ids: Object.keys(metadata),
      modelURL: `https://bimviewer.velociti.cl/${modelURL}`,
      metadataURL: `https://bimviewer.velociti.cl/${metadataURL}`,
      visible: Object.keys(metadata),
      xrayed: [],
      selected: [],
      meta: meta,
    };
  }

  addARC(metadata, modelURL, metadataURL, meta) {
    const arc = this._createModelObject(
      `model-arc-${this.arc.length}`,
      metadata,
      modelURL,
      metadataURL,
      meta
    );
    this.arc = [...this.arc, arc];
  }

  addSTR(metadata, modelURL, metadataURL, meta) {
    const str = this._createModelObject(
      `model-str-${this.str.length}`,
      metadata,
      modelURL,
      metadataURL,
      meta
    );
    this.str = [...this.str, str];
  }

  addMEP(metadata, modelURL, metadataURL, meta) {
    const mep = this._createModelObject(
      `model-mep-${this.mep.length}`,
      metadata,
      modelURL,
      metadataURL,
      meta
    );
    this.mep = [...this.mep, mep];
  }

  addModel(tag, metadata, modelURL, metadataURL, meta) {
    switch (tag) {
      case "ARC":
        this.addARC(metadata, modelURL, metadataURL, meta);
        break;
      case "STR":
        this.addSTR(metadata, modelURL, metadataURL, meta);
        break;
      case "MEP":
        this.addMEP(metadata, modelURL, metadataURL, meta);
        break;
      default:
        break;
    }
  }

  getModels(tag) {
    switch (tag) {
      case "ARC":
        return this.arc;
      case "STR":
        return this.str;
      case "MEP":
        return this.mep;
      default:
        return [];
    }
  }

  getModelMeta(id) {
    for (let model of this.allModels()) {
      if (model.id === id) {
        return model.meta;
      }
    }
    return null;
  }

  getModelsMetaByType(type) {
    switch (type) {
      case "ARC":
        return this.arc.map((model) => ({meta: model.meta}));
      case "STR":
        return this.str.map((model) => ({meta: model.meta}));
      case "MEP":
        return this.mep.map((model) => ({meta: model.meta}));
      default:
        break;
    }
  }

  countModels() {
    return this.modelCount;
  }

  allModels() {
    return [...this.arc, ...this.str, ...this.mep];
  }

  resetVisible() {
    for (let model of this.allModels()) {
      model.visible = [...model.ids];
    }
  }

  getMetadata() {
    var metadata = {};
    for (let model of this.allModels()) {
      metadata = { ...metadata, ...model.metadata };
    }
    return metadata;
  }

  isVisible(id) {
    for (let model of this.allModels()) {
      if (model.visible.includes(id)) {
        return true;
      }
    }
    return false;
  }

  isXRayed(id) {
    for (let model of this.allModels()) {
      if (model.xrayed.includes(id)) {
        return true;
      }
    }
    return false;
  }

  isSelected(id) {
    for (let model of this.allModels()) {
      if (model.selected.includes(id)) {
        return true;
      }
    }
    return false;
  }

  //------------------------------------------------------------------------------------------------------------------
  // Setter and getter for visible entities
  //------------------------------------------------------------------------------------------------------------------
  filterVisible(filterFunction) {
    for (let model of this.allModels()) {
      model.visible = model.visible.filter((x) => filterFunction(x));
    }
  }

  setVisible(ids) {
    ids = Array.isArray(ids) ? ids : [ids];
    for (let model of this.allModels()) {
      let thisIds = ids.filter((x) => model.ids.includes(x));
      model.visible = [...new Set([...model.visible, ...thisIds])];
    }
  }

  getVisible() {
    var visible = [];
    for (let model of this.allModels()) {
      visible = [...visible, ...model.visible];
    }
    return visible;
  }

  //------------------------------------------------------------------------------------------------------------------
  // Setter and getter for x-rayed entities
  //------------------------------------------------------------------------------------------------------------------
  filterXRayed(filterFunction) {
    for (let model of this.allModels()) {
      model.xrayed = model.xrayed.filter((x) => filterFunction(x));
    }
  }

  setXRayed(ids) {
    ids = Array.isArray(ids) ? ids : [ids];
    for (let model of this.allModels()) {
      let thisIds = ids.filter((x) => model.ids.includes(x));
      model.xrayed = [...new Set([...model.xrayed, ...thisIds])];
    }
  }

  getXRayed() {
    var xrayed = [];
    for (let model of this.allModels()) {
      xrayed = [...xrayed, ...model.xrayed];
    }
    return xrayed;
  }

  //------------------------------------------------------------------------------------------------------------------
  // Setter and getter for selected entities
  //------------------------------------------------------------------------------------------------------------------
  filterSelected(filterFunction) {
    for (let model of this.allModels()) {
      model.selected = model.selected.filter((x) => filterFunction(x));
    }
  }

  setSelected(ids) {
    ids = Array.isArray(ids) ? ids : [ids];
    for (let model of this.allModels()) {
      let thisIds = ids.filter((x) => model.ids.includes(x));
      model.selected = [...new Set([...model.selected, ...thisIds])];
    }
  }

  getSelected() {
    var selected = [];
    for (let model of this.allModels()) {
      selected = [...selected, ...model.selected];
    }
    return selected;
  }
}
