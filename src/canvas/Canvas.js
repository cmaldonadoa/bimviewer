import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer";
import { GLTFLoaderPlugin } from "@xeokit/xeokit-sdk/src/plugins/GLTFLoaderPlugin/GLTFLoaderPlugin.js";
import { NavCubePlugin } from "@xeokit/xeokit-sdk/src/plugins/NavCubePlugin/NavCubePlugin.js";
import { TreeViewPlugin } from "@xeokit/xeokit-sdk/src/plugins/TreeViewPlugin/TreeViewPlugin.js";

export default class Canvas {
  constructor(props) {
    this.updateEntity = (id) => {
      props.updateEntity(id);
    };
    this.build();
  }

  build() {
    //------------------------------------------------------------------------------------------------------------------
    // Create a Viewer, arrange the camera, tweak x-ray and highlight materials
    //------------------------------------------------------------------------------------------------------------------

    const viewer = new Viewer({
      canvasId: "canvas",
      transparent: true,
    });

    const cameraControl = viewer.cameraControl;
    const scene = viewer.scene;
    const cameraFlight = viewer.cameraFlight;

    cameraControl.panToPointer = true;
    cameraControl.doublePickFlyTo = true;
    cameraFlight.duration = 1.0;
    cameraFlight.fitFOV = 25;

    viewer.camera.eye = [-2.56, 8.38, 8.27];
    viewer.camera.look = [13.44, 3.31, -14.83];
    viewer.camera.up = [0.1, 0.98, -0.14];

    viewer.scene.xrayMaterial.fillAlpha = 0.1;
    viewer.scene.xrayMaterial.fillColor = [0, 0, 0];
    viewer.scene.xrayMaterial.edgeAlpha = 0.4;
    viewer.scene.xrayMaterial.edgeColor = [0, 0, 0];

    viewer.scene.highlightMaterial.fill = false;
    viewer.scene.highlightMaterial.fillAlpha = 0.3;
    viewer.scene.highlightMaterial.edgeColor = [1, 1, 0];

    //------------------------------------------------------------------------------------------------------------------
    // Create a NavCube
    //------------------------------------------------------------------------------------------------------------------

    new NavCubePlugin(viewer, {
      canvasId: "cube-canvas",
      visible: true,
      size: 200,
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

    viewer.scene.input.on("mousemove", function(coords) {
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
    // Click an object to log IFC data to console
    //------------------------------------------------------------------------------------------------------------------

    scene.input.on("mouseclicked", function(coords) {
      var hit = scene.pick({
        canvasPos: coords,
      });

      if (hit) {
        var entity = hit.entity;
        entity.highlighted = true;
        var metaObject = viewer.metaScene.metaObjects[entity.id];
        if (metaObject) {
          console.log(JSON.stringify(metaObject.getJSON(), null, "\t"));
        } else {
          const parent = entity.parent;
          if (parent) {
            metaObject = viewer.metaScene.metaObjects[parent.id];
            if (metaObject) {
              console.log(JSON.stringify(metaObject.getJSON(), null, "\t"));
            }
          }
        }
      }
    });

    window.viewer = viewer;
  }

  mountTree() {
    if (this.treeView) {
      //------------------------------------------------------------------------------------------------------------------
      // Create an IFC structure tree view
      //------------------------------------------------------------------------------------------------------------------

      this.treeView = new TreeViewPlugin(window.viewer, {
        containerElement: document.getElementById("tree-container"),
        autoExpandDepth: 0, // Initially expand tree three nodes deep
        autoAddModels: false,
      });

      this.treeView.addModel("model");
    } else {
      //------------------------------------------------------------------------------------------------------------------
      // Create an IFC structure tree view
      //------------------------------------------------------------------------------------------------------------------

      this.treeView = new TreeViewPlugin(window.viewer, {
        containerElement: document.getElementById("tree-container"),
        autoExpandDepth: 0, // Initially expand tree three nodes deep
        autoAddModels: false,
      });

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

      model.on("loaded", () => this.treeView.addModel(model.id));
    }

    //----------------------------------------------------------------------------------------------------------------------
    // Clicking an entity will show it in the tree
    //----------------------------------------------------------------------------------------------------------------------
    var self = this;
    window.viewer.cameraControl.on("picked", function(e) {
      var objectId = e.entity.id;
      const scene = window.viewer.scene;
      self.treeView.showNode(objectId);
      self.updateEntity(objectId);
      window.viewer.cameraFlight.flyTo({
        aabb: scene.getAABB(objectId),
        duration: 0.5,
      });
    });

    // TBD: undo button (which would click tree root)
    // Idea: isolate button (xray not selected meshes)
    this.treeView.on("nodeTitleClicked", (e) => {
      const scene = window.viewer.scene;
      const objectIds = [];
      e.treeViewPlugin.withNodeTree(e.treeViewNode, (treeViewNode) => {
        if (treeViewNode.objectId) {
          objectIds.push(treeViewNode.objectId);
        }
      });
      scene.setObjectsXRayed(scene.objectIds, true);
      scene.setObjectsVisible(scene.objectIds, true);
      scene.setObjectsXRayed(objectIds, false);
      if (objectIds.length === 1) {
        self.treeView.showNode(objectIds[0]);
        self.updateEntity(objectIds[0]);
      }

      window.viewer.cameraFlight.flyTo({
        aabb: scene.getAABB(objectIds),
        duration: 0.5,
      });
    });
  }
}
