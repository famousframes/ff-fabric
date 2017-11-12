import { Component, OnInit } from '@angular/core';
import { ColorPickerService } from 'ngx-color-picker';

import 'fabric';
declare const fabric: any;


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent implements OnInit {

  private canvas: any;
  public projectName: string = 'Neues Design';

  private Direction: any = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3
  };
  private DirectionSteps: any = {
    REGULAR: 10,
    SHIFT: 50
  };

  private props: any = {
    canvasFill: '#ffffff',
    canvasImage: '',
    id: null,
    opacity: null,
    fill: null,
    stroke: null,
    strokeWidth: null,
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: '',
    scale: 1,
    angle: 0
  };
  public elementTypes: any = {
    'image': {key: 'image', text: 'Bild', icon: 'fa-image'},
    'i-text': {key: 'i-text', text: 'Text', icon: 'fa-font'},
    'rect': {key: 'rect', text: 'Rechteck', icon: 'fa-square'},
    'triangle': {key: 'triangle', text: 'Dreieck', icon: 'fa-square'},
    'circle': {key: 'circle', text: 'Kreis', icon: 'fa-square'},
    'polygon': {key: 'polygon', text: 'Stern', icon: 'fa-square'}
  };
  private textString: string = '';
  public urlName: string = '';
  private url: string = '';
  private size: any = {
    width: 1024,
    height: 768
  };
  private selectedSize: any = null;
  public sizes: any = [
    {width: 640, height: 480},
    {width: 1024, height: 768},
    {width: 1920, height: 1080}
  ];

  private json: any;
  private globalEditor: boolean = false;
  private textEditor: boolean = false;
  private imageEditor: boolean = false;
  private shapeEditor: boolean = false;
  private selected: any;

  private layers: any = [];

  constructor(private cpService: ColorPickerService) {
  }

  /**
   *
   */
  ngOnInit() {
    // setup canvas
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
      preserveObjectStacking: true
    });

    // register keyboard events
    fabric.util.addListener(document.body, 'keydown', (opt) => {
      // do not invoke keyboard events on input fields
      if(opt.target.tagName === 'INPUT') return;
      // if(opt.repeat) return; // prevent repeating (keyhold)

      let key = opt.which || opt.keyCode;

      this.handleKeyPress(key, opt);
    });

    // register fabric.js events
    this.canvas.on({
      'object:moving': (e) => {
      },
      'object:modified': (e) => {
      },
      'object:selected': (e) => {

        let selectedObject = e.target;
        this.selected = selectedObject;
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;
        selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';

        this.resetPanels();

        if (selectedObject.type !== 'group' && selectedObject) {

          this.getId();
          this.getOpacity();
          this.getAngle();
          this.getScale();
          this.getTitle();

          switch (selectedObject.type) {
            case 'polygon':
            case 'rect':
            case 'circle':
            case 'triangle':
              this.shapeEditor = true;
              this.getFill();
              this.getStroke();
              this.getStrokeWidth();
              break;
            case 'i-text':
              this.textEditor = true;
              this.getLineHeight();
              this.getCharSpacing();
              this.getBold();
              this.getFontStyle();
              this.getFontSize();
              this.getFill();
              this.getStroke();
              this.getStrokeWidth();
              this.getTextDecoration();
              this.getTextAlign();
              this.getFontFamily();
              break;
            case 'image':
              break;
          }
        }
      },
      'selection:cleared': (e) => {
        this.selected = null;
        this.resetPanels();
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // get references to the html canvas element & its context
    // this.canvas.on('mouse:down', (e) => {
    // let canvasElement: any = document.getElementById('canvas');
    // console.log(canvasElement)
    // });

  }

  handleKeyPress(key, event) {
    // console.info(key);

    switch(key) {
      case 37: this.moveSelectedObject(this.Direction.LEFT); event.preventDefault(); break;
      case 38: this.moveSelectedObject(this.Direction.UP); event.preventDefault(); break;
      case 39: this.moveSelectedObject(this.Direction.RIGHT); event.preventDefault(); break;
      case 40: this.moveSelectedObject(this.Direction.DOWN); event.preventDefault(); break;
      case 46: this.removeSelected(); event.preventDefault(); break;
    }

  }

  moveSelectedObject(direction) {
    let activeGroup = this.canvas.getActiveGroup();
    let activeObject = this.canvas.getActiveObject();

    if(activeObject) {
      switch (direction) {
        case this.Direction.LEFT: activeObject.setLeft(activeObject.getLeft() - 10); break;
        case this.Direction.UP: activeObject.setTop(activeObject.getTop() - 10); break;
        case this.Direction.RIGHT: activeObject.setLeft(activeObject.getLeft() + 10); break;
        case this.Direction.DOWN: activeObject.setTop(activeObject.getTop() + 10); break;
      }

      activeObject.setCoords();
      this.canvas.renderAll();
    }
    else if (activeGroup) {
      switch (direction) {
        case this.Direction.LEFT: activeGroup.setLeft(activeGroup.getLeft() - 10); break;
        case this.Direction.UP: activeGroup.setTop(activeGroup.getTop() - 10); break;
        case this.Direction.RIGHT: activeGroup.setLeft(activeGroup.getLeft() + 10); break;
        case this.Direction.DOWN: activeGroup.setTop(activeGroup.getTop() + 10); break;
      }

      activeGroup.setCoords();
      this.canvas.renderAll();
    }
  }

  /**
   * Recalculate layer list for layer panel
   *
   */
  updateLayers() {
    this.layers = this.canvas.getObjects();
  }

  /**
   * Set layer as active one
   * 
   * @param layer
   */
  selectLayer(layer: any) {
    this.canvas.setActiveObject(layer);
  }

  toggleLayer(layer: any) {
    layer.visible = !layer.visible;
  }

  updateLayerSort() {
    this.layers.forEach((layer, ind) => {
      this.canvas.moveTo(layer, ind);
    })
  }

  /*------------------------Block elements------------------------*/

  /**
   * Size - set canvas dimensions
   * 
   * @param event
   */
  changeSize(event: any) {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }

  /**
   * Size - apply preset to canvas
   * 
   * @param event
   */
  changeToPreset(event: any) {
    this.size.width = this.selectedSize.width;
    this.size.height = this.selectedSize.height;
    this.changeSize(event);
  }

  /**
   * Text - add text element
   * 
   */
  addText() {
    let textString = this.textString;
    let text = new fabric.IText(textString, {
      left: 10,
      top: 10,
      fontFamily: 'Arial',
      angle: 0,
      fill: '#000000',
      scaleX: 1,
      scaleY: 1,
      fontWeight: '',
      hasRotatingPoint: true,
      title: textString
    });
    this.extend(text, EditorComponent.randomId());
    this.canvas.add(text);
    this.selectItemAfterAdded(text);
    this.textString = '';

    this.updateLayers();
  }

  /**
   * Image - Add a dom image to canvas
   * 
   * @param event
   */
  getImgPolaroid(event: any) {
    let el = event.target;
    fabric.Image.fromURL(el.src, (image) => {
      image.set({
        left: 10,
        top: 10,
        angle: 0,
        padding: 10,
        cornersize: 10,
        hasRotatingPoint: true,
        title: el.title
      });
      image.scaleToWidth(150);
      image.scaleToHeight(150);
      this.extend(image, EditorComponent.randomId());
      this.canvas.add(image);
      this.selectItemAfterAdded(image);
    });

    this.updateLayers();
  }

  /**
   * Image - Add an external image to canvas
   *
   * @param url
   */
  addImageOnCanvas(url) {
    if (url) {
      fabric.Image.fromURL(url, (image) => {
        image.set({
          left: 10,
          top: 10,
          angle: 0,
          padding: 10,
          cornersize: 10,
          hasRotatingPoint: true,
          title: this.urlName
        });
        image.scaleToWidth(Math.round(this.size.width / 2));
        this.extend(image, EditorComponent.randomId());
        this.canvas.add(image);
        this.selectItemAfterAdded(image);
      });

      this.updateLayers();
    }
  }

  /**
   * Image - Read image data
   *
   * @param event
   */
  readUrl(event) {
    if (event.target.files && event.target.files[0]) {
      console.info(event.target.files[0]);
      this.urlName = event.target.files[0].name;
      let reader = new FileReader();
      reader.onload = (event) => {
        this.url = event.target['result'];
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  /**
   * Image - Clears custom user image selection/file handler
   *
   * @param url
   */
  removeWhite(url) {
    this.url = '';
  };


  /**
   * Shape - Add custom shape
   *
   * @param shape - can be rectangle, square, triangle, circle, star
   */
  addShape(shape) {
    let add: any;
    switch (shape) {
      case 'rectangle':
        add = new fabric.Rect({
          width: 200, height: 100, left: 10, top: 10, angle: 0,
          fill: '#3f51b5',
          title: 'Rechteck'
        });
        break;
      case 'square':
        add = new fabric.Rect({
          width: 100, height: 100, left: 10, top: 10, angle: 0,
          fill: '#4caf50',
          title: 'Rechteck'
        });
        break;
      case 'triangle':
        add = new fabric.Triangle({
          width: 100, height: 100, left: 10, top: 10, fill: '#2196f3', title: 'Dreieck'
        });
        break;
      case 'circle':
        add = new fabric.Circle({
          radius: 50, left: 10, top: 10, fill: '#ff5722', title: 'Kreis'
        });
        break;
      case 'star':
        add = new fabric.Polygon([
          {x: 350, y: 75},
          {x: 380, y: 160},
          {x: 470, y: 160},
          {x: 400, y: 215},
          {x: 423, y: 301},
          {x: 350, y: 250},
          {x: 277, y: 301},
          {x: 303, y: 215},
          {x: 231, y: 161},
          {x: 321, y: 161},], {
          top: 10,
          left: 10,
          fill: '#ff5722',
          stroke: '#ff5722',
          strokeWidth: 2,
          title: 'Stern'
        });
        break;
    }
    this.extend(add, EditorComponent.randomId());
    this.canvas.add(add);
    this.selectItemAfterAdded(add);

    this.updateLayers();
  }


  // CANVAS ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Canvas - clear current selection
   */
  cleanSelect() {
    this.canvas.deactivateAllWithDispatch().renderAll();
    this.updateLayers();
  }

  /**
   * Canvas - select item
   *
   * @param obj
   */
  selectItemAfterAdded(obj) {
    this.canvas.deactivateAllWithDispatch().renderAll();
    this.canvas.setActiveObject(obj);
  }

  /**
   * Canvas - update background color
   *
   */
  setCanvasFill() {
    if (!this.props.canvasImage) {
      this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.renderAll();
    }
  }

  /**
   * Helper
   *
   * @param obj
   * @param id
   */
  extend(obj, id) {
    obj.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: id
        });
      };
    })(obj.toObject);
  }

  /**
   * Canvas - update background image
   *
   */
  setCanvasImage() {
    let self = this;
    if (this.props.canvasImage) {
      this.canvas.setBackgroundColor({source: this.props.canvasImage, repeat: 'repeat'}, function () {
        self.canvas.renderAll();
      });
    }

    this.updateLayers();
  }

  /**
   * Helper - Generates a random id, no dupe checks
   *
   * @returns {number}
   */
  static randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }



  // ELEMENTS //////////////////////////////////////////////////////////////////////////////////////////////////////////

  getActiveStyle(styleName, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return '';

    return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
  }


  setActiveStyle(styleName, value, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return;

    if (object.setSelectionStyles && object.isEditing) {
      let style = {};
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    }
    else {
      object.set(styleName, value);
    }

    object.setCoords();
    this.canvas.renderAll();
  }


  getActiveProp(name) {
    let object = this.canvas.getActiveObject();
    if (!object) return '';

    return object[name] || '';
  }

  setActiveProp(name, value) {
    let object = this.canvas.getActiveObject();
    if (!object) return;
    object.set(name, value).setCoords();
    this.canvas.renderAll();
  }

  setActiveScale(value) {
    let object = this.canvas.getActiveObject();
    if (!object) return;
    object.scale(parseFloat(value)).setCoords();
    this.canvas.renderAll();
  }

  /**
   * Clones the currently active object and sets the close as active
   *
   */
  clone() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      let clone;
      switch (activeObject.type) {
        case 'rect':
          clone = new fabric.Rect(activeObject.toObject());
          break;
        case 'circle':
          clone = new fabric.Circle(activeObject.toObject());
          break;
        case 'triangle':
          clone = new fabric.Triangle(activeObject.toObject());
          break;
        case 'polygon':
          clone = new fabric.Polygon(activeObject.toObject());
          break;
        case 'i-text':
          clone = new fabric.IText('', activeObject.toObject());
          break;
        case 'image':
          clone = fabric.util.object.clone(activeObject);
          break;
      }
      if (clone) {
        clone.set({left: 10, top: 10, title: 'Kopie von ' + activeObject.title});
        this.canvas.add(clone);
        this.selectItemAfterAdded(clone);
      }

      this.updateLayers();
    }
  }

  getId() {
    this.props.id = this.canvas.getActiveObject().toObject().id;
  }

  setId() {
    let val = this.props.id;
    let complete = this.canvas.getActiveObject().toObject();
    console.log(complete);
    this.canvas.getActiveObject().toObject = () => {
      complete.id = val;
      return complete;
    };
  }

  getTitle() {
    this.props.title = this.getActiveProp('title');
  }

  setTitle() {
    this.setActiveProp('title', this.props.title);
  }

  getOpacity() {
    this.props.opacity = this.getActiveStyle('opacity', null) * 100;
  }

  setOpacity() {
    this.setActiveStyle('opacity', parseInt(this.props.opacity) / 100, null);
  }

  getFill() {
    this.props.fill = this.getActiveStyle('fill', null);
  }

  setFill() {
    this.setActiveStyle('fill', this.props.fill, null);
  }

  getStroke() {
    this.props.stroke = this.getActiveStyle('stroke', null);
  }

  setStroke() {
    this.setActiveStyle('stroke', this.props.stroke, null);
  }

  getStrokeWidth() {
    this.props.strokeWidth = this.getActiveStyle('strokeWidth', null);
  }

  setStrokeWidth() {
    this.setActiveStyle('strokeWidth', this.props.strokeWidth, null);
  }

  getLineHeight() {
    this.props.lineHeight = this.getActiveStyle('lineHeight', null);
  }

  setLineHeight() {
    this.setActiveStyle('lineHeight', parseFloat(this.props.lineHeight), null);
  }

  getCharSpacing() {
    this.props.charSpacing = this.getActiveStyle('charSpacing', null);
  }

  setCharSpacing() {
    this.setActiveStyle('charSpacing', this.props.charSpacing, null);
  }

  getFontSize() {
    this.props.fontSize = this.getActiveStyle('fontSize', null);
  }

  setFontSize() {
    this.setActiveStyle('fontSize', parseInt(this.props.fontSize), null);
  }

  getBold() {
    this.props.fontWeight = this.getActiveStyle('fontWeight', null);
  }

  setBold() {
    this.props.fontWeight = !this.props.fontWeight;
    this.setActiveStyle('fontWeight', this.props.fontWeight ? 'bold' : '', null);
  }

  getFontStyle() {
    this.props.fontStyle = this.getActiveStyle('fontStyle', null);
  }

  setFontStyle() {
    this.props.fontStyle = !this.props.fontStyle;
    this.setActiveStyle('fontStyle', this.props.fontStyle ? 'italic' : '', null);
  }


  getTextDecoration() {
    this.props.TextDecoration = this.getActiveStyle('textDecoration', null);
  }

  setTextDecoration(value) {
    let iclass = this.props.TextDecoration;
    if (iclass.includes(value)) {
      iclass = iclass.replace(RegExp(value, "g"), "");
    } else {
      iclass += ` ${value}`
    }
    this.props.TextDecoration = iclass;
    this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
  }

  hasTextDecoration(value) {
    return this.props.TextDecoration.includes(value);
  }


  getTextAlign() {
    this.props.textAlign = this.getActiveProp('textAlign');
  }

  setTextAlign(value) {
    this.props.textAlign = value;
    this.setActiveProp('textAlign', this.props.textAlign);
  }

  getFontFamily() {
    this.props.fontFamily = this.getActiveProp('fontFamily');
  }

  setFontFamily() {
    this.setActiveProp('fontFamily', this.props.fontFamily);
  }

  getAngle() {
    this.props.angle = this.getActiveProp('angle') === '' ? 0 : this.getActiveProp('angle');
  }

  setAngle() {
    this.setActiveProp('angle', parseInt(this.props.angle));
  }

  getScale() {
    this.props.scale = parseFloat(this.getActiveProp('scaleX'));
  }


  // SYSTEM ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Remove currently selected element from canvas
   *
   */
  removeSelected() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      this.canvas.remove(activeObject);
      // this.textString = '';
    }
    else if (activeGroup) {
      let objectsInGroup = activeGroup.getObjects();
      this.canvas.discardActiveGroup();
      let self = this;
      objectsInGroup.forEach(function (object) {
        self.canvas.remove(object);
      });
    }

    this.updateLayers();
  }

  /**
   * Send active object to front
   * TODO: Extend for layer management
   */
  bringToFront() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      activeObject.bringToFront();
      // activeObject.opacity = 1;
    }
    else if (activeGroup) {
      let objectsInGroup = activeGroup.getObjects();
      this.canvas.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.bringToFront();
      });
    }
  }

  /**
   * Send active object to back
   * TODO: Extend for layer management
   */
  sendToBack() {
    let activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveGroup();

    if (activeObject) {
      activeObject.sendToBack();
      // activeObject.opacity = 1;
    }
    else if (activeGroup) {
      let objectsInGroup = activeGroup.getObjects();
      this.canvas.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.sendToBack();
      });
    }
  }

  /**
   * Handle canvas reset/clear
   *
   */
  confirmClear() {
    if (confirm('Alles zurücksetzen?')) {
      this.canvas.clear();
    }
  }

  /**
   * Rasterize PNG
   *
   */
  rasterize() {
    if (!fabric.Canvas.supports('toDataURL')) {
      alert('Ihr Browser unterstützt diese Funktion nicht.');
    }
    else {
      // chrome workaround: https://stackoverflow.com/a/45700813
      let _w = window.open();
      _w.document.write('<iframe src="' + this.canvas.toDataURL('png') + '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>');
    }
  }

  /**
   * Rasterize SVG
   *
   */
  rasterizeSVG() {
    // chrome workaround: https://stackoverflow.com/a/45700813
    let _w = window.open();
    _w.document.write('<iframe src="data:image/svg+xml;utf8,' + encodeURIComponent(this.canvas.toSVG()) + '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>');
  };


  /**
   * Stringify canvas objects and save in localStorage
   *
   */
  saveCanvasToJSON() {
    let json = JSON.stringify(this.canvas);
    localStorage.setItem('ffFabricQuicksave', json);
  }

  /**
   * Load canvas from JSON data
   *
   */
  loadCanvasFromJSON() {
    let CANVAS = localStorage.getItem('ffFabricQuicksave');

    // and load everything from the same json
    this.canvas.loadFromJSON(CANVAS, () => {

      // making sure to render canvas at the end
      this.canvas.renderAll();

      // TODO: Retrieve additional data and bind accordingly
      console.log(this.canvas);
    });

  };

  /**
   * Stringify canvas objects
   *
   */
  rasterizeJSON() {
    this.json = JSON.stringify(this.canvas, null, 2);
  }

  /**
   * Reset panel visibility
   *
   */
  resetPanels() {
    this.textEditor = false;
    this.imageEditor = false;
    this.shapeEditor = false;
  }

}
