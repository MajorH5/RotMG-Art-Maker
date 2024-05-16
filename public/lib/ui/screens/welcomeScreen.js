// pop up that appears when editor is first loaded
import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { Vector2 } from "../../utils/vector2.js";
import { Sounds } from '../../assets/sounds.js';
import { UIText } from "../uiText.js";
import { UIBase } from "../uiBase.js";
import { Constants } from "../../utils/constants.js";

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
                size: new Vector2(400, 220),
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

            this.welcomeText = new UIText('Welcome to RealmSpriter. By clicking \'Enter\', you are indicating that you have read and agreed to the Terms of Use and Privacy Policy.', {
                positionScale: new Vector2(0, 0.1),
                sizeScale: new Vector2(1, 0.7),

                textXAlignment: 'left',
                paddingLeft: 20,

                fontColor: '#bbbbbb',
                fontSize: 18,
                font: 'myriadpro_light',
                paddingRight: 20,

                shadow: true,
                shadowBlur: 5,
            });
            this.welcomeText.parentTo(this.modal);

            this.tos = new UIText('Terms of Use', {
                positionScale: new Vector2(0.5, 0),
                size: new Vector2(100, 20),
                pivot: new Vector2(1, 0),
                position: new Vector2(-10, 140),
                clickable: true,
                shadow: true,
                shadowBlur: 7,
                fontColor: '#5d56bd',
            });
            this.tos.mouseUp.listen(() => {
                window.open(`${Constants.ORIGIN}/legal/terms-of-use`, '_blank');
            });
            this.tos.parentTo(this.modal);

            this.pp = new UIText('Privacy Policy', {
                positionScale: new Vector2(0.5, 0),
                size: new Vector2(100, 20),
                pivot: new Vector2(0, 0),
                position: new Vector2(10, 140),
                clickable: true,
                shadow: true,
                shadowBlur: 7,
                fontColor: '#5d56bd',
            });
            this.pp.mouseUp.listen(() => {
                window.open(`${Constants.ORIGIN}/legal/privacy-policy`, '_blank');
            });
            this.pp.parentTo(this.modal);

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