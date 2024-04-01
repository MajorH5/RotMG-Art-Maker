import { Vector2 } from "../../utils/vector2.js";
import { UIText } from "../uiText.js";

export const PreloadScreen = (function () {
    return class PreloadScreen extends UIText {
        constructor (options) {
            super('', {
                sizeScale: new Vector2(1, 1),
                backgroundEnabled: true,
                backgroundColor: '#eeeeee',
                zIndex: 99999999,
                fontColor: '#ffffff',
                ...options
            });
        }
    }
})();