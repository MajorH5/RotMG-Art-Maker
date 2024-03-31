// just a class wrapper around a uitext with
// basic styling so no need to repeat it everywhere

import { Vector2 } from "../../utils/vector2.js";
import { UIText } from "../uiText.js";

export const RotmgButtonDefault = (function () {
    return class RotmgButtonDefault extends UIText {
        constructor (text, options) {
            super(text, {
                backgroundColor: '#ffffff',
                backgroundEnabled: true,

                font: 'myriadpro_bold',
                fontSize: 18,
                fontColor: '#363636',

                borderRadius: 6,
                clickable: true,

                size: new Vector2(102, 32),
                textBaseLine: 'middle',

                ...options
            });

            this.mouseEnter.listen(() => {
                this.backgroundColor = '#FFDA84';
            });
            
            this.mouseLeave.listen(() => {
                this.backgroundColor = '#ffffff';
            });
            
        }
    }
})();