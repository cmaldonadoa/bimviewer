import React from "react";
import EntityProperties from "./EntityProperties";

export default class PropertiesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { metadata: {}, json: {} };
    this.entity = props.entity;
  }

  componentDidUpdate() {
    if (
      Object.keys(this.state.json).length === 0 &&
      Object.keys(this.props.metadata).length > 0
    ) {
      this.setState({ json: this.props.metadata });
    }
    if (this.entity !== this.props.entity) {
      this.entity = this.props.entity;
      var metadata = this.getProperties(this.props.entity);
      this.setState({ metadata: metadata });
    }
  }

  getProperties(id) {
    var tabs = {};
    var data = this.state.json[id];
    for (var dataKey in data) {
      if (dataKey === "attributes") {
        // Basic information folder
        tabs["Información Básica"] = {};
        tabs["Información Básica"]["IfcType"] = data.type;
        let attributes = data[dataKey];
        for (let attribute in attributes) {
          tabs["Información Básica"][attribute] = attributes[attribute];
        }
      } else if (dataKey === "properties") {
        for (let i = 0; i < data[dataKey].length; i++) {
          let tmpObj = data[dataKey][i];
          if (tmpObj instanceof Array) {
            tmpObj = tmpObj[0];
          }
          let tmpType = tmpObj["type"];
          let tmpData = tmpObj["attributes"];
          if ("ID" in tmpData) {
            continue;
          }
          if ("xlink:href" in tmpData) {
            let hrefData = this.state.json[tmpData["xlink:href"].substring(1)];
            if (!hrefData) {
              continue;
            }
            let attributes = hrefData.attributes;
            let tabName = attributes.Name
              ? attributes.Name
              : `${hrefData.type}`;
            tabs[tabName] = {};
            tabs[tabName]["IfcType"] = hrefData.type;
            for (let attribute in attributes) {
              tabs[tabName][attribute] = attributes[attribute];
            }

            let properties = hrefData.properties;
            if (properties) {
              for (let j = 0; j < properties.length; j++) {
                let tmpProp = properties[j];
                let tmpPropData = tmpProp.attributes;
                let tmpKeys = Object.keys(tmpPropData);
                if (tmpKeys.length === 1) {
                  tabs[tabName][tmpProp.type] = tmpPropData[tmpKeys[0]];
                } else {
                  tabs[tabName][tmpPropData[tmpKeys[0]]] =
                    tmpPropData[tmpKeys[1]];
                }
              }
            }
          } else {
            let tabName = `${tmpType} ${tmpData["ID"]}`;
            tabs[tabName] = {};

            for (let attribute in tmpData) {
              tabs[tabName][attribute] = tmpData[attribute];
            }
          }
        }
      }
    }
    return tabs;
  }

  render() {
    var { metadata } = this.state;
    if (Object.keys(metadata).length === 0 || !this.entity) {
      return (
        <div id="properties-container">
          <p style={{ padding: "1rem" }}>
            No se ha seleccionado ninguna entidad.
          </p>
        </div>
      );
    }
    return (
      <div id="properties-container">
        <EntityProperties tabs={metadata} />
      </div>
    );
  }
}
