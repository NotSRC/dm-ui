// @ts-nocheck
import { RendererSettings } from './SpeckleRenderer.model';
import { RendererPipelineMethod } from './SpeckleRenderer.model';
import * as THREE from 'three';

import OrbitControls from 'threejs-orbit-controls';

import Rainbow from 'rainbowvis.js';
import CH from 'color-hash';
import TWEEN from '@tweenjs/tween.js';

import EE from 'event-emitter-es6';
import flatten from 'flat';
import debounce from 'lodash.debounce';

import { Converter } from './SpeckleConverter';
import SelectionBox from './SelectionBox';
import SelectionHelper from './SelectionHelper';

const singletonsStore = new Map();

export class SpeckleRenderer extends EE {

  opacityTable: { [key: string]: number} = {};
  colorTable: { [key: string]: THREE.Color | string } = {};

  renderer = null;
  scene: THREE.Scene = null;

  camera = null;
  controls = null;
  orbitControls = null;
  hemiLight = null;
  flashLight = null;
  shadowLight = null;

  raycaster = null;
  mouse = null;
  mouseDownTime = null;

  selectionBox = null;
  selectionHelper = null;

  hoveredObject = null;
  selectedObjects = [];
  highlightedObjects = [];

  sceneBoundingSphere = null;
  currentColorByProp = null;
  isSettingColors = false;
  isSpinning = false;
  enableKeyobardEvents = false;

  hoverColor: THREE.Color = new THREE.Color('#EEF58F');
  selectColor: THREE.Color = new THREE.Color('#E3E439');

  colorHasher: CH = new CH();

  edgesGroup: THREE.Group = new THREE.Group();
  edgesThreshold = null;
  domObject = null;

  // queue for image rendering
  imageQueue = [];
  imageQueueProcessingInProgress = false;

  rendererSettings: RendererSettings = null;

  viewerSettings = null;
  controlsListener = null;
  imageDataResolver: (result: string) => void;

  static renderObjectToImage(
    { domObject },
    viewerSettings,
    config: {
      dataObjects: any;
      pipeline?: RendererPipelineMethod[]
      size?: string;
      delay?: number;
    } = { size: 'small', dataObjects: null, delay: 1 }
  ): Promise<string> {
    let instance = singletonsStore.get(config.size);
    if (!instance) {
      instance = new SpeckleRenderer({ domObject }, viewerSettings, {
        selectable: false,
        allowZoom: false,
        disableControls: true,
        instantPositioning: true,
        imageQueueMode: true,
      });

      instance.animate();
      singletonsStore.set(config.size, instance);
    }

    return new Promise((resolve) => {
      instance.imageQueue.push({ ...config, resolve });
      if (!instance.imageQueueProcessingInProgress) {
        instance.processImageQueue();
      }
    });
  }

  constructor(
    { domObject },
    viewerSettings,
    rendererSettings: RendererSettings = {
      selectable: true,
      allowZoom: true,
      disableControls: false,
      imageQueueMode: false,
      instantPositioning: false,
    }
  ) {
    super(); // event emitter init

    this.domObject = domObject;
    this.edgesGroup.name = 'displayEdgesGroup';

    this.viewerSettings = viewerSettings;
    this.rendererSettings = rendererSettings;

    this.initialise();
  }

  initialise() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(
      this.domObject.offsetWidth,
      this.domObject.offsetHeight
    );
    // this.renderer.setClearColor( new THREE.Color(  ), 0.0 )
    this.renderer.shadowMap.enabled = true;
    this.domObject.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper(10);
    this.scene.add(axesHelper);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.color = new THREE.Color('#FFFFFF');
    hemiLight.groundColor = new THREE.Color('#959595');
    hemiLight.position.set(0, 500, 0);
    hemiLight.isCurrent = true;
    hemiLight.name = 'world lighting';
    hemiLight.up.set(0, 0, 1);
    this.scene.add(hemiLight);

    this.shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.shadowLight.position.set(1, 1, 5);
    this.shadowLight.castShadow = true;
    this.shadowLight.visible = false;
    this.scene.add(this.shadowLight);
    this.shadowLight.shadow.mapSize.width = 512; // default
    this.shadowLight.shadow.mapSize.height = 512; // default
    this.shadowLight.shadow.camera.near = 0.5; // default
    this.shadowLight.shadow.camera.far = 500;

    this.camera = new THREE.PerspectiveCamera(
      55,
      this.domObject.offsetWidth / this.domObject.offsetHeight,
      0.1,
      100000
    );
    this.camera.up.set(0, 0, 1);
    this.camera.position.z = 250;
    this.camera.position.y = 250;
    this.camera.position.x = 250;

    this.camera.isCurrent = true;

