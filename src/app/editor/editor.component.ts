import {Component, OnInit} from '@angular/core';
import {ColorPickerService} from 'ngx-color-picker';
import {Font} from 'ngx-font-picker';

import 'fabric';

declare const fabric: any;


@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})

export class EditorComponent implements OnInit {

    private canvas: any;
    public projectName = 'Neues Design';

    private Direction: any = {
        LEFT: 0,
        UP: 1,
        RIGHT: 2,
        DOWN: 3
    };
    private DirectionSteps: any = {
        REGULAR: 1,
        SHIFT: 5
    };
    private dragObject: any;

    public presetFonts = ['Arial', 'Serif', 'Helvetica', 'Sans-Serif', 'Open Sans', 'Roboto Slab'];
    private lastInputSelected: any;

    public customColors: any = [];

    public selectedLibrary = 'brands';
    public palettes: any = {
        selected: null,
        defaults: [
            {key: '#001f3f', value: 'Navy', type: 'default'},
            {key: '#0074D9', value: 'Blue', type: 'default'},
            {key: '#7FDBFF', value: 'Aqua', type: 'default'},
            {key: '#39CCCC', value: 'Teal', type: 'default'},
            {key: '#3D9970', value: 'Olive', type: 'default'},
            {key: '#2ECC40', value: 'Green', type: 'default'},
            {key: '#01FF70', value: 'Lime', type: 'default'},
            {key: '#FFDC00', value: 'Yellow', type: 'default'},
            {key: '#FF851B', value: 'Orange', type: 'default'},
            {key: '#FF4136', value: 'Red', type: 'default'},
            {key: '#85144b', value: 'Maroon', type: 'default'},
            {key: '#F012BE', value: 'Fuchsia', type: 'default'},
            {key: '#B10DC9', value: 'Purple', type: 'default'},
            {key: '#111111', value: 'Black', type: 'default'},
            {key: '#AAAAAA', value: 'Gray', type: 'default'},
            {key: '#DDDDDD', value: 'Silver', type: 'default'}
        ],
        custom: []
    };

    public library: any = {
        brands: [
            {name: 'Audi', src: 'assets/libraries/brands/audi-sd.png'},
            {name: 'BMW', src: 'assets/libraries/brands/bmw-sd.png'},
            {name: 'Citroen', src: 'assets/libraries/brands/citroen-sd.png'},
            {name: 'Fiat', src: 'assets/libraries/brands/fiat-sd.png'},
            {name: 'Ford', src: 'assets/libraries/brands/ford-sd.png'},
            {name: 'General Motors', src: 'assets/libraries/brands/generalmotors-sd.png'},
            {name: 'Honda', src: 'assets/libraries/brands/honda-sd.png'},
            {name: 'Hyundai', src: 'assets/libraries/brands/hyundai-sd.png'},
            {name: 'Infiniti', src: 'assets/libraries/brands/infiniti-sd.png'},
            {name: 'Kia', src: 'assets/libraries/brands/kia-sd.png'},
            {name: 'Lexus', src: 'assets/libraries/brands/lexus-sd.png'},
            {name: 'Mazda', src: 'assets/libraries/brands/mazda-sd.png'},
            {name: 'Mercedes-Benz', src: 'assets/libraries/brands/mercedesbenz-sd.png'},
            {name: 'Mini', src: 'assets/libraries/brands/mini-sd.png'},
            {name: 'Nissan', src: 'assets/libraries/brands/nissan-sd.png'},
            {name: 'Peugeot', src: 'assets/libraries/brands/peugeot-sd.png'},
            {name: 'Porsche', src: 'assets/libraries/brands/porsche-sd.png'},
            {name: 'Renault', src: 'assets/libraries/brands/renault-sd.png'},
            {name: 'Seat', src: 'assets/libraries/brands/seat-sd.png'},
            {name: 'Skoda', src: 'assets/libraries/brands/skoda-sd.png'},
            {name: 'Tesla', src: 'assets/libraries/brands/tesla-sd.png'},
            {name: 'Toyota', src: 'assets/libraries/brands/toyota-sd.png'},
            {name: 'Volkswagen', src: 'assets/libraries/brands/volkswagen-sd.png'},
            {name: 'Volvo', src: 'assets/libraries/brands/volvo-sd.png'}
        ]
    };

    public font: Font = new Font({
        family: 'Roboto',
        size: '14px',
        style: 'regular',
        styles: ['regular']
    });

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
        fontFamily: 'Open Sans',
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
    private textString = '';
    public urlName = '';
    private url = '';
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

    public sliderConfig: any = {
        pips: {
            mode: 'range',
            density: 5
        }
    };

