import React from "react";
import EntityProperties from "./EntityProperties";

export default class PropertiesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { metadata: {} };
    this.entity = props.entity;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/models/IFC_Schependomlaan_id.json`, false);
    xhttp.send();
    this.xresponse = JSON.parse(xhttp.response);
  }

  componentDidUpdate() {
    if (this.entity !== this.props.entity) {
      this.entity = this.props.entity;
      var metadata = this.getProperties(this.props.entity);
      this.setState({ metadata: metadata });
    }
  }

  getProperties(id) {
    var tabs = {};
    var data = this.xresponse[id];
    for (var dataKey in data) {
      if (dataKey === "attributes") {
        // Basic information folder
        tabs["Información Básica"] = {};
        tabs["Información Básica"]["IfcType"] = data.type;
        var attributes = data[dataKey];
        for (var attribute in attributes) {
          tabs["Información Básica"][attribute] = attributes[attribute];
        }
      } else if (dataKey === "properties") {
        for (var i = 0; i < data[dataKey].length; i++) {
          var tmpObj = data[dataKey][i];
          if (tmpObj instanceof Array) {
            tmpObj = tmpObj[0];
          }
          var tmpType = tmpObj["type"];
          var tmpData = tmpObj["attributes"];
          if ("ID" in tmpData) {
            continue;
          }
          if ("xlink:href" in tmpData) {
            var hrefData = this.xresponse[tmpData["xlink:href"].substring(1)];
            if (!hrefData) {
              continue;
            }
            var tabName = `${hrefData.type} ${hrefData.attributes["ID"]}`;
            tabs[tabName] = {};
            tabs[tabName]["IfcType"] = hrefData.type;
            var attributes = hrefData.attributes;
            for (var attribute in hrefData.attributes) {
              tabs[tabName][attribute] = attributes[attribute];
            }

            var properties = hrefData.properties;
            if (properties) {
              for (var j = 0; j < properties.length; j++) {
                var tmpProp = properties[j];
                var tmpPropData = tmpProp.attributes;
                var tmpKeys = Object.keys(tmpPropData);
                if (tmpKeys.length === 1) {
                  tabs[tabName][tmpProp.type] = tmpPropData[tmpKeys[0]];
                } else {
                  tabs[tabName][tmpPropData[tmpKeys[0]]] =
                    tmpPropData[tmpKeys[1]];
                }
              }
            }
          } else {
            var tabName = `${tmpType} ${tmpData["ID"]}`;
            tabs[tabName] = {};

            for (var attribute in tmpData) {
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
          <p style={{padding: "1rem"}}>No se ha seleccionado ninguna entidad.</p>
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
