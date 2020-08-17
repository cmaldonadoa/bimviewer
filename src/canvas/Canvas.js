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
    this.loading = 1;
    this.modelName = props.modelName;

    /* Mouse left click action */
    this.mouseCreatePlanes = false;
    this.mouseMeasureDistance = false;
    this.mouseCreateAnnotations = false;
    this.measureClicks = 0; // Counter to disable measure distance creation
    this.planesCounter = 0;

    this.modelTracker = null;

    /* GUI functions */
    this.updateEntity = props.updateEntity;
    this.openTreeContextMenu = props.openTreeContextMenu;
    this.closeTreeContextMenu = props.closeTreeContextMenu;
    this.openCanvasContextMenu = props.openCanvasContextMenu;
    this.closeCanvasContextMenu = props.closeCanvasContextMenu;
    this.signalMount = props.signalMount;
  }

  setModelTracker(modelTracker) {
    this.modelTracker = modelTracker;
    this.loading = this.modelTracker.countModels();
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
    cameraControl.navMode = "orbit";
    cameraControl.pivoting = true;

    const pivotElement = document
      .createRange()
      .createContextualFragment("<div class='camera-pivot-marker'></div>")
      .firstChild;
    document.body.appendChild(pivotElement);
    cameraControl.pivotElement = pivotElement;
    const aabb = scene.getAABB(scene.visibleObjectIds);
    cameraControl.pivotPos = math.getAABB3Center(aabb, math.vec3());

    cameraFlight.duration = 1.0;
    cameraFlight.fitFOV = 45;

    camera.eye = [-2.56, 8.38, 8.27];
    camera.look = [13.44, 3.31, -14.83];
    camera.up = [0.1, 0.98, -0.14];

    scene.xrayMaterial.fillAlpha = 0.2;
    scene.xrayMaterial.fillColor = [0.25, 0.25, 0.25];
    scene.xrayMaterial.edgeAlpha = 1;
    scene.xrayMaterial.edgeColor = [0.13, 0.13, 0.13];

    scene.highlightMaterial.fillAlpha = 0.2;
    scene.highlightMaterial.fillColor = [1, 1, 1];
    scene.highlightMaterial.edgeAlpha = 1;
    scene.highlightMaterial.edgeColor = [1, 1, 1];

    scene.selectedMaterial.fillAlpha = 0.5;
    scene.selectedMaterial.fillColor = [0, 1, 1];

    //------------------------------------------------------------------------------------------------------------------
    // Load models
    //------------------------------------------------------------------------------------------------------------------
    const gltfLoader = new GLTFLoaderPlugin(viewer);

    this.modelTracker.allModels().forEach((data) => {
      gltfLoader.load({
        id: data.id,
        src: data.modelURL,
        metaModelSrc: data.metadataURL,
        edges: true,
      });
    });

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
          let x = coords[0];
          let y = coords[1];

          let visible = this.modelTracker.getVisible();
          let xrayed = this.modelTracker.getXRayed();
          let selected = this.modelTracker.getSelected();

          let selectionVisible = visible.filter((x) => selected.includes(x));
          let selectionXRayed = xrayed.filter((x) => selected.includes(x));

          this.openCanvasContextMenu(x, y, {
            visible: selectionVisible.length > selected.length / 2,
            xrayed: selectionXRayed.length > selected.length / 2,
          });

          /*
          var hit = scene.pick({
            canvasPos: coords,
          });

          if (hit) {
            var entity = hit.entity;
            var objectId = entity.id;


            let x = coords[0];
            let y = coords[1];

            this.openCanvasContextMenu(x, y, entity, {
              visible: this.visible.includes(objectId),
              xrayed: this.xrayed.includes(objectId),
              selected: this.selected.includes(objectId),
            });
          }*/
        }
      },
      this
    );

    //------------------------------------------------------------------------------------------------------------------
    // Click an object to show IFC data and the tree node, highlight it and set pivot
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
          const prevSelected = this.modelTracker.getSelected();

          if (scene.input.ctrlDown) {
            if (entity.selected) {
              this.modelTracker.filterSelected((x) => x !== objectId);
            } else {
              this.modelTracker.setSelected(objectId);
            }
          } else {
            this.modelTracker.filterSelected((x) => false);
            if (!entity.selected) {
              this.modelTracker.setSelected(objectId);
              if (this.mounted) {
                this.treeView.showNode(objectId);
                this.updateEntity(objectId);
                this.closeTreeContextMenu();
              }
            }
          }

          const aabb = scene.getAABB(
            this.modelTracker.getSelected().length > 0
              ? this.modelTracker.getSelected()
              : scene.visibleObjectIds
          );
          cameraControl.pivotPos = math.getAABB3Center(aabb, math.vec3());

          scene.setObjectsSelected(prevSelected, false);
          scene.setObjectsSelected(this.modelTracker.getSelected(), true);
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
      "mouseclicked",
      (coords) => {
        var hit = scene.pick({
          canvasPos: coords,
          pickSurface: true,
        });

        if (hit && this.mouseCreatePlanes) {
          let planeId = `section-plane-${this.planesCounter++}`;

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
        }
      },
      this
    );

    //------------------------------------------------------------------------------------------------------------------
    // Measure distance with mouse
    //------------------------------------------------------------------------------------------------------------------
    const distanceMeasurements = new DistanceMeasurementsPlugin(viewer);
    this.distanceMeasurements = distanceMeasurements;

    scene.input.on(
      "mouseclicked",
      (coords) => {
        var hit = scene.pick({
          canvasPos: coords,
          pickSurface: true,
        });

        if (hit && this.mouseMeasureDistance) {
          if (++this.measureClicks === 2) {
            this.measureClicks = 0;
            this.mouseCreatePlanes = false;
            var cursor = "default";
            if (this.mousePan) {
              cursor = "move";
            } else if (this.mouseZoom) {
              cursor = "zoom-in";
            }
            // Delay deactivation so it can render the ruler
            setTimeout(() => {
              this.distanceMeasurements.control.deactivate();
              window.document.getElementById("canvas").style.cursor = cursor;
            }, 50);
          }
        }
      },
      this
    );

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
          const title = "Sin título";
          const desc = "Sin descripción";
          this.annotations.createAnnotation({
            id: id,
            pickResult: hit,
            occludable: true,
            labelShown: true,
            values: {
              // HTML template values
              glyph: this.annotationsCount++,
              title: title,
              description: desc,
            },
          });

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

    scene.input.on(
      "keydown",
      (keyCode) => {
        if (keyCode === scene.input.KEY_ESCAPE) {
          // Disable current measurement
          this.measureClicks = 0;
          this.mouseCreatePlanes = false;
          var cursor = "default";
          if (this.mousePan) {
            cursor = "move";
          } else if (this.mouseZoom) {
            cursor = "zoom-in";
          }
          this.distanceMeasurements.control.deactivate();
          window.document.getElementById("canvas").style.cursor = cursor;

          // Cancel selection
          this.modelTracker.filterSelected((x) => false);
          scene.setObjectsSelected(scene.objectIds, false);
        }
      },
      this
    );

    window.viewer = viewer;
    this.mountTree();
  }

  //------------------------------------------------------------------------------------------------------------------
  // Return an array containing the current annotations
  //------------------------------------------------------------------------------------------------------------------
  getAnnotations() {
    const annotations = this.annotations.annotations;
    var array = [];
    for (let annotationId in annotations) {
      let annotation = annotations[annotationId];
      let data = {
        title: annotation.getField("title"),
        description: annotation.getField("description"),
        worldPos: annotation.worldPos,
        entity: annotation.entity.id,
      };
      array.push(data);
    }
    return array;
  }

  //------------------------------------------------------------------------------------------------------------------
  // Load previously saved annotations
  //------------------------------------------------------------------------------------------------------------------
  loadAnnotations(annotations) {
    const scene = window.viewer.scene;
    for (let annotation of annotations) {
      const wp = annotation.worldPos;
      const id = "annotation-" + this.annotationsCount;
      const title = annotation.title;
      const desc = annotation.description;
      this.annotations.createAnnotation({
        id: id,
        entity: scene.objects[annotations.entity],
        worldPos: [wp["0"], wp["1"], wp["2"]],
        occludable: true,
        labelShown: true,
        values: {
          // HTML template values
          glyph: this.annotationsCount++,
          title: title,
          description: desc,
        },
      });

      this.props.signalNewAnnotation({
        id: id,
        name: title,
        description: desc,
      });
    }
  }

  mountTree() {
    const viewer = window.viewer;
    const scene = viewer.scene;

    //------------------------------------------------------------------------------------------------------------------
    // Create an IFC structure tree view
    //------------------------------------------------------------------------------------------------------------------
    this.treeView = new TreeViewPlugin(window.viewer, {
      containerElement: document.getElementById("tree-container"),
      autoExpandDepth: 0,
      autoAddModels: false,
    });

    //----------------------------------------------------------------------------------------------------------------------
    // Load models on tree
    //----------------------------------------------------------------------------------------------------------------------
    scene.modelIds.forEach((modelId) => {
      const model = scene.models[modelId];
      model.on("loaded", () => {
        this.treeView.addModel(model.id);
        --this.loading;
        if (!this.loading) {
          this.signalMount();
        }
      });
    });

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
            visible: this.modelTracker.isVisible(id),
            xrayed: this.modelTracker.isXRayed(id),
            selected: this.modelTracker.isSelected(id),
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

        const xrayed = this.modelTracker.getXRayed();

        setTimeout(() => {
          scene.setObjectsXRayed(scene.objectIds, false);
          if (xrayed.length > 0) {
            scene.setObjectsXRayed(xrayed, true);
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
  toggleVisibility(nodes, searchNodes) {
    nodes = Array.isArray(nodes) ? nodes : [nodes];
    const viewer = window.viewer;
    const scene = viewer.scene;
    var objectIds = searchNodes ? [] : nodes;

    if (searchNodes) {
      for (let node of nodes) {
        this.treeView.withNodeTree(node, (treeViewNode) => {
          if (treeViewNode.objectId) {
            objectIds.push(treeViewNode.objectId);
          }
        });
      }
    }

    const visible = this.modelTracker.getVisible();
    const countVisible = [...visible.filter((x) => objectIds.includes(x))]
      .length;

    if (countVisible > objectIds.length / 2) {
      scene.setObjectsVisible(objectIds, false);
      this.modelTracker.filterVisible((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsVisible(objectIds, true);
      this.modelTracker.setVisible(objectIds, true);
    }
  }

  toggleXray(nodes, searchNodes) {
    nodes = Array.isArray(nodes) ? nodes : [nodes];
    const viewer = window.viewer;
    const scene = viewer.scene;
    var objectIds = searchNodes ? [] : nodes;

    if (searchNodes) {
      for (let node of nodes) {
        this.treeView.withNodeTree(node, (treeViewNode) => {
          if (treeViewNode.objectId) {
            objectIds.push(treeViewNode.objectId);
          }
        });
      }
    }

    const xrayed = this.modelTracker.getXRayed();
    const countXrayed = [...xrayed.filter((x) => objectIds.includes(x))].length;

    if (countXrayed > objectIds.length / 2) {
      scene.setObjectsXRayed(objectIds, false);
      this.modelTracker.filterXRayed((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsXRayed(objectIds, true);
      this.modelTracker.setXRayed(objectIds, true);
    }
  }

  toggleSelect(nodes, searchNodes) {
    nodes = Array.isArray(nodes) ? nodes : [nodes];
    const viewer = window.viewer;
    const scene = viewer.scene;
    var objectIds = searchNodes ? [] : nodes;

    if (searchNodes) {
      for (let node of nodes) {
        this.treeView.withNodeTree(node, (treeViewNode) => {
          if (treeViewNode.objectId) {
            objectIds.push(treeViewNode.objectId);
          }
        });
      }
    }

    const selected = this.modelTracker.getSelected();
    const countSelected = [...selected.filter((x) => objectIds.includes(x))]
      .length;

    if (countSelected > objectIds.length / 2) {
      scene.setObjectsSelected(objectIds, false);
      this.modelTracker.filterSelected((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsSelected(objectIds, true);
      this.modelTracker.setSelected(objectIds, true);
    }
  }

  lookAt() {
    const viewer = window.viewer;
    const scene = viewer.scene;
    const aabb = scene.getAABB(
      this.modelTracker.getSelected().length > 0
        ? this.modelTracker.getSelected()
        : scene.visibleObjectIds
    );
    const pos = math.getAABB3Center(aabb, math.vec3());
    viewer.cameraFlight.flyTo(pos);
  }

  //----------------------------------------------------------------------------------------------------------------------
  // Tools tab handlers
  //----------------------------------------------------------------------------------------------------------------------

  setEdges(state) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    scene.modelIds.forEach((modelId) => {
      const model = scene.models[modelId];
      model.edges = state;
    });
  }

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
    const aabb = scene.getAABB(scene.visibleObjectIds);
    viewer.cameraFlight.flyTo({
      aabb: aabb,
    });
  }

  showAll() {
    const viewer = window.viewer;
    const scene = viewer.scene;
    this.modelTracker.resetVisible();
    scene.setObjectsVisible(this.modelTracker.getVisible(), true);
  }

  getStoreys() {
    var storeys = {};
    const modelStoreys = this.storeyViewsPlugin.modelStoreys;
    for (let modelId in modelStoreys) {
      storeys[modelId] = [];
      let thisStoreys = modelStoreys[modelId];
      for (let storeyId in thisStoreys) {
        storeys[modelId].push(storeyId);
      }
    }
    return storeys;
  }

  setStorey(value) {
    this.sectionPlanes.setOverviewVisible(false);
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
      cameraControl.navMode = "orbit";
      cameraControl.pivoting = true;
      cameraFlight.flyTo({
        eye: [-2.56, 8.38, 8.27],
        look: [13.44, 3.31, -14.83],
        up: [0.1, 0.98, -0.14],
        projection: "perspective",
      });
      this.sectionPlanes.setOverviewVisible(true);
      return;
    }

    this.storeyViewsPlugin.showStoreyObjects(value, {
      hideOthers: true,
    });

    this.storeyViewsPlugin.gotoStoreyCamera(value, {
      projection: "ortho",
      duration: 0.8,
      done: () => {
        // Create 2D view
        viewer.cameraControl.navMode = "planView"; // Disable rotation
        viewer.cameraControl.pivoting = false;
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
                viewer.cameraControl.pivoting = false;
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
        cameraControl.pivoting = true;
        break;
      case "pan":
        cameraControl.pointerEnabled = true;
        this.mouseZoom = false;
        this.mousePan = true;
        cameraControl.navMode = "planView";
        cameraControl.pivoting = false;
        break;
      case "zoom":
        window.document.getElementById("canvas").style.cursor = "zoom-in";
        cameraControl.pointerEnabled = false;
        this.mouseZoom = true;
        this.mousePan = false;
        cameraControl.pivoting = false;
        break;
      default:
        window.document.getElementById("canvas").style.cursor = "default";
        cameraControl.pointerEnabled = true;
        this.mouseZoom = false;
        this.mousePan = false;
        cameraControl.navMode = "orbit";
        cameraControl.pivoting = true;
        break;
    }
  }

  createSectionPlane() {
    this.mouseCreatePlanes = true;
    this.mouseCreateAnnotations = false;
    this.mouseMeasureDistance = false;
    this.distanceMeasurements.control.deactivate();
    window.document.getElementById("canvas").style.cursor = "pointer";
  }

  destroySectionPlane() {
    let id = this.sectionPlanes.getShownControl();
    this.sectionPlanes.destroySectionPlane(id);
  }

  measureDistance() {
    this.mouseMeasureDistance = true;
    this.mouseCreatePlanes = false;
    this.mouseCreateAnnotations = false;
    this.distanceMeasurements.control.activate();
  }

  destroyMeasurements() {
    this.distanceMeasurements.clear();
  }

  createAnnotations() {
    this.mouseCreateAnnotations = true;
    this.mouseMeasureDistance = false;
    this.mouseCreatePlanes = false;
    this.distanceMeasurements.control.deactivate();
    window.document.getElementById("canvas").style.cursor = "pointer";
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
