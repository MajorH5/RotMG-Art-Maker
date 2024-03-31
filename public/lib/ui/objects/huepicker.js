import { BrightnessSlider } from './brightnessSlider.js';
import { Constants } from '../../utils/constants.js';
import { Vector2 } from "../../utils/vector2.js";
import { Event } from '../../utils/event.js';
import { UIBase } from "../uiBase.js";

export const HuePicker = (function () {
    return class HuePicker extends UIBase {
        constructor (options) {
            super({
                size: new Vector2(320, 130),
                backgroundEnabled: true,
                ...options
            });

            this.slider = new UIBase({
                size: new Vector2(10, 10),
                borderSize: 1,
                borderColor: '#ffffff',
                borderRadius: 10,
                shadow: true,
                shadowBlur: 5,
                pivot: new Vector2(0.5, 0.5)
            });
            this.slider.parentTo(this);

            this.mouseDown.listen((position, mouse) => this.handleMouseGrab(mouse));
            this.slider.mouseDown.listen((position, mouse) => this.handleMouseGrab(mouse));
            
            this.brightness = 0;

            this.brightnessSlider = new BrightnessSlider({
                positionScale: new Vector2(1, 0),
                position: new Vector2(10, 0),
            });
            this.brightnessSlider.brightnessSelected.listen((brightness) => {
                this.brightness = brightness;
            });
            this.brightnessSlider.parentTo(this);

            this.hueSelected = new Event();
        }

        handleMouseGrab (mouse) {
            if (ArtEditor.isModalOpen()) return;

            const update = () => {
                const objectPosition = this.getScreenPosition(Constants.DEFAULT_CANVAS_SIZE);
                const localPosition = mouse.position.subtract(objectPosition);

                localPosition.x = Math.max(0, Math.min(localPosition.x, this.sizeAbsolute.x));
                localPosition.y = Math.max(0, Math.min(localPosition.y, this.sizeAbsolute.y));

                this.slider.positionAbsolute = localPosition;
                this.hueSelected.trigger(this.getHueAtPosition(localPosition));
            };

            mouse.mouseMoved.listen(update);
            mouse.mouseUp.listenOnce(() => {
                // TODO: dont do this... because it will remove all mouseMoved listeners
                mouse.mouseMoved.clear();
            });
            update();
        }

        setBrightness (brightness) {
            this.brightness = brightness;
            this.brightnessSlider.setBrightness(brightness);
        }

        mapRange (value, low1, high1, low2, high2) {
            return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
        }

        getHueAtPosition (position) {
            const h = position.x / this.sizeAbsolute.x;
            const s = 1;
            const l = this.mapRange(position.y / this.sizeAbsolute.y, 0, 1, 0.5, 1);
            return this.hslToHex(h, s, l);
        }

        getPositionForHue (color) {
            let [r, g, b] = this.hexToRgb(color);
            const [h, s, l] = this.rgbToHsl(r * 255, g * 255, b * 255);

            return new Vector2(h * this.sizeAbsolute.x, l * this.sizeAbsolute.y);
        }

        hexToRgb (color) {
            let r = parseInt(color.slice(1, 3), 16) / 255;
            let g = parseInt(color.slice(3, 5), 16) / 255;
            let b = parseInt(color.slice(5, 7), 16) / 255;

            return [r, g, b];
        }

        rgbToHex (r, g, b) {
            const toHex = (c) => {
                const hex = Math.round(c * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }

            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        rgbToHsl (r, g, b) {
            r /= 255, g /= 255, b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return [h, s, l];
        }

        hslToHex (h, s, l) {
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            const toHex = (c) => {
                const hex = Math.round(c * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }

            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        render (context, screenSize) {
            const objectPosition = this.getScreenPosition(screenSize);
            const objectSize = this.getScreenSize(screenSize);

            // draws a wide gradient from
            // red -> yellow -> green -> cyan -> blue -> magenta -> red
            // fade to white from top to bottom
            const gradient = context.createLinearGradient(objectPosition.x, objectPosition.y, objectPosition.x + objectSize.x, objectPosition.y);
            
            gradient.addColorStop(0, 'red');
            gradient.addColorStop(1/6, 'yellow');
            gradient.addColorStop(2/6, 'green');
            gradient.addColorStop(3/6, 'cyan');
            gradient.addColorStop(4/6, 'blue');
            gradient.addColorStop(5/6, 'magenta');
            gradient.addColorStop(1, 'red');

            // draw overlaying fading to white gradient
            const gradient2 = context.createLinearGradient(objectPosition.x, objectPosition.y, objectPosition.x, objectPosition.y + objectSize.y);
            gradient2.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient2.addColorStop(1, 'rgba(255, 255, 255, 1)');
            
            context.globalAlpha = 1;
            context.fillStyle = gradient;
            context.fillRect(objectPosition.x, objectPosition.y, objectSize.x, objectSize.y);

            context.fillStyle = gradient2;
            context.fillRect(objectPosition.x, objectPosition.y, objectSize.x, objectSize.y);

            // darken
            context.shadowBlur = 0;
            context.fillStyle = 'black';
            context.globalAlpha = this.brightness;
            context.fillRect(objectPosition.x, objectPosition.y, objectSize.x, objectSize.y);

            super.renderChildren(context, screenSize);
        }
    }
})();