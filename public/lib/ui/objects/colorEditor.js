// renderer and editor for color fields

import { Vector2 } from "../../utils/vector2.js";
import { Event } from "../../utils/event.js";
import { UITextBox } from "../uiTextBox.js";
import { HuePicker } from "./huepicker.js";
import { UIBase } from "../uiBase.js";

export const ColorEditor = (function () {
    return class ColorEditor extends UIBase {
        constructor (options) {
            super({...options});

            this.recentColors = new UIBase({
                size: new Vector2(180, 80)
            });
            this.recentColors.parentTo(this);

            const defaultRecents = [
                '#ff0088', '#00ff88', '#8800ff',
                '#ff8800', '#000000', '#ffffff',
                '#00ffff', '#ff00ff', '#ffff00',
                '#0000ff', '#00ff00', '#ff0000'
            ]

            for (let i = 0; i < defaultRecents.length; i++) {
                this.addRecentColor(defaultRecents[i]);
            }

            const lastIndex = this.recentColors.children.length - 1;
            const lastColor = this.recentColors.children[lastIndex];

            lastColor.borderSize = 2;
            this.activeColor = defaultRecents[lastIndex];

            this.hexTextBox = new UITextBox('hex (xxxxxx)', {
                positionScale: new Vector2(0.5, 1),
                position: new Vector2(0.5, -15.5),
                pivot: new Vector2(0.5, 0),
                size: new Vector2(100, 30),

                maxInputLength: 6,
                fontColor: 'white',

                borderSize: 1,
                borderColor: '#ffffff',

                shadow: true,
                shadowBlur: 5,
            });
            // this.hexTextBox.text = '000000';
            this.hexTextBox.onInput.listen((text, key) => {
                if (text.length === 6) {
                    const hex = `#${text}`;

                    if (!/#[0-9a-fA-F]{6}/.test(hex)) {
                        return;
                    }

                    const [r, g, b] = this.huePicker.hexToRgb(hex);
                    const [h, s, l] = this.huePicker.rgbToHsl(r*255, g*255, b*255);

                    console.log('HSL: ', h, s, l, 'RGB: ', r, g, b, 'HEX: ', hex)
                    const a = this.huePicker.mapRange(1-l, 0.5, 1, 0, 1);
                    // this.huePicker.setBrightness(a);
                    this.huePicker.setBrightness(0);
                    this.setActiveColor(hex);
                }
            
            });
            this.hexTextBox.parentTo(this.recentColors);

            this.previewColor = new UIBase({
                backgroundEnabled: true,
                backgroundColor: '#ff0000',

                positionScale: new Vector2(0, 1),
                position: new Vector2(0, 30),
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 25),

                borderSize: 2,
                borderColor: '#ffffff',

                shadow: true,
                shadowBlur: 5,
            });
            this.previewColor.parentTo(this.recentColors);

            this.primaryColors = [
                '#000000', '#1172CB', '#008279',
                '#027925', '#597E00','#877800',
                '#885A00', '#772800'
            ];
            this.primaryColorContainer = this.createColorList(this.primaryColors);
            this.primaryColorContainer.positionAbsolute = new Vector2(200, 0);
            this.primaryColorContainer.parentTo(this);
            
            this.secondaryColors = [
                '#7F2B19', '#267725', '#104B7E',
                '#996B05', '#4E1360', '#7F751D',
                '#303E45', '#6A0A31'
            ];
            this.secondaryColorContainer = this.createColorList(this.secondaryColors);
            this.secondaryColorContainer.positionAbsolute = new Vector2(340, 0);
            this.secondaryColorContainer.parentTo(this);

            this.huePicker = new HuePicker({
                position: new Vector2(480, 0),
            });
            this.huePicker.hueSelected.listen((color) => {
                this.setActiveColor(color, false);
            });
            this.huePicker.brightnessSlider.brightnessSelected.listen((brightness) => {
                this.setActiveColor(this.activeColor, false);
            });
            this.huePicker.parentTo(this);

            this.onColorSelected = new Event();
        }

        createColorList (colors) {
            const CHOOSER_SIZE = 130;
            const steps = 8;

            const colorContainer = new UIBase({
                size: new Vector2(CHOOSER_SIZE, CHOOSER_SIZE)
            });

            const cellSizeX = Math.floor(CHOOSER_SIZE / steps);
            const cellSizeY = Math.floor(CHOOSER_SIZE / colors.length);

            for (let i = 0; i < colors.length; i++) {
                for (let j = 0; j < steps; j++) {
                    const colorUI = new UIBase({    
                        backgroundenabled: true,    
                        borderSize: 0,
                        borderColor: '#ffffff',
                        playMouseDownSound: false,
            
                        clickable: true,
                        backgroundEnabled: true,
                        backgroundColor: colors[i]
                    });

                    const color = colors[i];

                    let r = parseInt(color.slice(1, 3), 16) ;
                    let g = parseInt(color.slice(3, 5), 16) ;
                    let b = parseInt(color.slice(5, 7), 16) ;

                    // dark -> white
                    const p  = (j) / (steps * 2);
                    r = Math.floor(r + (255 - r) * p);
                    g = Math.floor(g + (255 - g) * p);
                    b = Math.floor(b + (255 - b) * p);
                    
                    const hex = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
                    
                    colorUI.sizeAbsolute = new Vector2(cellSizeX, cellSizeY);
                    colorUI.positionAbsolute = new Vector2(j * cellSizeX, i * cellSizeY);
                    colorUI.backgroundColor = hex;
                    colorUI.setAttribute('color', hex);
                    colorUI.parentTo(colorContainer);

                    colorUI.mouseUp.listen(() => {
                        if (ArtEditor.isModalOpen()) return;
                        this.huePicker.setBrightness(0);
                        this.setActiveColor(hex);
                    });
                }
            }

            return colorContainer
        }

        addRecentColor (color) {
            const existing = this.recentColors.children.find((child) => child.getAttribute('color') === color);
            if (existing) return;

            if (this.recentColors.children.length >= 12) {
                this.recentColors.children[0].unparent();
            }

            const RECENT_COLOR_SIZE = 20;
            const RECENT_COLOR_MARGIN = 10;

            const colorUI = new UIBase({
                size: Vector2.one.scale(RECENT_COLOR_SIZE),
    
                shadow: true,
                shadowBlur: 5,

                borderSize: 0,
                borderColor: '#ffffff',
                playMouseDownSound: false,

                clickable: true,
                backgroundEnabled: true,
                backgroundColor: color
            });
            colorUI.parentTo(this.recentColors);
            colorUI.setAttribute('color', color);

            colorUI.mouseUp.listen(() => {
                this.setActiveColor(color);
            });

            this.recentColors.children.forEach((child, index) => {
                index = this.recentColors.children.length - index - 1;
                const position = new Vector2(
                    (index % 6) * RECENT_COLOR_SIZE + (index % 6) * RECENT_COLOR_MARGIN,
                    Math.floor(index / 6) * RECENT_COLOR_SIZE + Math.floor(index / 6) * RECENT_COLOR_MARGIN
                );

                child.positionAbsolute = position;
            });
        }

        setNonActiveColor (color) {
            const checkChild = (child) => {
                const childColor = child.getAttribute('color');

                if (childColor !== undefined && childColor !== color) {
                    child.borderSize = 0;
                    child.zIndex = 1;
                };
            }
            
            this.recentColors.children.forEach(checkChild);
            this.primaryColorContainer.children.forEach(checkChild);
            this.secondaryColorContainer.children.forEach(checkChild);
        }

        setActiveColor (color, setSlider = true) {
            let [r, g, b] = this.huePicker.hexToRgb(color);

            r *= (1 - this.huePicker.brightness);
            g *= (1 - this.huePicker.brightness);
            b *= (1 - this.huePicker.brightness);

            const visualColor = this.huePicker.rgbToHex(r, g, b);

            this.activeColor = color;
            this.previewColor.backgroundColor = visualColor;
            this.hexTextBox.text = visualColor.substring(1);
            
            // check primary
            let index = this.recentColors.children.findIndex((child) => child.getAttribute('color') === color);

            if (index !== -1) {
                this.recentColors.children[index].borderSize = 2;
            } else {
                // check secondary
                index = this.primaryColorContainer.children.findIndex((child) => child.getAttribute('color') === color);
                
                if (index !== -1) {
                    const child = this.primaryColorContainer.children[index];
                
                    child.zIndex = 2;
                    child.borderSize = 2;
                } else {
                    // check final
                    index = this.secondaryColorContainer.children.findIndex((child) => child.getAttribute('color') === color);
                    
                    if (index !== -1) {
                        const child = this.secondaryColorContainer.children[index];
                    
                        child.zIndex = 2;
                        child.borderSize = 2;
                    }
                }
            }

            if (setSlider) {
                const position = this.huePicker.getPositionForHue(color);
                this.huePicker.slider.positionAbsolute = position;
            }

            this.setNonActiveColor(visualColor);
            this.huePicker.brightnessSlider.setColor(color);
            this.onColorSelected.trigger(visualColor);
        }

        getActiveColor () {
            return this.activeColor;
        }
    }
})();