import { Constants } from "../../utils/constants.js";
import { Vector2 } from "../../utils/vector2.js";
import { Event } from "../../utils/event.js";
import { UIBase } from "../uiBase.js";

export const BrightnessSlider = (function () {
    return class BrightnessSlider extends UIBase {
        constructor (options) {
            super({
                backgroundEnabled: true,
                size: new Vector2(30, 130),
                ...options
            });

            this.slider = new UIBase({
                sizeScale: new Vector2(1, 0),
                size: new Vector2(10, 10),
                pivot: new Vector2(0.5, 0.5),
                positionScale: new Vector2(0.5, 0),
                borderSize: 1,
                borderColor: '#ffffff'
            });
            this.slider.parentTo(this);

            this.mouseDown.listen((position, mouse) => this.handleMouseGrab(mouse));
            this.slider.mouseDown.listen((position, mouse) => this.handleMouseGrab(mouse));

            this.color = '#ff0000';
            this.brightness = 0;
            this.brightnessSelected = new Event();
        }

        handleMouseGrab (mouse) {
            if (ArtEditor.isModalOpen()) return;

            const update = () => {
                const objectPosition = this.getScreenPosition(Constants.DEFAULT_CANVAS_SIZE);
                const localPosition = mouse.position.subtract(objectPosition);

                localPosition.y = Math.max(0, Math.min(localPosition.y, this.sizeAbsolute.y));

                this.slider.positionAbsolute.y = localPosition.y;
                this.brightness = localPosition.y / this.sizeAbsolute.y;
                this.brightnessSelected.trigger(this.brightness);
            };

            mouse.mouseMoved.listen(update);
            mouse.mouseUp.listenOnce(() => {
                // TODO: dont do this... because it will remove all mouseMoved listeners
                mouse.mouseMoved.clear();
            });
            update();
        }

        setColor (color) {
            this.color = color;
        }

        setBrightness (brightness) {
            this.slider.positionAbsolute.y = brightness;
            this.brightness = brightness;
        }

        render (context, screenSize) {
            const objectPosition = this.getScreenPosition(screenSize);
            const objectSize = this.getScreenSize(screenSize);

            // draws a wide gradient from
            // black -> white
            const gradient = context.createLinearGradient(
                objectPosition.x, objectPosition.y,
                objectPosition.x, objectPosition.y + objectSize.y
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'black');
            
            context.globalAlpha = 1;
            context.fillStyle = gradient;
            context.fillRect(objectPosition.x, objectPosition.y, objectSize.x, objectSize.y);

            super.renderChildren(context, screenSize);
        }
    }
})();