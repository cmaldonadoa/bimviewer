import React from "react";
import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer";
import { GLTFLoaderPlugin } from "@xeokit/xeokit-sdk/src/plugins/GLTFLoaderPlugin/GLTFLoaderPlugin.js";
import { NavCubePlugin } from "@xeokit/xeokit-sdk/src/plugins/NavCubePlugin/NavCubePlugin.js";
import { TreeViewPlugin } from "@xeokit/xeokit-sdk/src/plugins/TreeViewPlugin/TreeViewPlugin.js";

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.loading = true;

    /* Store user changes */
    this.visible = [];
    this.xrayed = [];
    this.selected = [];

    /* GUI functions */
    this.updateEntity = props.updateEntity;
    this.openTreeContextMenu = props.openTreeContextMenu;
    this.closeTreeContextMenu = props.closeTreeContextMenu;
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
    cameraControl.doublePickFlyTo = false;
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
    // Mouse over entities to highlight them
    //------------------------------------------------------------------------------------------------------------------
    var lastEntity = null;

    scene.input.on("mousemove", function(coords) {
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
    // Click an object to show IFC data and the tree node
    //------------------------------------------------------------------------------------------------------------------
    scene.input.on(
      "mouseclicked",
      function(coords) {
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
      const gltfLoader = new GLTFLoaderPlugin(window.viewer);

      const model = gltfLoader.load({
        id: "model",
        src: "/models/IFC_Schependomlaan.gltf",
        metaModelSrc: "/models/IFC_Schependomlaan_xeokit.json",
        edges: true,
      });

      model.on("loaded", () => {
        this.treeView.addModel(model.id);
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
  toggleVisibility(node) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    const objectIds = [];

    this.treeView.withNodeTree(node, (treeViewNode) => {
      if (treeViewNode.objectId) {
        objectIds.push(treeViewNode.objectId);
      }
    });

    if (this.visible.includes(node.objectId)) {
      scene.setObjectsVisible(objectIds, false);
      this.visible = this.visible.filter((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsVisible(objectIds, true);
      this.visible = [...new Set([...this.visible, ...objectIds])];
    }
  }

  toggleXray(node) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    const objectIds = [];

    this.treeView.withNodeTree(node, (treeViewNode) => {
      if (treeViewNode.objectId) {
        objectIds.push(treeViewNode.objectId);
      }
    });

    if (this.xrayed.includes(node.objectId)) {
      scene.setObjectsXRayed(objectIds, false);
      this.xrayed = this.xrayed.filter((x) => !objectIds.includes(x));
    } else {
      scene.setObjectsXRayed(objectIds, true);
      this.xrayed = [...new Set([...this.xrayed, ...objectIds])];
    }
  }

  toggleSelect(node) {
    const viewer = window.viewer;
    const scene = viewer.scene;
    const objectIds = [];

    this.treeView.withNodeTree(node, (treeViewNode) => {
      if (treeViewNode.objectId) {
        objectIds.push(treeViewNode.objectId);
      }
    });

    if (this.selected.includes(node.objectId)) {
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
}