    const flashlight = new THREE.PointLight(
      new THREE.Color('#FFFFFF'),
      0.32,
      0,
      1
    );
    flashlight.name = 'camera light';
    this.camera.add(flashlight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = !this.rendererSettings.disableControls;
    this.controls.enableZoom = this.rendererSettings.allowZoom;
    this.controls.screenSpacePanning = true;

    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = Math.PI / 2;

    this.edgesGroup.visible = false;
    this.scene.add(this.edgesGroup);

    this.updateViewerSettings();
    // this.controls.enableDamping = true
    // this.controls.dampingFactor = 0.45
    // this.controls = new TrackballControls( this.camera, this.renderer.domElement  )

    // if (!window.THREE) {
    //   window.THREE = THREE;
    // }
    // // polute the global scope, why not?
    // if (!window.Converter) {
    //   window.Converter = Converter;
    // }

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.selectionBox = new SelectionBox(this.camera, this.scene);
    this.selectionHelper = new SelectionHelper(
      this.selectionBox,
      this.renderer,
      'selectBox',
      this.controls,
      this.mouse,
      !this.rendererSettings.selectable
    );

    window.addEventListener('resize', this.resizeCanvas, false);
    if (this.rendererSettings.selectable) {
      this.renderer.domElement.addEventListener('mousemove', this.onTouchMove);
      this.renderer.domElement.addEventListener('touchmove', this.onTouchMove);

      this.renderer.domElement.addEventListener('mousedown', this.mouseDown);
      this.renderer.domElement.addEventListener('mouseup', this.mouseUp);

      this.domObject.addEventListener('mouseover', this.enableEvents);
      this.domObject.addEventListener('mouseout', this.disableEvents);

      window.addEventListener('keydown', this.keydown);
      window.addEventListener('keyup', this.keyup);
    }

    // this.updateViewerSettings( )
    this.computeSceneBoundingSphere();
    this.render();
    this.controlsListener = debounce(() => {
      this.emit('camera-pos', {
        target: [
          this.controls.target.x,
          this.controls.target.y,
          this.controls.target.z,
        ],
        position: [
          this.camera.position.x,
          this.camera.position.y,
          this.camera.position.z,
        ],
        rotation: [
          this.camera.rotation.x,
          this.camera.rotation.y,
          this.camera.rotation.z,
        ],
      });
      this.setFar();
    }, 200);
    //
    this.controls.addEventListener('change', this.controlsListener);
    this.processPipeline();
  }

