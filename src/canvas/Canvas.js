import React from "react";
import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer";
import { GLTFLoaderPlugin } from "@xeokit/xeokit-sdk/src/plugins/GLTFLoaderPlugin/GLTFLoaderPlugin.js";
import { NavCubePlugin } from "@xeokit/xeokit-sdk/src/plugins/NavCubePlugin/NavCubePlugin.js";
import { TreeViewPlugin } from "@xeokit/xeokit-sdk/src/plugins/TreeViewPlugin/TreeViewPlugin.js";
import { StoreyViewsPlugin } from "@xeokit/xeokit-sdk/src/plugins/StoreyViewsPlugin/StoreyViewsPlugin.js";
import { math } from "@xeokit/xeokit-sdk/src/viewer/scene/math/math.js";
import { SectionPlanesPlugin } from "@xeokit/xeokit-sdk/src/plugins/SectionPlanesPlugin/SectionPlanesPlugin.js";
import { DistanceMeasurementsPlugin } from "@xeokit/xeokit-sdk/src/plugins/DistanceMeasurementsPlugin/DistanceMeasurementsPlugin.js";
import { AnnotationsPlugin } from "@xeokit/xeokit-sdk/src/plugins/AnnotationsPlugin/AnnotationsPlugin.js";

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.loading = true;
    this.modelName = props.modelName;
    this.modelPath = props.modelPath;

    /* Mouse click action */
    this.mouseCreatePlanes = false;
    this.mouseMeasureDistance = false;
    this.mouseCreateAnnotations = false;

    /* Store user changes */
    this.visible = props.allIds;
    this.xrayed = [];
    this.selected = [];
    this.planes = [];

    /* GUI functions */
    this.updateEntity = props.updateEntity;
    this.openTreeContextMenu = props.openTreeContextMenu;
    this.closeTreeContextMenu = props.closeTreeContextMenu;
    this.openCanvasContextMenu = props.openCanvasContextMenu;
    this.closeCanvasContextMenu = props.closeCanvasContextMenu;
    this.signalMount = props.signalMount;

    this.build();
  }

  build() {
    //------------------------------------------------------------------------------------------------------------------
    // Create a Viewer, arrange the camera, tweak x-ray, select and highlight materials
    //------------------------------------------------------------------------------------------------------------------
    const viewer = new Viewer({
      canvasId: "canvas",
      transparent: true,
    });

    const scene = viewer.scene;
    const camera = viewer.camera;
    const cameraFlight = viewer.cameraFlight;
    const cameraControl = viewer.cameraControl;

    cameraControl.panRightClick = false;
    cameraControl.doublePickFlyTo = true;
    cameraControl.panInertia = 0;
    cameraFlight.duration = 1.0;
    cameraFlight.fitFOV = 25;

    camera.eye = [-2.56, 8.38, 8.27];
    camera.look = [13.44, 3.31, -14.83];
    camera.up = [0.1, 0.98, -0.14];

    scene.xrayMaterial.fillAlpha = 0.06;
    scene.xrayMaterial.fillColor = [0, 0, 0];
    scene.xrayMaterial.edgeAlpha = 1;
    scene.xrayMaterial.edgeColor = [0.7, 0.7, 0.7];

    scene.highlightMaterial.fillAlpha = 0.2;
    scene.highlightMaterial.fillColor = [1, 1, 1];
    scene.highlightMaterial.edgeAlpha = 1;
    scene.highlightMaterial.edgeColor = [1, 1, 1];

    scene.selectedMaterial.fillAlpha = 0.5;
    scene.selectedMaterial.fillColor = [0, 1, 1];

    //------------------------------------------------------------------------------------------------------------------
    // Load model
    //------------------------------------------------------------------------------------------------------------------
    const gltfLoader = new GLTFLoaderPlugin(viewer);

    const model = gltfLoader.load({
      id: "model",
      src: this.modelPath + this.modelName + ".gltf",
      metaModelSrc: this.modelPath + this.modelName + "_xeokit.json",
      edges: true,
    });

    window.model = model;

    //------------------------------------------------------------------------------------------------------------------
    // Handle zoom with left click
    //------------------------------------------------------------------------------------------------------------------
    var timeout;
    scene.input.on(
      "mousedown",
      (coords) => {
        if (this.mouseZoom) {
          if (scene.input.mouseDownLeft) {
            window.document.getElementById("canvas").style.cursor = "zoom-in";
            timeout = setInterval(function () {
              camera.zoom(-0.2);
            }, 0);
          } else if (scene.input.mouseDownRight) {
            window.document.getElementById("canvas").style.cursor = "zoom-out";
            timeout = setInterval(function () {
              camera.zoom(0.2);
            }, 0);
          }
        } else if (!this.mousePan) {
          if (scene.input.mouseDownLeft) {
            timeout = setInterval(function () {
              window.document.getElementById("canvas").style.cursor =
                "grabbing";
            }, 0);
          }
        }
      },
      this
    );

    scene.input.on(
      "mouseup",
      (coords) => {
        clearInterval(timeout);
        if (!this.mouseZoom && !this.mousePan) {
          window.document.getElementById("canvas").style.cursor = "default";
        }
      },
      this
    );

    //------------------------------------------------------------------------------------------------------------------
    // Create a NavCube
    //------------------------------------------------------------------------------------------------------------------
    new NavCubePlugin(viewer, {
      canvasId: "cube-canvas",
      visible: true,
      size: 170,
      alignment: "topRight",
      bottomMargin: 0,
      rightMargin: 0,
      color: "#ffffff",
      cameraFlyDuration: 0.7,
    });

    //------------------------------------------------------------------------------------------------------------------
    // Add StoreyViewsPlugin
    //------------------------------------------------------------------------------------------------------------------
    const storeyViewsPlugin = new StoreyViewsPlugin(viewer);
    storeyViewsPlugin.on(
      "storeys",
      () => {
        this.storeys = storeyViewsPlugin.storeys;
      },
      this
    );

    this.storeyViewsPlugin = storeyViewsPlugin;

    //------------------------------------------------------------------------------------------------------------------
    // Mouse over entities to highlight them
    //------------------------------------------------------------------------------------------------------------------
    var lastEntity = null;

    scene.input.on("mousemove", (coords) => {
      var hit = viewer.scene.pick({
        canvasPos: coords,
      });

      if (hit) {
        if (!lastEntity || hit.entity.id !== lastEntity.id) {
          if (lastEntity) {
            lastEntity.highlighted = false;
          }

          lastEntity = hit.entity;
          hit.entity.highlighted = true;
        }
      } else {
        if (lastEntity) {
          lastEntity.highlighted = false;
          lastEntity = null;
        }
      }
    });

    //------------------------------------------------------------------------------------------------------------------
    // Right clicking an object opens context menu
    //------------------------------------------------------------------------------------------------------------------
    scene.input.on(
      "mousedown",
      (coords) => {
        if (scene.input.mouseDownRight && !this.mouseZoom) {
          var hit = scene.pick({
            canvasPos: coords,
          });

          if (hit) {
            var entity = hit.entity;
            var objectId = entity.id;
            this.selected = [objectId];

            scene.setObjectsSelected(scene.objectIds, false);
            scene.setObjectsSelected(this.selected, true);

            let x = coords[0];
            let y = coords[1];

            this.openCanvasContextMenu(x, y, entity, {
              visible: this.visible.includes(objectId),
              xrayed: this.xrayed.includes(objectId),
              selected: this.selected.includes(objectId),
            });
          }
        }
      },
      this
    );

    //------------------------------------------------------------------------------------------------------------------
    // Click an object to show IFC data and the tree node
    //------------------------------------------------------------------------------------------------------------------
    cameraControl.on(
      "picked",
      (e) => {
        var coords = e.canvasPos;
        var hit = scene.pick({
          canvasPos: coords,
        });

        if (hit) {
          var entity = hit.entity;
          var objectId = entity.id;

          if (scene.input.ctrlDown) {
            if (entity.selected) {
              let idx = this.selected.indexOf(objectId);
              this.selected.splice(idx, 1);
            } else {
              this.selected.push(objectId);
            }
          } else {
            if (entity.selected) {
              this.selected = [];
            } else {
              this.selected = [objectId];
            }
          }

          scene.setObjectsSelected(scene.objectIds, false);
          scene.setObjectsSelected(this.selected, true);

          if (this.mounted) {
            this.treeView.showNode(objectId);
            this.updateEntity(objectId);
            this.closeTreeContextMenu();
          }
        }
      },
      this
    );

    //------------------------------------------------------------------------------------------------------------------
    // Add section planes plugin
    //------------------------------------------------------------------------------------------------------------------
    const sectionPlanes = new SectionPlanesPlugin(viewer, {
      overviewCanvasId: "planes-overview",
      overviewVisible: true,
    });
    this.sectionPlanes = sectionPlanes;

    scene.input.on(
      "mousedown",
      (coords) => {
        if (scene.input.mouseDownLeft) {
          var hit = scene.pick({
            canvasPos: coords,
            pickSurface: true,
          });
          if (hit) {
            if (hit.entity.isObject && this.mouseCreatePlanes) {
              let planeId = `section-plane-${this.planes.length}`;
              this.planes.push(planeId);

              this.sectionPlanes.createSectionPlane({
                id: planeId,
                canvasPos: hit.canvasPos,
                pos: hit.worldPos,
                dir: [
                  -hit.worldNormal[0],
                  -hit.worldNormal[1],
                  -hit.worldNormal[2],
                ],
              });

              this.sectionPlanes.showControl(planeId);
              this.mouseCreatePlanes = false;
            } else if (hit.entity.isObject && this.mouseDestroyPlanes) {
              console.log("");
            }
          }
        }
      },
      this
    );

    //------------------------------------------------------------------------------------------------------------------
    // Measure distance with mouse
    //------------------------------------------------------------------------------------------------------------------
    const distanceMeasurements = new DistanceMeasurementsPlugin(viewer);
    this.distanceMeasurements = distanceMeasurements;

    //------------------------------------------------------------------------------------------------------------------
    // Create annotations on click
    //------------------------------------------------------------------------------------------------------------------
    const annotations = new AnnotationsPlugin(viewer, {
      // Default HTML template for marker position
      markerHTML: "<div class='annotation-marker'>{{glyph}}</div>",

      // Default HTML template for label
      labelHTML:
        "<div class='annotation-label'>" +
        "<div class='annotation-title'>{{title}}</div>" +
        "<div class='annotation-desc'>{{description}}</div></div>",

      // Default values to insert into the marker and label templates
      values: {
        glyph: "X",
        title: "Sin título",
        description: "Sin descripción",
      },
    });
    this.annotations = annotations;

    this.annotationsCount = 1;
    scene.input.on(
      "mouseclicked",
      (coords) => {
        var hit = scene.pick({
          canvasPos: coords,
          pickSurface: true,
        });

        if (hit && this.mouseCreateAnnotations) {
          const id = "annotation-" + this.annotationsCount;
          const title = "Sin título " + this.annotationsCount;
          const desc = "Sin descripción";
          this.annotations.createAnnotation({
            id: id,
            pickResult: hit,
            occludable: true,
            labelShown: true,
            values: {
              // HTML template values
              glyph: this.annotationsCount,
              title: title,
              description: desc,
            },
          });

          this.annotationsCount++;
          this.mouseCreateAnnotations = false;
          this.props.signalNewAnnotation({
            id: id,
            name: title,
            description: desc,
          });
        }
      },
      this
    );

    window.viewer = viewer;
  }

  mountTree() {
    let treeExists = Boolean(this.treeView);
    //------------------------------------------------------------------------------------------------------------------
    // Create an IFC structure tree view
    //------------------------------------------------------------------------------------------------------------------
    this.treeView = new TreeViewPlugin(window.viewer, {
      containerElement: document.getElementById("tree-container"),
      autoExpandDepth: 0, // Initially expand tree three nodes deep
      autoAddModels: false,
    });
    if (treeExists) {
      this.treeView.addModel("model");
      this.signalMount();
    } else {
      //----------------------------------------------------------------------------------------------------------------------
      // Load a model and fit it to view
      //----------------------------------------------------------------------------------------------------------------------
      window.model.on("loaded", () => {
        this.treeView.addModel(window.model.id);
        this.loading = false;
        this.signalMount();
      });
    }

    const viewer = window.viewer;
    const scene = viewer.scene;

    //----------------------------------------------------------------------------------------------------------------------
    // Right clicking a tree node title will open context menu
    //----------------------------------------------------------------------------------------------------------------------
    this.treeView.on(
      "contextmenu",
      (e) => {
        const event = e.event; // MouseEvent
        const treeViewNode = e.treeViewNode;
        const id = treeViewNode.objectId;

        this.openTreeContextMenu(
          treeViewNode,
          event.clientX,
          event.clientY,
          event.currentTarget,
          {
            visible: this.visible.includes(id),
            xrayed: this.xrayed.includes(id),
            selected: this.selected.includes(id),
          }
        );
      },
      this
    );

    //----------------------------------------------------------------------------------------------------------------------
    // Clicking a tree node title will show the entity and its properties
    //----------------------------------------------------------------------------------------------------------------------
    this.treeView.on(
      "nodeTitleClicked",
      (e) => {
        this.closeTreeContextMenu();
        const objectIds = [];

        e.treeViewPlugin.withNodeTree(e.treeViewNode, (treeViewNode) => {
          if (treeViewNode.objectId) {
            objectIds.push(treeViewNode.objectId);
          }
        });

        scene.setObjectsXRayed(scene.objectIds, true);
        scene.setObjectsXRayed(objectIds, false);

        if (objectIds.length === 1) {
          this.treeView.showNode(objectIds[0]);
          this.updateEntity(objectIds[0]);
        }

        setTimeout(() => {
          scene.setObjectsXRayed(scene.objectIds, false);
          if (this.xrayed.length > 0) {
            scene.setObjectsXRayed(this.xrayed, true);
          }
        }, 800);
      },
      this
    );

    this.mounted = true;
  }

  unmountTree() {
    this.mounted = false;
  }

  //----------------------------------------------------------------------------------------------------------------------
  // Context menu handlers
  //----------------------------------------------------------------------------------------------------------------------
  toggleVisibility(node, searchNodes) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    var objectIds = [];
    var nodeId = 0;

    if (searchNodes) {
      nodeId = node.objectId;
      this.treeView.withNodeTree(node, (treeViewNode) => {
        if (treeViewNode.objectId) {
          objectIds.push(treeViewNode.objectId);
        }
      });
    } else {
      nodeId = node.id;
      objectIds.push(node.id);
    }

    if (this.visible.includes(nodeId)) {
      scene.setObjectsVisible(objectIds, false);
      this.visible = this.visible.filter((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsVisible(objectIds, true);
      this.visible = [...new Set([...this.visible, ...objectIds])];
    }
  }

  toggleXray(node, searchNodes) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    var objectIds = [];
    var nodeId = 0;

    if (searchNodes) {
      nodeId = node.objectId;
      this.treeView.withNodeTree(node, (treeViewNode) => {
        if (treeViewNode.objectId) {
          objectIds.push(treeViewNode.objectId);
        }
      });
    } else {
      nodeId = node.id;
      objectIds.push(node.id);
    }

    if (this.xrayed.includes(nodeId)) {
      scene.setObjectsXRayed(objectIds, false);
      this.xrayed = this.xrayed.filter((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsXRayed(objectIds, true);
      this.xrayed = [...new Set([...this.xrayed, ...objectIds])];
    }
  }

  toggleSelect(node, searchNodes) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    var objectIds = [];
    var nodeId = 0;

    if (searchNodes) {
      nodeId = node.objectId;
      this.treeView.withNodeTree(node, (treeViewNode) => {
        if (treeViewNode.objectId) {
          objectIds.push(treeViewNode.objectId);
        }
      });
    } else {
      nodeId = node.id;
      objectIds.push(node.id);
    }

    if (this.selected.includes(nodeId)) {
      scene.setObjectsSelected(objectIds, false);
      this.selected = this.selected.filter((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsSelected(objectIds, true);
      this.selected = [...new Set([...this.selected, ...objectIds])];
    }
  }

  lookAt(id) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    viewer.cameraFlight.flyTo({
      aabb: scene.getAABB(id),
    });
  }

  //----------------------------------------------------------------------------------------------------------------------
  // Tools tab handlers
  //----------------------------------------------------------------------------------------------------------------------

  setProjection(mode) {
    const viewer = window.viewer;
    const camera = viewer.camera;
    camera.projection = mode;
  }

  setFirstPerson(mode) {
    const viewer = window.viewer;
    const cameraControl = viewer.cameraControl;
    cameraControl.firstPerson = mode;
  }

  fitModel() {
    const viewer = window.viewer;
    const scene = viewer.scene;
    viewer.cameraFlight.flyTo({
      aabb: scene.models["model"].aabb,
    });
  }

  getStoreys() {
    var storeys = [];
    for (let storey in this.storeys) {
      storeys.push(storey);
    }
    return storeys;
  }

  setStorey(value) {
    const viewer = window.viewer;

    const oldChild = document.getElementById("storey-img");
    const storeyMapDiv = document.getElementById("storey-map");
    if (oldChild) {
      const oldPointer = document.getElementById("plan-pointer");
      document.body.removeChild(oldPointer);
      storeyMapDiv.removeChild(oldChild);
    }

    if (value === "") {
      const cameraControl = viewer.cameraControl;
      const cameraFlight = viewer.cameraFlight;
      const scene = viewer.scene;
      scene.setObjectsVisible(scene.objectIds, true);
      cameraControl.navMode = "orbit"; // Disable rotation
      cameraFlight.flyTo({
        eye: [-2.56, 8.38, 8.27],
        look: [13.44, 3.31, -14.83],
        up: [0.1, 0.98, -0.14],
        projection: "perspective",
      });
      return;
    }

    this.storeyViewsPlugin.showStoreyObjects(value, {
      hideOthers: true,
    });

    this.storeyViewsPlugin.gotoStoreyCamera(value, {
      projection: "ortho", // Orthographic projection
      duration: 0.8, // 2.5 second transition
      done: () => {
        // Create 2D view
        viewer.cameraControl.navMode = "planView"; // Disable rotation
        const storeyMap = this.storeyViewsPlugin.createStoreyMap(value, {
          width: 300,
          format: "png",
          useObjectStates: true,
        });

        const img = document.createElement("img");

        img.id = "storey-img";
        img.src = storeyMap.imageData;
        img.style.width = storeyMap.width + "px";
        img.style.height = storeyMap.height + "px";

        const worldPos = math.vec3();

        // Fly on minimap click
        img.onclick = (e) => {
          const imagePos = [e.offsetX, e.offsetY];
          const pickResult = this.storeyViewsPlugin.pickStoreyMap(
            storeyMap,
            imagePos,
            {
              pickSurface: true,
            }
          );
          if (pickResult) {
            worldPos.set(pickResult.worldPos);

            // Set camera vertical position at the mid point of the storey's vertical
            // extents - note how this is adapts to whichever of the X, Y or Z axis is
            // designated the World's "up" axis

            const camera = viewer.scene.camera;
            const idx = camera.xUp ? 0 : camera.yUp ? 1 : 2; // Find the right axis for "up"
            const storey = this.storeyViewsPlugin.storeys[storeyMap.storeyId];
            worldPos[idx] = (storey.aabb[idx] + storey.aabb[3 + idx]) / 2;

            viewer.cameraFlight.flyTo(
              {
                eye: worldPos,
                up: viewer.camera.worldUp,
                look: math.addVec3(worldPos, viewer.camera.worldForward, []),
                projection: "perspective",
                duration: 1.5,
              },
              () => {
                viewer.cameraControl.navMode = "firstPerson";
              }
            );
          } else {
            this.storeyViewsPlugin.gotoStoreyCamera(value, {
              projection: "ortho",
              duration: 1.5,
              done: () => {
                viewer.cameraControl.navMode = "planView";
              },
            });
          }
        };

        const canStandOnTypes = {
          IfcSlab: true,
          IfcStair: true,
          IfcFloor: true,
          IfcFooting: true,
        };
        img.onmouseenter = (e) => {
          img.style.cursor = "default";
        };

        img.onmousemove = (e) => {
          img.style.cursor = "default";

          const imagePos = [e.offsetX, e.offsetY];

          const pickResult = this.storeyViewsPlugin.pickStoreyMap(
            storeyMap,
            imagePos,
            {}
          );

          if (pickResult) {
            const entity = pickResult.entity;
            const metaObject = viewer.metaScene.metaObjects[entity.id];

            if (metaObject) {
              if (canStandOnTypes[metaObject.type]) {
                img.style.cursor = "pointer";
              }
            }
          }
        };

        img.onmouseleave = (e) => {
          img.style.cursor = "default";
        };

        storeyMapDiv.appendChild(img);

        // Minimap guide
        const pointer = document.createElement("div");
        pointer.id = "plan-pointer";
        pointer.style.width = "60px";
        pointer.style.height = "60px";
        pointer.style.position = "absolute";
        pointer.style["z-index"] = 100000;
        pointer.style.left = "0px";
        pointer.style.top = "0px";
        pointer.style.cursor = "none";
        pointer.style["pointer-events"] = "none";
        pointer.style.transform = "rotate(0deg)";
        pointer.style.visibility = "hidden";
        document.body.appendChild(pointer);

        const imagePos = math.vec2();
        const worldDir = math.vec3();
        const imageDir = math.vec2();

        const updatePointer = () => {
          const eye = viewer.camera.eye;
          const storeyId = this.storeyViewsPlugin.getStoreyContainingWorldPos(
            eye
          );
          if (!storeyId) {
            hidePointer();
            return;
          }
          const inBounds = this.storeyViewsPlugin.worldPosToStoreyMap(
            storeyMap,
            eye,
            imagePos
          );
          if (!inBounds) {
            hidePointer();
            return;
          }
          var offset = getPosition(img);
          imagePos[0] += offset.x;
          imagePos[1] += offset.y;

          this.storeyViewsPlugin.worldDirToStoreyMap(
            storeyMap,
            worldDir,
            imageDir
          );

          showPointer(imagePos, imageDir);
        };

        viewer.camera.on("viewMatrix", updatePointer);
        viewer.scene.canvas.on("boundary", updatePointer);

        function getPosition(el) {
          var xPos = 0;
          var yPos = 0;
          while (el) {
            if (el.tagName === "BODY") {
              // deal with browser quirks with body/window/document and page scroll
              var xScroll =
                el.scrollLeft || document.documentElement.scrollLeft;
              var yScroll = el.scrollTop || document.documentElement.scrollTop;
              xPos += el.offsetLeft - xScroll + el.clientLeft;
              yPos += el.offsetTop - yScroll + el.clientTop;
            } else {
              // for all other non-BODY elements
              xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
              yPos += el.offsetTop - el.scrollTop + el.clientTop;
            }
            el = el.offsetParent;
          }
          return { x: xPos, y: yPos };
        }

        function hidePointer() {
          pointer.style.visibility = "hidden";
        }

        function showPointer(imagePos, imageDir) {
          const angleRad = Math.atan2(imageDir[0], imageDir[1]);
          const angleDeg = Math.floor((180 * angleRad) / Math.PI);

          pointer.style.left = imagePos[0] - 30 + "px";
          pointer.style.top = imagePos[1] - 30 + "px";
          pointer.style.transform = "rotate(" + -(angleDeg - 45) + "deg)";
          pointer.style.visibility = "visible";
        }
      },
    });
  }

  setCameraMode(mode) {
    const viewer = window.viewer;
    const cameraControl = viewer.cameraControl;
    switch (mode) {
      case "orbit":
        window.document.getElementById("canvas").style.cursor = "default";
        cameraControl.pointerEnabled = true;
        this.mouseZoom = false;
        this.mousePan = false;
        cameraControl.navMode = "orbit";
        break;
      case "pan":
        cameraControl.pointerEnabled = true;
        this.mouseZoom = false;
        this.mousePan = true;
        cameraControl.navMode = "planView";
        break;
      case "zoom":
        window.document.getElementById("canvas").style.cursor = "zoom-in";
        cameraControl.pointerEnabled = false;
        this.mouseZoom = true;
        this.mousePan = false;
        break;
      default:
        window.document.getElementById("canvas").style.cursor = "default";
        cameraControl.pointerEnabled = true;
        this.mouseZoom = false;
        this.mousePan = false;
        cameraControl.navMode = "orbit";
        break;
    }
  }

  createSectionPlane() {
    this.mouseCreatePlanes = true;
    /*
    this.planes.forEach((planeId) =>
      this.sectionPlanes.destroySectionPlane(planeId)
    );
    this.planes = [];*/
  }

  destroySectionPlane() {
    this.mouseDestroyPlanes = !this.mouseDestroyPlanes;
  }

  measureDistance() {
    this.mouseMeasureDistance = !this.mouseMeasureDistance;
    if (this.mouseMeasureDistance) {
      this.distanceMeasurements.control.activate();
    } else {
      this.distanceMeasurements.control.deactivate();
      this.distanceMeasurements.clear();
    }
  }

  createAnnotations() {
    this.mouseCreateAnnotations = true;
    /*
    if (!this.mouseCreateAnnotations) {
      this.annotations.clear();
    }*/
  }

  destroyAnnotation(id) {
    this.annotations.destroyAnnotation(id);
  }

  updateAnnotation(id, name, description) {
    this.annotations.annotations[id].setValues({
      title: name,
      description: description,
    });
  }

  toggleAnnotationVisibility(id) {
    const label = this.annotations.annotations[id].getLabelShown();
    const marker = this.annotations.annotations[id].getMarkerShown();
    this.annotations.annotations[id].setLabelShown(!label);
    this.annotations.annotations[id].setMarkerShown(!marker);
  }

  takeSnapshot() {
    const img = window.viewer.getSnapshot();
    var a = document.createElement("a");
    a.href = img;
    a.download = `${this.modelName}.png`;
    a.click();
  }
}
