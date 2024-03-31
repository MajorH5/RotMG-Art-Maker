// pop up that appears when editor is first loaded
import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { Vector2 } from "../../utils/vector2.js";
import { Sounds } from '../../assets/sounds.js';
import { UIText } from "../uiText.js";
import { UIBase } from "../uiBase.js";

export const WelcomeScreen = (function () {
    return class WelcomeScreen extends UIBase {
        constructor () {
            super({
                backgroundColor: '#222222',
                backgroundEnabled: true,
                sizeScale: Vector2.one,
                zIndex: 9999,

                // visible: false
            });

            this.modal = new UIBase({
                size: new Vector2(400, 145),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),

                backgroundColor: '#363636',
                backgroundEnabled: true,

                shadow: true,
                shadowBlur: 5,

                borderSize: 2,
                borderColor: '#ffffff',
                borderRadius: 6
            });
            this.modal.parentTo(this);

            this.header = new UIText('Welcome', {
                position: new Vector2(0, 25),
                sizeScale: new Vector2(1, 0),
                
                font: 'myriadpro_bold',

                fontSize: 24,
                fontColor: '#578763',
                textXAlignment: 'center',
                textYAlignment: 'center',

                shadow: true,
                shadowBlur: 5,
            });
            this.header.parentTo(this.modal);

            this.welcomeText = new UIText('Welcome to RotMG Art Editor. Click here to view source or report issues.', {
                positionScale: new Vector2(0, 0.1),
                sizeScale: new Vector2(1, 0.7),

                textXAlignment: 'left',
                paddingLeft: 20,

                fontColor: '#bbbbbb',
                fontSize: 18,
                font: 'myriadpro_light',

                shadow: true,
                shadowBlur: 5,
            });
            this.welcomeText.parentTo(this.modal);

            this.enter = new RotmgButtonDefault('Enter', {
                positionScale: new Vector2(0.5, 1),
                pivot: new Vector2(0.5, 1),
                position: new Vector2(0, -10),
            });
            this.enter.parentTo(this.modal);

            this.enter.mouseUp.listen(() => {
                this.visible = false;
                ArtEditor.legalScreen.visible = true;
            });
        }
    }
})();