// styled button with border around it

import { Vector2 } from "../../utils/vector2.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";

export const RotmgButtonBorder = (function () {
    return class RotmgButtonBorder extends UIText {
        constructor (text, options) {
            super(text, {
                font: 'myriadpro',
                fontSize: 18,
                fontColor: '#ffffff',

                clickable: true,

                borderSize: 2,
                borderColor: '#ffffff',
                textXAlignment: 'left',
                paddingLeft: 10,

                size: new Vector2(100, 30),
                textBaseLine: 'middle',

                ...options
            });

            this.isActive = false;
            this.isHeld = false;

            this.hover = new UIBase({
                sizeScale: Vector2.one,
                backgroundEnabled: false,
                backgroundColor: '#ffffff',
                transparency: 0.45
            });
            this.hover.parentTo(this);



            this.mouseEnter.listen(() => {
                this.hover.backgroundEnabled = true;
            });
            
            this.mouseDown.listen(() => {
                this.hover.backgroundEnabled = false;
            });
            
            this.mouseUp.listen(() => {
                this.hover.backgroundEnabled = true;
            })
            
            this.mouseLeave.listen(() => {
                this.hover.backgroundEnabled = this.isActive;
            });
            
        }

        setActive (isActive) {
            this.isActive = isActive;
            this.hover.backgroundEnabled = isActive;
        }
    }
})();