  processPipeline(pipeline: RendererPipelineMethod[] = this.rendererSettings.pipeline) {
    if (pipeline) {
      pipeline.forEach((cb) => {
        cb(this, this.rendererSettings);
      });
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
    this.setFar();
    this.controls.update();
    this.render();

    if (this.imageDataResolver) {
      const imgData = this.renderer.domElement.toDataURL();
      this.imageDataResolver(imgData);
      this.imageDataResolver = null;
    }
  }

  getViewAsImageData(delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.imageDataResolver = resolve;
      }, delay);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  resizeCanvas = () => {
    this.camera.aspect =
      this.domObject.offsetWidth / this.domObject.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.domObject.offsetWidth,
      this.domObject.offsetHeight
    );
  }

  // called on mouseover the render div - tells us we can actually enable interactions
  // in the threejs window
  enableEvents = (e) => {
    this.enableKeyobardEvents = true;
  }

  // called on mouseout of the render div - will stop interactions, such as spacebar
  // for zoom extents, etc. in the threejs window
  disableEvents = (e) => {
    this.unHighlightObjects();
    this.enableKeyobardEvents = false;
  }

  // HIC SUNT DRACONES:
  // Selection events and mouse interactions below.
  // Main thing to note:
  // - Holding down shift will disable the orbit controls and enable draggin a selection box
  // - Double clicking on an object will zoom to it
  // - (TODO) Clicking on an object selects it
  // - (TODO) Clicking outside any objects/selection box will kill current selection

  keydown = (event) => {
    if (!this.enableKeyobardEvents) { return; }
    switch (event.code) {
      case 'Space':
        this.computeSceneBoundingSphere();
        this.zoomExtents();
        event.stopPropagation();
        break;
      case 'ShiftLeft':
        if (!this.isSpinning && this.rendererSettings.selectable) {
          this.controls.enabled = false;
          this.domObject.style.cursor = 'copy';
        }
        break;
      default:
        break;
    }
  }

  keyup = (event) => {
    if (!this.enableKeyobardEvents) { return; }
    // console.log( `key: ${event.code}` )
    switch (event.code) {
      case 'ShiftLeft': {
        this.controls.enabled = !this.rendererSettings.disableControls;
        this.domObject.style.cursor = '';
        break;
      }
      default: {
        break;
      }
    }
  }

  // we dont' do much on mouse down:
  // 1) if it's a doubleclick, and we have a hovered object, zoom to it
  // 2) if the orbit controls are disabled (meaning we're holding down shift for a multiple selection)
  // then start the selection box point
  mouseDown = (event) => {
    this.isSpinning = true;
    // if it's a double click
    if (Date.now() - this.mouseDownTime < 300 && this.hoveredObject !== null)
      this.zoomToObject(this.hoveredObject);

    if (this.controls.enabled === false && this.rendererSettings.selectable)
      this.selectionBox.startPoint.set(this.mouse.x, this.mouse.y, 0.5);

    this.mouseDownTime = Date.now();
  }

  mouseUp = (event) => {
    this.isSpinning = false;
    // check if it's a single short click (as opposed to a longer difference caused by moving the orbit controls
    // or dragging the selection box)
    if (Date.now() - this.mouseDownTime < 300) {
      if (
        this.hoveredObject &&
        this.selectedObjects.findIndex(
          (x) => x.userData._id === this.hoveredObject.userData._id
        ) !== -1
      ) {
        // Inside the selection -> check if it's a single object deselect
        if (event.ctrlKey) {
          this.removeFromSelection([this.hoveredObject]);
          // this.emit( 'select-remove-objects', [ this.hoveredObject.userData._id ] )
          // this.hoveredObject.material.color.copy( this.hoveredObject.material.__preSelectColor )
          // this.hoveredObject.material.__preHoverColor.copy( this.hoveredObject.material.__preSelectColor ) // set the same prehover color as the original color, otherwise on unhover we set the "selected" color back
        }
      } else if (this.hoveredObject) {
        // if there is a hovered object...
        if (event.shiftKey) {
          console.log('should add to selection');
          this.addToSelection([this.hoveredObject]);
        } else if (event.ctrlKey) {
          console.log('should remove from selection');
          this.removeFromSelection([this.hoveredObject]);
        } else {
          console.log('single selection');
          this.clearSelection();
          this.addToSelection([this.hoveredObject]);
          // this.hoveredObject.material.__preSelectColor = this.hoveredObject.material.color.clone( )
          // this.hoveredObject.material.__preHoverColor = this.selectColor
          // this.hoveredObject.material.color.copy( this.selectColor )
        }
      } else {
        // there is no hovered object, so clear selection!?
        this.clearSelection();
      }
    } else {
      // if the controls were disabled, it means we've been selecting objects with the selection box
      if (!this.controls.enabled) {
        this.emit(
          'select-objects',
          this.selectionBox.collection.map((o) => o.userData._id)
        );
      }
    }
  }

  onTouchMove = (event) => {
    let x, y;
    if (event.changedTouches) {
      x = event.changedTouches[0].pageX;
      y = event.changedTouches[0].pageY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }
    let rect = this.domObject.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    this.mouse.x = (x / this.domObject.offsetWidth) * 2 - 1;
    this.mouse.y = -(y / this.domObject.offsetHeight) * 2 + 1;

    // disallow interactions on color sets
    if (this.isSettingColors) return;

    // check if we're dragging a box selection
    if (this.selectionHelper.isDown && !this.controls.enabled) {
      this.selectionBox.endPoint.set(this.mouse.x, this.mouse.y, 0.5);
      var allSelected = this.selectionBox.select();
      this.addToSelection(allSelected);
      // for ( var i = 0; i < allSelected.length; i++ ) {
      //   allSelected[ i ].material.__preSelectColor = allSelected[ i ].material.color.clone( )
      //   allSelected[ i ].material.color.copy( this.selectColor )
      // }
    }
    // if not, highlight a selected object
    else if (!this.isSpinning) {
      this.highlightMouseOverObject();
    }
  }

  highlightMouseOverObject() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects([this.scene], true);
    if (intersects.length > 0) {
      if (intersects[0].object !== this.hoveredObject) {
        if (intersects[0].object.userData.hasOwnProperty('_id')) {
          this.domObject.style.cursor = 'pointer';
          // if there was a pre-exsiting hovered object
          // unhover it first
          if (this.hoveredObject) {
            this.hoveredObject.userData.selected
              ? this.hoveredObject.material.color.copy(this.selectColor)
              : this.hoveredObject.material.color.copy(
                  this.hoveredObject.material.__preHoverColor
                );

            this.hoveredObject.userData.hovered = false;
          }
          this.hoveredObject = intersects[0].object;
          this.hoveredObject.userData.hovered = true;
          this.hoveredObject.material.__preHoverColor = this.hoveredObject.material.color.clone();
          this.hoveredObject.material.color.copy(this.hoverColor);
        }
      }
    } else {
      this.domObject.style.cursor = 'default';
      if (this.hoveredObject) {
        this.hoveredObject.material.color.copy(
          this.hoveredObject.material.__preHoverColor
        );
        this.hoveredObject.userData.hovered = false;
        this.hoveredObject = null;
      }
    }
  }

  addToSelection(objects) {
    let added = [];
    objects.forEach((obj, index) => {
      if (
        this.selectedObjects.findIndex(
          (x) => x.userData._id === obj.userData._id
        ) === -1
      ) {
        obj.userData.selected = true;
        if (!obj.userData.hovered) {
          obj.material.__preSelectColor = obj.material.color.clone();
        } else {
          obj.material.__preSelectColor = obj.material.__preHoverColor.clone();
          obj.material.__preHoverColor.copy(this.selectColor);
        }

        obj.material.color.copy(this.selectColor);
        this.selectedObjects.push(obj);
        added.push(obj.userData._id);
      }
      if (index === objects.length - 1) {
        // TODO: emit added to selection event
        this.emit('select-add-objects', added);
      }
    });
  }

  removeFromSelection(objects) {
    let removed = [];
    objects.forEach((obj, index) => {
      let myIndex = this.selectedObjects.findIndex(
        (x) => x.userData._id === obj.userData._id
      );
      if (myIndex !== -1) {
        obj.userData.selected = false;
        removed.push(obj.userData._id);
        this.selectedObjects.splice(myIndex, 1);
        obj.material.color.copy(obj.material.__preSelectColor);
        obj.material.__preHoverColor.copy(obj.material.__preSelectColor);
      }
      if (index === objects.length - 1) {
        // TODO: emit removed from selection event
        this.emit('select-remove-objects', removed);
      }
    });
  }

  clearSelection() {
    this.selectedObjects.forEach((obj) => {
      obj.userData.selected = false;
      obj.material.color.copy(obj.material.__preSelectColor);
    });
    this.emit('select-objects', []);
    this.selectedObjects = [];
  }

  // adds a bunch of speckle objects to the scene. handles conversion and
  // computes each objects's bounding sphere for faster zoom extents calculation
  // of the scene bounding sphere.
  loadObjects({ objs, zoomExtents }) {
    objs.forEach((obj, index) => {
      try {
        const splitType = obj.type.split('/');
        let convertType = splitType.pop();
        while ((splitType.length > 0) & !Converter.hasOwnProperty(convertType)) {
          convertType = splitType.pop();
        }
        if (Converter.hasOwnProperty(convertType)) {
          Converter[convertType]({ obj }, (err, threeObj) => {
            threeObj.userData._id = obj._id;
            threeObj.userData.properties = obj.properties
              ? flatten(obj.properties, { safe: true })
              : null;
            threeObj.userData.originalColor = threeObj.material.color.clone();
            threeObj.geometry.computeBoundingSphere();
            threeObj.castShadow = true;
            threeObj.receiveShadow = true;
            if (threeObj.material && obj.opacity >= 0) {
              threeObj.material.opacity = obj.opacity  / 100;
            }
            this.drawEdges(threeObj, obj._id);
            this.scene.add(threeObj);
          });
        }
      } catch (e) {
        console.warn(
          `Something went wrong in the conversion of ${obj._id} (${obj.type})`
        );
        console.log(obj);
        console.log(e);
        return;
      }

      if (zoomExtents && index === objs.length - 1) {
        console.log(this.scene.children.length);
        this.computeSceneBoundingSphere();
        this.zoomExtents();
      }
    });
  }

  drawEdges(threeObj, id) {
    if (threeObj.type !== 'Mesh') { return; }
    const objEdges = new THREE.EdgesGeometry(
      threeObj.geometry,
      this.viewerSettings.edgesThreshold
    );
    const edgeLines = new THREE.LineSegments(
      objEdges,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    edgeLines.userData._id = id;
    this.edgesGroup.add(edgeLines);
  }

  updateEdges() {
    this.processLargeArray(this.edgesGroup.children, (obj) => {
      this.edgesGroup.remove(obj);
    });
    this.processLargeArray(this.scene.children, (obj) => {
      if (obj.type !== 'Mesh') { return; }
      this.drawEdges(obj, obj.userData._id);
    });
  }

  // removes an array of objects from the scene and recalculates the scene bounding sphere
  unloadObjects({ objIds }) {
    const toRemove = [];

    this.scene.traverse((obj) => {
      if (obj.userData._id) {
        if (objIds.indexOf(obj.userData._id) !== -1) {
          toRemove.push(obj);
        }
      }
    });

    toRemove.forEach((object, index) => {
      object.parent.remove(object);
      if (index === toRemove.length - 1) {
        this.computeSceneBoundingSphere();
        this.zoomExtents();
      }
    });
  }

  // sets (updates) the properties field of the objects
  // (useful if you modify the props outside three)
  updateObjectsProperties({ objects }) {
    this.processLargeArray(objects, (obj, index) => {
      const sceneObject = this.scene.children.find(
        (o) => o.userData._id === obj._id
      );
      if (!sceneObject) { return; }
      sceneObject.userData.properties = flatten(obj.properties);
    });
  }

  // entry point for any attempt to color things by their properties in the viewer
  // depending on the property, it will either call "colorByNumericProperty" or
  // "colorByStringProperty" (see below)
  colorByProperty({ propertyName, propagateLegend, colors }) {
    if (propagateLegend === null || propagateLegend === undefined) {
      propagateLegend = true;
    }

    const first = this.scene.children.find(
      (o) =>
        o.userData &&
        o.userData.properties &&
        o.userData.properties[propertyName]
    );
    if (!first) {
      console.warn(`no property found (${propertyName}) on any scene objects.`);
      return;
    }
    if (this.currentColorByProp === propertyName) { return; }
    this.unHighlightObjects();
    this.currentColorByProp = propertyName;

    const isNumeric = !isNaN(first.userData.properties[propertyName]);
    console.log(
      `coloring by ${propertyName}, which is (numeric: ${isNumeric})`
    );

    if (isNumeric) {
      this.colorByNumericProperty({
        propertyName,
        propagateLegend,
        colors,
      });
    } else {
      this.colorByStringProperty({
        propertyName,
        propagateLegend,
      });
    }
  }

  // attempts to color all objects  in the scene by a numeric property, computing its bounds
  // and generating a gradient from min (blue) to max (pinkish)
  colorByNumericProperty({ propertyName, propagateLegend, colors }) {
    if (propagateLegend === null || propagateLegend === undefined)
      propagateLegend = true;
    // compute bounds
    let min = 10e6,
      max = -10e6,
      foundObjs = [],
      toReset = [];

    this.isSettingColors = true;
    // TODO: chunkify this loop yo
    for (let obj of this.scene.children) {
      if (
        !(
          obj.userData &&
          obj.userData.properties &&
          obj.userData.properties[propertyName]
        )
      ) {
        toReset.push(obj);
        continue;
      }
      if (!obj.visible) continue;

      let value = obj.userData.properties[propertyName];
      if (value > max) max = value;
      if (value < min) min = value;
      foundObjs.push(obj);
    }

    if (min === max) {
      min -= 1;
      max += 1;
    }

    console.log(`bounds: ${min}, ${max} 🌈`);
    if (propagateLegend)
      this.emit('analysis-legend', {
        propertyName: propertyName,
        isNumeric: true,
        min: min,
        max: max,
        objectCount: foundObjs.length,
      });
    // gen rainbow 🌈
    let rainbow = new Rainbow();
    rainbow.setNumberRange(min, max);
    rainbow.setSpectrum(...colors);

    foundObjs.forEach((obj, index) => {
      let value = obj.userData.properties[propertyName],
        color = null;

      if (!isNaN(value) && !!value)
        color = new THREE.Color(`#${rainbow.colourAt(value)}`);
      else color = new THREE.Color('#B3B3B3');

      if (!obj.userData.selected) {
        obj.material._oldColor = obj.material.color;
        obj.material.color.copy(color);
      } else {
        obj.material.__preSelectColor.copy(color);
      }

      if (index === foundObjs.length - 1) {
        this.isSettingColors = false;
      }
    });

    const defaultColor = new THREE.Color('#B3B3B3');
    toReset.forEach((obj) => {
      // if ( !obj.userData.selected ) {
      //   obj.material._oldColor = obj.material.color
      if (obj.material) {
        obj.material.color.copy(defaultColor);
      }
      // } else {
      //   obj.material.__preSelectColor.copy( color )
      // }
    });
  }

  registerColorAndOpacity(table: {[key: string]: { color: number[] | string; alpha: number; } }) {
    const keysArray = Object.keys(table);
    const alphaHash = keysArray.reduce((acc, key) => {
      acc[key] = table[key].alpha;
      return acc;
    }, {});
    const colorHash = keysArray.reduce((acc, key) => {
      acc[key] = table[key].color;
      return acc;
    }, {});

    this.addColorsToColorTable(colorHash);
    this.addValuesToOpacityTable(alphaHash);
  }

  addColorsToColorTable(colorsHash: { [key: string]: string | number[] }) {
    Object.keys(colorsHash).forEach((key) => {
      const current = colorsHash[key];
      const color = Array.isArray(current)
        ? new THREE.Color(`rgb(${current[0]}, ${current[1]}, ${current[2]})`)
        : new THREE.Color(current);
      this.colorTable[key] = color;
    });
  }

  addValuesToOpacityTable(opacityHash: { [key: string]: number}) {
    this.opacityTable = Object.assign({}, this.opacityTable, opacityHash);
    Object.keys(opacityHash).forEach((key) => {
      this.opacityTable[key] = 1 - opacityHash[key];
    });
  }

  // attempts to color all objects in the scene by a string property
  // uses colorHasher to get a hex color out of a string
  colorByStringProperty({ propertyName, propagateLegend }) {
    if (propagateLegend === null || propagateLegend === undefined) {
      propagateLegend = true;
    }
    const toReset = [];
    let foundCount = 0;

    this.isSettingColors = true;
    // TODO: chunkify this loop yo
    this.processLargeArray(
      this.scene.children,
      (obj, index) => {
        if (
          !(
            obj.userData &&
            obj.userData.properties &&
            obj.userData.properties[propertyName]
          )
        ) {
          toReset.push(obj);
          return;
        }
        const value = obj.userData.properties[propertyName];
        let color = null;
        if (!this.colorTable.hasOwnProperty(value.toString())) {
          if (value.toString() === 'no material') {
            this.colorTable[value.toString()] = new THREE.Color('#B3B3B3');
          } else {
            this.colorTable[value.toString()] = new THREE.Color(
              this.colorHasher.hex(value.toString())
            );
          }
        }
        color = this.colorTable[value.toString()];

        if (!obj.userData.selected) {
          obj.material._oldColor = obj.material.color;
          obj.material.color.copy(color);
        } else {
          obj.material.__preSelectColor.copy(color);
        }

        foundCount++;
        if (index === this.scene.children.length - 1) {
          this.isSettingColors = false;
          if (propagateLegend) {
            this.emit('analysis-legend', {
              propertyName,
              isNumeric: false,
              objectCount: foundCount,
            });
          }
        }
      },
      5000
    );

    const defaultColor = new THREE.Color('#B3B3B3');
    toReset.forEach((obj) => {
      if (obj.material) {
        obj.material.color.copy(defaultColor);
      }
    });
  }

  // extended version of colorByStringProperty that also supports opacity
  applyColorAndOpacityByStringProperty(propertyName) {
    const toReset = [];
    let foundCount = 0;

    this.isSettingColors = true;
    // TODO: chunkify this loop yo
    this.processLargeArray(
      this.scene.children,
      (obj, index) => {
        if (obj.material) {
          this.setMaterialOverrides(obj);
        }

        if (
          !(
            obj.userData &&
            obj.userData.properties &&
            obj.userData.properties[propertyName]
          )
        ) {
          toReset.push(obj);
          return;
        }
        const value = obj.userData.properties[propertyName] + '';

        if (!this.colorTable.hasOwnProperty(value)) {
          if (value === 'no material') {
            this.colorTable[value] = new THREE.Color('#B3B3B3');
          } else {
            this.colorTable[value] = this.colorTable['all else'] || new THREE.Color(
              this.colorHasher.hex(value)
            );
          }
        }
        const color = this.colorTable[value];
        const opacity = this.opacityTable[value];

        if (!obj.userData.selected) {
          obj.material._oldColor = obj.material.color;
          obj.material.color.copy(color);
          obj.material.opacity = opacity;
        } else {
          obj.material.__preSelectColor.copy(color);
        }

        foundCount++;
        if (index === this.scene.children.length - 1) {
          this.isSettingColors = false;
        }
      },
      5000
    );

    const defaultColor = this.colorTable['all else'] || new THREE.Color('#B3B3B3');

    toReset.forEach((obj) => {
      if (obj.material) {
        obj.material.color.copy(defaultColor);
        if (this.opacityTable['all else'] >= 0) {
          obj.material.opacity = this.opacityTable['all else'];
        }
      }
    });
  }

  colorByVertexArray({ propertyName, colors }) {
    let globalMin = Number.MAX_VALUE,
      globalMax = -Number.MIN_VALUE,
      toReset = [],
      toColour = [];

    for (let obj of this.scene.children) {
      if (
        !(
          obj.userData &&
          obj.userData.properties &&
          obj.userData.properties[`structural.result.${propertyName}`]
        )
      ) {
        toReset.push(obj);
        continue;
      }
      const min = Math.min(
        ...obj.userData.properties[`structural.result.${propertyName}`]
      );
      const max = Math.max(
        ...obj.userData.properties[`structural.result.${propertyName}`]
      );
      if (min < globalMin) globalMin = min;
      if (max > globalMax) globalMax = max;
      toColour.push(obj);
    }

    console.log(
      `👨‍🎨 ::: prop: ${propertyName} ::: min: ${globalMin}; max: ${globalMax}; objs: ${toColour.length}`
    );

    const rainbow = new Rainbow();
    rainbow.setNumberRange(globalMin, globalMax);
    rainbow.setSpectrum(...colors);

    for (const obj of toColour) {
      const colors = new Uint8Array(
        obj.userData.properties[`structural.result.${propertyName}`].length * 3
      );
      let k = 0;

      for (const val of obj.userData.properties[
        `structural.result.${propertyName}`
      ]) {
        const myColour = hexToRgb(rainbow.colourAt(val));
        colors[k++] = myColour.r;
        colors[k++] = myColour.g;
        colors[k++] = myColour.b;
      }
      obj.geometry.addAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3, true)
      );
      obj.geometry.attributes.color.needsUpdate = true;
      obj.geometry.colorsNeedUpdate = true;
      obj.material.vertexColors = THREE.VertexColors;
      this.setMaterialOverrides(obj);
    }
    this.emit('analysis-legend', {
      propertyName,
      isNumeric: false,
      min: globalMin,
      max: globalMax,
      objectCount: toColour.length,
    });
  }

  resetColors({ propagateLegend }) {
    if (propagateLegend === null || propagateLegend === undefined) {
      propagateLegend = true;
    }

    const defaultColor = new THREE.Color('#B3B3B3');

    for (const obj of this.scene.children) {
      if (obj.material) {
        this.setMaterialOverrides(obj);
        obj.material.vertexColors = THREE.NoColors;
        obj.material.needsUpdate = true;
      }
      if (obj.material) {
        obj.material.color.copy(defaultColor);
      }
      continue;
      // commented to explicitly see that this block is never executed due previous continue instruction
      // if ( !obj.material ) continue
      // if ( !( obj.material._oldColor ) ) {
      //   obj.material.color.copy( defaultColor )
      //   continue
      // }

      // obj.material.color.copy( obj.material._oldColor )
    }
    this.currentColorByProp = null;
    if (propagateLegend) {
      this.emit('clear-analysis-legend');
    }
  }

  // TODO
  ghostObjects(objIds) {}
  unGhostObjects(objIds) {}

  // TODO
  showObjects(objIds) {
    if (objIds.length !== 0) {
      this.scene.traverse((obj) => {
        if (objIds.indexOf(obj.userData._id) !== -1) {
          if (obj.name !== null) {
            if (obj.name === 'displayEdgesGroup') { return; }
          }
          obj.visible = true;
        }
      });
    }
    else {
      this.scene.traverse((obj) => {
        if (obj.name !== null) {
          if (obj.name === 'displayEdgesGroup') { return; }
        }
        obj.visible = true;
      });
    }
  }

  hideObjects(objIds) {
    if (objIds.length !== 0) {
      this.scene.traverse((obj) => {
        if (objIds.indexOf(obj.userData._id) !== -1) { obj.visible = false; }
      });
    }
    else {
      this.scene.traverse((obj) => (obj.visible = false));
    }
  }
  // leaves only the provided objIds visible
  isolateObjects(objIds) {
    this.scene.children.forEach((obj) => {
      if (!obj.userData._id) { return; }
      if (objIds.includes(obj.userData._id)) {
        obj.visible = true;
      } else {
        obj.visible = false;
      }
    });
  }

  highlightObjects(objIds) {
    return; // TODO: performance sucks for large object groups
    if (this.isSettingColors) return;
    this.highlightedObjects = objIds;
    let objs = this.scene.children.filter((o) =>
      objIds.includes(o.userData._id)
    );
    objs.forEach((obj) => {
      obj.userData.hovered = true;
      obj.material.__preHoverColor = obj.material.color.clone();
      obj.material.color.copy(this.hoverColor);
    });
  }
  unHighlightObjects(objIds?) {
    return; // TODO: performance sucks for large object groups
    if (!objIds) objIds = this.highlightedObjects;

    let objs = this.scene.children.filter((o) =>
      objIds.includes(o.userData._id)
    );
    objs.forEach((obj) => {
      obj.material.color.copy(obj.material.__preHoverColor);
      obj.userData.hovered = false;
      obj = null;
    });
    this.highlightedObjects = [];
  }

  zoomToObject(obj) {
    if (typeof obj === 'string') {
      obj = this.scene.children.find((o) => o.userData._id === obj);
    }
    if (!obj) { return; }
    const bsphere = obj.geometry.boundingSphere;
    if (bsphere.radius < 1) bsphere.radius = 2;
    // let r = bsphere.radius

    const offset =
      bsphere.radius /
      Math.tan((Math.PI / 180.0) * this.controls.object.fov * 0.5);
    const vector = new THREE.Vector3(0, 0, 1);
    const dir = vector.applyQuaternion(this.controls.object.quaternion);
    const newPos = new THREE.Vector3();
    dir.multiplyScalar(offset * 1.5);
    newPos.addVectors(bsphere.center, dir);
    this.setCamera(
      {
        position: [newPos.x, newPos.y, newPos.z],
        rotation: [
          this.camera.rotation.x,
          this.camera.rotation.y,
          this.camera.rotation.z,
        ],
        target: [bsphere.center.x, bsphere.center.y, bsphere.center.z],
      },
      600
    );
  }

  zoomExtents(offsetMultiplier = 1.25) {
    this.computeSceneBoundingSphere();
    const offset =
      this.sceneBoundingSphere.radius /
      Math.tan((Math.PI / 180.0) * this.controls.object.fov * 0.5);
    const vector = new THREE.Vector3(0, 0, 1);
    const dir = vector.applyQuaternion(this.controls.object.quaternion);
    const newPos = new THREE.Vector3();
    dir.multiplyScalar(offset * offsetMultiplier);
    newPos.addVectors(this.sceneBoundingSphere.center, dir);
    this.setCamera(
      {
        position: [newPos.x, newPos.y, newPos.z],
        rotation: [
          this.camera.rotation.x,
          this.camera.rotation.y,
          this.camera.rotation.z,
        ],
        target: [
          this.sceneBoundingSphere.center.x,
          this.sceneBoundingSphere.center.y,
          this.sceneBoundingSphere.center.z,
        ],
      },
      450
    );
  }

  zoom(factor) {
    if (this.camera.zoom) {
      const targetZoom = this.camera.zoom + factor;
      this.camera.zoom = targetZoom > 0.3 ? targetZoom : this.camera.zoom;
    }
  }

  computeSceneBoundingSphere() {
    let center = null,
      radius = 0,
      k = 0;

    for (const obj of this.scene.children) {
      if (!obj.userData._id) { continue; }
      if (!obj.geometry) { continue; }

      if (k === 0) {
        center = new THREE.Vector3(
          obj.geometry.boundingSphere.center.x,
          obj.geometry.boundingSphere.center.y,
          obj.geometry.boundingSphere.center.z
        );
        radius = obj.geometry.boundingSphere.radius;
        k++;
        continue;
      }

      const otherDist =
        obj.geometry.boundingSphere.radius +
        center.distanceTo(obj.geometry.boundingSphere.center);
      if (radius < otherDist) { radius = otherDist; }

      center.x += obj.geometry.boundingSphere.center.x;
      center.y += obj.geometry.boundingSphere.center.y;
      center.z += obj.geometry.boundingSphere.center.z;
      center.divideScalar(2);

      k++;
    }

    if (!center) {
      center = new THREE.Vector3(0, 0, 0);
    }

    this.sceneBoundingSphere = {
      center: center ? center : new THREE.Vector3(),
      radius: radius > 1 ? radius * 1.1 : 100,
    };
  }

  setFar() {
    const camDistance = this.camera.position.distanceTo(
      this.sceneBoundingSphere.center
    );
    this.camera.far = 3 * this.sceneBoundingSphere.radius + camDistance * 3; // 3 is lucky
    this.camera.updateProjectionMatrix();
  }

  setCamera(where, time) {
    const self = this;
    const duration = time
      ? this.rendererSettings.instantPositioning
        ? 1
        : time
      : 350;
    // position
    new TWEEN.Tween(self.camera.position)
      .to(
        { x: where.position[0], y: where.position[1], z: where.position[2] },
        duration
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
    // rotation
    new TWEEN.Tween(self.camera.rotation)
      .to(
        { x: where.rotation[0], y: where.rotation[1], z: where.rotation[2] },
        duration
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
    // controls center
    new TWEEN.Tween(self.controls.target)
      .to(
        { x: where.target[0], y: where.target[1], z: where.target[2] },
        duration
      )
      .onUpdate(() => {
        self.controls.update();
        if (this.x === where.target[0]) { console.log('camera finished stuff'); }
      })
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  }

  //Generic helpers
  processLargeArray(array, fn, chunk?, context?) {
    context = context || window;
    chunk = chunk || 500; // 100 elems at a time
    let index = 0;

    function doChunk() {
      let count = chunk;
      while (count-- && index < array.length) {
        fn.call(context, array[index], index, array);
        ++index;
      }
      if (index < array.length) { setTimeout(doChunk, 1); }
    }
    doChunk();
  }

  processLargeArrayAsync(array, fn, maxTimePerChunk, context) {
    context = context || window;
    maxTimePerChunk = maxTimePerChunk || 200;
    let index = 0;

    function doChunk() {
      const startTime = Date.now();
      while (
        index < array.length &&
        Date.now() - startTime <= maxTimePerChunk
      ) {
        // callback called with args (value, index, array)
        fn.call(context, array[index], index, array);
        ++index;
      }
      if (index < array.length) { setTimeout(doChunk, 1); }
    }
    doChunk();
  }

  updateViewerSettings() {
    this.setDefaultMeshMaterial();
    this.updateMaterialManager();
    this.shadowLight.visible = this.viewerSettings.castShadows;
    this.edgesGroup.visible = this.viewerSettings.showEdges;
    if (this.edgesThreshold != this.viewerSettings.edgesThreshold) {
      this.updateEdges();
    }
    this.edgesThreshold = this.viewerSettings.edgesThreshold;
  }

  setDefaultMeshMaterial() {
    for (const obj of this.scene.children) {
      if (obj.type === 'Mesh') {
        if (obj.material) {
          this.setMaterialOverrides(obj);
        }
      }
    }
  }

  setMaterialOverrides(obj) {
    obj.material.opacity = this.viewerSettings.meshOverrides.opacity / 100;
    const specColor = new THREE.Color();
    specColor.setHSL(0, 0, this.viewerSettings.meshOverrides.specular / 100);
    obj.material.specular = specColor;
    obj.material.needsUpdate = true;
  }

  updateMaterialManager() {
    const specColor = new THREE.Color();
    specColor.setHSL(0, 0, this.viewerSettings.meshOverrides.specular / 100);
    Converter.materialManager.defaultMeshMat.specular = specColor;
    Converter.materialManager.defaultMeshMat.opacity =
      this.viewerSettings.meshOverrides.opacity / 100;
  }

  setCameraByDescriptor(descriptor, delay = 600) {
    const { position, rotation, target } = descriptor;

    this.setCamera(
      {
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        target: [target.x, target.y, target.z],
      },
      delay
    );
  }

  async processImageQueue() {
    this.imageQueueProcessingInProgress = true;

    const current = this.imageQueue.shift();
    const { dataObjects, delay, resolve, size, pipeline } = current;

    this.processPipeline(pipeline);

    const data = await this.getViewAsImageData(delay);
    resolve(data);

    if (this.rendererSettings.imageQueueMode && !this.imageQueue.length) {
      this.imageQueueProcessingInProgress = false;
      singletonsStore.delete(size);
      return this.destroy();
    }

    this.unloadObjects({ objIds: dataObjects.map((obj) => obj.properties.id) });
    this.processImageQueue();
  }

  destroy() {
    if (
      this.rendererSettings.imageQueueMode &&
      this.imageQueueProcessingInProgress
    ) {
      return;
    }

    window.removeEventListener('resize', this.resizeCanvas, false);
    this.controls.removeEventListener('change', this.controlsListener);

    if (this.rendererSettings.selectable) {
      this.renderer.domElement.removeEventListener('mousemove', this.onTouchMove);
      this.renderer.domElement.removeEventListener('touchmove', this.onTouchMove);

      this.renderer.domElement.removeEventListener('mousedown', this.mouseDown);
      this.renderer.domElement.removeEventListener('mouseup', this.mouseUp);

      this.domObject.removeEventListener('mouseover', this.enableEvents);
      this.domObject.removeEventListener('mouseout', this.disableEvents);

      window.removeEventListener('keydown', this.keydown);
      window.removeEventListener('keyup', this.keyup);
    }
    this.renderer.dispose();
    this.controls.dispose();
    // using try - catch to prevent error on subsequent method calls
    try {
      this.domObject.removeChild(this.renderer.domElement);
    } catch (e) {
      console.log(e);
    }
  }
}

// Helper
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