    private json: any;
    private globalEditor = false;
    private textEditor = false;
    private imageEditor = false;
    private shapeEditor = false;
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

        this.loadPalette();

        // register keyboard events
        fabric.util.addListener(document.body, 'keydown', (opt) => {
            // do not invoke keyboard events on input fields
            if (opt.target.tagName === 'INPUT') {
                return;
            }
            // if(opt.repeat) return; // prevent repeating (keyhold)

            const key = opt.which || opt.keyCode;

            this.handleKeyPress(key, opt);
        });

        // register fabric.js events
        this.canvas.on({
            'object:moving': (e) => {
            },
            'object:modified': (e) => {
            },
            'object:selected': (e) => {

                const selectedObject = e.target;
                this.selected = selectedObject;
                selectedObject.hasRotatingPoint = true;
                selectedObject.transparentCorners = false;
                selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';

                this.resetPanels();

                if (selectedObject.type !== 'group' && selectedObject) {

                    this.getId();
                    this.getOpacity();
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

    /**
     * Handles user keyboard input
     *
     * @param key
     * @param event
     */
    handleKeyPress(key, event): void {
        switch (key) {
            case 37:
                this.moveSelectedObject(this.Direction.LEFT, event.shiftKey ? this.DirectionSteps.SHIFT : this.DirectionSteps.REGULAR);
                event.preventDefault();
                break;
            case 38:
                this.moveSelectedObject(this.Direction.UP, event.shiftKey ? this.DirectionSteps.SHIFT : this.DirectionSteps.REGULAR);
                event.preventDefault();
                break;
            case 39:
                this.moveSelectedObject(this.Direction.RIGHT, event.shiftKey ? this.DirectionSteps.SHIFT : this.DirectionSteps.REGULAR);
                event.preventDefault();
                break;
            case 40:
                this.moveSelectedObject(this.Direction.DOWN, event.shiftKey ? this.DirectionSteps.SHIFT : this.DirectionSteps.REGULAR);
                event.preventDefault();
                break;
            case 46:
                this.removeSelected();
                event.preventDefault();
                break;
            case 65:
                if (event.ctrlKey) {
                    this.selectAllObjects();
                }
                event.preventDefault();
                break;
        }
    }

    /**
     * Select all objects/layers in canvas
     *
     */
    selectAllObjects(): void {
        const objs = this.canvas.getObjects().map(function (o) {
            return o.set('active', true);
        });

        const group = new fabric.Group(objs, {
            originX: 'center',
            originY: 'center'
        });

        this.canvas._activeObject = null;
        this.canvas.setActiveGroup(group.setCoords()).renderAll();
    }

    /**
     * Move the current selected object
     *
     * @param direction
     * @param value
     */
    moveSelectedObject(direction, value): void {
        const activeGroup = this.canvas.getActiveGroup();
        const activeObject = this.canvas.getActiveObject();

        if (activeObject) {
            switch (direction) {
                case this.Direction.LEFT:
                    activeObject.setLeft(activeObject.getLeft() - value);
                    break;
                case this.Direction.UP:
                    activeObject.setTop(activeObject.getTop() - value);
                    break;
                case this.Direction.RIGHT:
                    activeObject.setLeft(activeObject.getLeft() + value);
                    break;
                case this.Direction.DOWN:
                    activeObject.setTop(activeObject.getTop() + value);
                    break;
            }

            activeObject.setCoords();
            this.canvas.renderAll();
        } else if (activeGroup) {
            switch (direction) {
                case this.Direction.LEFT:
                    activeGroup.setLeft(activeGroup.getLeft() - value);
                    break;
                case this.Direction.UP:
                    activeGroup.setTop(activeGroup.getTop() - value);
                    break;
                case this.Direction.RIGHT:
                    activeGroup.setLeft(activeGroup.getLeft() + value);
                    break;
                case this.Direction.DOWN:
                    activeGroup.setTop(activeGroup.getTop() + value);
                    break;
            }

            activeGroup.setCoords();
            this.canvas.renderAll();
        }
    }

    /**
     * Recalculate layer list for layer panel
     *
     */
    updateLayers(): void {
        this.layers = this.canvas.getObjects();
    }

    /**
     * Set layer as active one
     *
     * @param layer
     */
    selectLayer(layer: any): void {
        this.canvas.setActiveObject(layer);
    }

    /**
     * Show/Hide layer
     *
     * @param layer
     */
    toggleLayer(layer: any): void {
        layer.visible = !layer.visible;
    }

    /**
     * Locks/Unlocks layer
     *
     */
    lockLayer(): void {
        const layer = this.canvas.getActiveObject();
        layer.evented = !layer.evented;
        layer.selectable = !layer.selectable;
    }

    /**
     * Updates layer index
     *
     */
    updateLayerSort(): void {
        this.layers.forEach((layer, ind) => {
            this.canvas.moveTo(layer, ind);
        });
    }

    /*------------------------Block elements------------------------*/

    /**
     * Size - set canvas dimensions
     *
     * @param event
     */
    changeSize(event: any): void {
        this.canvas.setWidth(this.size.width);
        this.canvas.setHeight(this.size.height);
    }

    /**
     * Size - apply preset to canvas
     *
     * @param event
     */
    changeToPreset(event: any): void {
        this.size.width = this.selectedSize.width;
        this.size.height = this.selectedSize.height;
        this.changeSize(event);
    }

    /**
     * Text - add text element
     *
     */
    addText(): void {
        const textString = this.textString;
        const text = new fabric.IText(textString, {
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
        this.extend(text, this.randomId());
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
    getImgPolaroid(event: any): void {
        const el = event.target;
        fabric.Image.fromURL(el.src, (image) => {
            image.set({
                left: 10,
                top: 10,
                angle: 0,
                padding: 10,
                cornersize: 10,
                hasRotatingPoint: true,
                title: el.title,
                lockUniScaling: true
            });
            image.scaleToWidth(150);
            image.scaleToHeight(150);
            this.extend(image, this.randomId());
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
    addImageOnCanvas(url): void {
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
                this.extend(image, this.randomId());
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
    readUrl(event): void {
        if (event.target.files && event.target.files[0]) {
            this.urlName = event.target.files[0].name;
            const reader = new FileReader();
            reader.onload = (revent) => {
                this.url = revent.target['result'];
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    /**
     * Image - Clears custom user image selection/file handler
     *
     * @param url
     */
    removeWhite(url): void {
        this.url = '';
    };


    /**
     * Shape - Add custom shape
     *
     * @param shape - can be rectangle, square, triangle, circle, star
     */
    addShape(shape): void {
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
                    {x: 321, y: 161}
                    ], {
                    top: 10,
                    left: 10,
                    fill: '#ff5722',
                    stroke: '#ff5722',
                    strokeWidth: 2,
                    title: 'Stern'
                });
                break;
        }

        this.extend(add, this.randomId());
        this.canvas.add(add);
        this.selectItemAfterAdded(add);
        this.updateLayers();
    }


    // CANVAS ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Canvas - clear current selection
     */
    cleanSelect(): void {
        this.canvas.deactivateAllWithDispatch().renderAll();
        this.updateLayers();
    }

    /**
     * Canvas - select item
     *
     * @param obj
     */
    selectItemAfterAdded(obj): void {
        this.canvas.deactivateAllWithDispatch().renderAll();
        this.canvas.setActiveObject(obj);
    }

    /**
     * Canvas - update background color
     *
     */
    setCanvasFill(): void {
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
    extend(obj, id): void {
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
    setCanvasImage(): void {
        const self = this;
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
    randomId(): number {
        return Math.floor(Math.random() * 999999) + 1;
    }


    // ELEMENTS //////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Returns styleName from object
     *
     * @param styleName
     * @param object
     * @returns {any}
     */
    getActiveStyle(styleName, object): any {
        object = object || this.canvas.getActiveObject();
        if (!object) {
            return '';
        }

        return (object.getSelectionStyles && object.isEditing)
            ? (object.getSelectionStyles()[styleName] || '')
            : (object[styleName] || '');
    }

    /**
     * Sets styleName to given value
     *
     * @param styleName
     * @param value
     * @param object
     */
    setActiveStyle(styleName, value, object): void {
        object = object || this.canvas.getActiveObject();
        if (!object) {
            return;
        }

        if (object.setSelectionStyles && object.isEditing) {
            const style = {};
            style[styleName] = value;
            object.setSelectionStyles(style);
            object.setCoords();
        } else {
            object.set(styleName, value);
        }

        object.setCoords();
        this.canvas.renderAll();
    }

    /**
     * Get property for active object
     *
     * @param name
     * @returns {any}
     */
    getActiveProp(name): any {
        const object = this.canvas.getActiveObject();
        if (!object) {
            return '';
        }
        return object[name] || '';
    }

    /**
     * Set property for active object
     *
     * @param name
     * @param value
     */
    setActiveProp(name, value): void {
        const object = this.canvas.getActiveObject();
        if (!object) {
            return;
        }
        object.set(name, value).setCoords();
        this.canvas.renderAll();
    }

    /**
     * Clones the currently active object and sets the close as active
     *
     */
    clone(): void {
        const activeObject = this.canvas.getActiveObject(),
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


    getId(): void {
        this.props.id = this.canvas.getActiveObject().toObject().id;
    }

    setId(): void {
        const val = this.props.id;
        const complete = this.canvas.getActiveObject().toObject();
        // console.log(complete);
        this.canvas.getActiveObject().toObject = () => {
            complete.id = val;
            return complete;
        };
    }

    getTitle(): void {
        this.props.title = this.getActiveProp('title');
    }

    setTitle(): void {
        this.setActiveProp('title', this.props.title);
    }

    getOpacity(): void {
        this.props.opacity = this.getActiveStyle('opacity', null) * 100;
    }

    setOpacity(): void {
        this.setActiveStyle('opacity', parseInt(this.props.opacity, 10) / 100, null);
    }

    getFill(): void {
        this.props.fill = this.getActiveStyle('fill', null);
    }

    setFill(): void {
        this.setActiveStyle('fill', this.props.fill, null);
    }

    getStroke(): void {
        this.props.stroke = this.getActiveStyle('stroke', null);
    }

    setStroke(): void {
        this.setActiveStyle('stroke', this.props.stroke, null);
    }

    getStrokeWidth(): void {
        this.props.strokeWidth = this.getActiveStyle('strokeWidth', null);
    }

    setStrokeWidth(): void {
        this.setActiveStyle('strokeWidth', this.props.strokeWidth, null);
    }

    getLineHeight(): void {
        this.props.lineHeight = this.getActiveStyle('lineHeight', null);
    }

    setLineHeight(): void {
        this.setActiveStyle('lineHeight', parseFloat(this.props.lineHeight), null);
    }

    getCharSpacing(): void {
        this.props.charSpacing = this.getActiveStyle('charSpacing', null);
    }

    setCharSpacing(): void {
        this.setActiveStyle('charSpacing', this.props.charSpacing, null);
    }

    getFontSize(): void {
        this.props.fontSize = this.getActiveStyle('fontSize', null);
    }

    setFontSize(): void {
        this.setActiveStyle('fontSize', parseInt(this.props.fontSize, 10), null);
    }

    getBold(): void {
        this.props.fontWeight = this.getActiveStyle('fontWeight', null);
    }

    setBold(): void {
        this.props.fontWeight = !this.props.fontWeight;
        this.setActiveStyle('fontWeight', this.props.fontWeight ? 'bold' : '', null);
    }

    getFontStyle(): void {
        this.props.fontStyle = this.getActiveStyle('fontStyle', null);
    }

    setFontStyle(): void {
        this.props.fontStyle = !this.props.fontStyle;
        this.setActiveStyle('fontStyle', this.props.fontStyle ? 'italic' : '', null);
    }

    setWebfont(): void {
        this.props.fontSize = this.font.size;
        this.setActiveStyle('fontSize', parseInt(this.props.fontSize, 10), null);
        this.props.fontFamily = this.font.family;
        this.setActiveProp('fontFamily', this.props.fontFamily);
    }

    getTextDecoration(): void {
        this.props.TextDecoration = this.getActiveStyle('textDecoration', null);
    }

    setTextDecoration(value): void {
        let iclass = this.props.TextDecoration;
        if (iclass.includes(value)) {
            iclass = iclass.replace(RegExp(value, 'g'), '');
        } else {
            iclass += ` ${value}`;
        }
        this.props.TextDecoration = iclass;
        this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
    }

    hasTextDecoration(value): void {
        return this.props.TextDecoration.includes(value);
    }

    getTextAlign(): void {
        this.props.textAlign = this.getActiveProp('textAlign');
    }

    setTextAlign(value): void {
        this.props.textAlign = value;
        this.setActiveProp('textAlign', this.props.textAlign);
    }

    getFontFamily(): void {
        this.props.fontFamily = this.getActiveProp('fontFamily');
    }

    setFontFamily(): void {
        this.setActiveProp('fontFamily', this.props.fontFamily);
    }

    setFillColor(swatch: any): void {
        this.palettes.selected = swatch;
        this.props.fill = swatch.key;
        this.setFill();
    }

    // SYSTEM ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Remove currently selected element from canvas
     *
     */
    removeSelected(): void {
        const activeObject = this.canvas.getActiveObject(),
            activeGroup = this.canvas.getActiveGroup();

        if (activeObject) {
            this.canvas.remove(activeObject);
        } else if (activeGroup) {
            const objectsInGroup = activeGroup.getObjects();
            this.canvas.discardActiveGroup();
            const self = this;
            objectsInGroup.forEach(function (object) {
                self.canvas.remove(object);
            });
        }

        this.updateLayers();
    }

    /**
     * Send active object to front
     *
     */
    bringToFront(): void {
        const activeObject = this.canvas.getActiveObject(),
            activeGroup = this.canvas.getActiveGroup();

        if (activeObject) {
            activeObject.bringToFront();
        } else if (activeGroup) {
            const objectsInGroup = activeGroup.getObjects();
            this.canvas.discardActiveGroup();
            objectsInGroup.forEach((object) => {
                object.bringToFront();
            });
        }
    }

    /**
     * Send active object to back
     *
     */
    sendToBack(): void {
        const activeObject = this.canvas.getActiveObject(),
            activeGroup = this.canvas.getActiveGroup();

        if (activeObject) {
            activeObject.sendToBack();
            // activeObject.opacity = 1;
        } else if (activeGroup) {
            const objectsInGroup = activeGroup.getObjects();
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
    confirmClear(): void {
        if (confirm('Alles zurücksetzen?')) {
            this.canvas.clear();
        }
    }


    handleDragStart(event): boolean {
        this.dragObject = event.target;
        return false;
    }

    handleDragOverCanvas(event): boolean {
        event.stopPropagation();
        return false; // prevenDefault;
    }

    /**
     *
     * @param event
     */
    handleDropOnCanvas(event): boolean {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        const el = this.dragObject;
        fabric.Image.fromURL(el.src, (image) => {
            image.set({
                originX: 'center',
                originY: 'center',
                left: event.layerX,
                top: event.layerY,
                angle: 0,
                padding: 10,
                cornersize: 10,
                hasRotatingPoint: true,
                title: el.title,
                lockUniScaling: true
            });
            image.scaleToWidth(150);
            image.scaleToHeight(150);
            this.extend(image, this.randomId());
            this.canvas.add(image);
            this.selectItemAfterAdded(image);
        });

        this.updateLayers();
        this.dragObject = null;
        return false;
    }

    /**
     * Rasterize PNG
     *
     */
    rasterize(): void {
        if (!fabric.Canvas.supports('toDataURL')) {
            alert('Ihr Browser unterstützt diese Funktion nicht.');
        } else {
            // chrome workaround: https://stackoverflow.com/a/45700813
            const _w = window.open();
            _w.document.write('<iframe src="' + this.canvas.toDataURL('png') +
                '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;"' +
                'allowfullscreen></iframe>');
        }
    }

    /**
     * Rasterize SVG
     *
     */
    rasterizeSVG(): void {
        // chrome workaround: https://stackoverflow.com/a/45700813
        const _w = window.open();
        _w.document.write('<iframe src="data:image/svg+xml;utf8,' + encodeURIComponent(this.canvas.toSVG()) +
            '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;"' +
            ' allowfullscreen></iframe>');
    };


    /**
     * Stringify canvas objects and save in localStorage
     *
     */
    saveCanvasToJSON(): void {
        const json = JSON.stringify(this.canvas);
        localStorage.setItem('ffFabricQuicksave', json);
    }

    /**
     * Load canvas from JSON data
     *
     */
    loadCanvasFromJSON(): void {
        const CANVAS = localStorage.getItem('ffFabricQuicksave');

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
    rasterizeJSON(): void {
        this.json = JSON.stringify(this.canvas, null, 2);
    }

    removeSelectedColorSwatch(): void {
        if (this.palettes.selected.type === undefined) {
            const _id = this.palettes.selected.id;
            this.palettes.custom = this.palettes.custom.filter(function (swatch) {
                return swatch.id !== _id;
            });
            this.savePalette();
        }
    }

    addToCustomPalette(type: string): void {
        switch (type) {
            case 'fill':
                this.palettes.custom.push({
                    key: this.props.fill,
                    value: this.props.fill,
                    id: this.palettes.custom.length
                });
                break;
            case 'stroke':
                this.palettes.custom.push({
                    key: this.props.stroke,
                    value: this.props.stroke,
                    id: this.palettes.custom.length
                });
                break;
        }
        this.savePalette();
    }

    savePalette(): void {
        const json = JSON.stringify(this.palettes.custom);
        localStorage.setItem('ffFabricCP', json);
    }

    loadPalette(): void {
        const palettes = localStorage.getItem('ffFabricCP');
        this.palettes.custom = palettes === null ? [] : JSON.parse(palettes);
    }

    updateColorPresets(presets) {
        // Update
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

    /** HELPERS ***********************/
    componentToHex(c): string {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    rgbToHex(r, g, b): string {
        return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    hexToRgb(hex): any {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

}
