// pop up that appears when editor is first loaded
import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { Vector2 } from "../../utils/vector2.js";
import { Sounds } from '../../assets/sounds.js';
import { UIText } from "../uiText.js";
import { UIBase } from "../uiBase.js";
import { Constants } from "../../utils/constants.js";

export const UpdateScreen = (function () {
    const versionText = `• Increased user post limit to 200 per user`;

    return class UpdateScreen extends UIBase {
        constructor () {
            super({
                backgroundColor: '#222222',
                backgroundEnabled: true,
                sizeScale: Vector2.one,
                zIndex: 9998,

                visible: false
            });

            this.modal = new UIBase({
                size: new Vector2(400, 350),
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

            this.header = new UIText(`Patch notes ${Constants.VERSION}`, {
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

            this.scrollBar = new UIBase({
                sizeScale: new Vector2(0, 1),
                size: new Vector2(10, 0),
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                backgroundColor: '#444444',
                backgroundEnabled: true,
                visible: false
            });
            this.scrollIndicator = new UIBase({
                sizeScale: new Vector2(1, 0.1),
                positionScale: new Vector2(0.5, 0),
                pivot: new Vector2(0.5, 0),
                backgroundColor: '#666666',
                backgroundEnabled: true
            });
            this.scrollIndicator.parentTo(this.scrollBar);

            this.container = new UIBase({
                sizeScale: new Vector2(1, 0.7),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                clipChildren: true
            });
            this.scrollBar.parentTo(this.container);

            let scrollAmmount = 0;
            let scrollSpeed = 20;

            this.container.scrolled.listen((direction) => {
                scrollAmmount += direction * scrollSpeed;

                if (scrollAmmount > 0) {
                    scrollAmmount = 0;
                } else if (scrollAmmount < -420) {
                    scrollAmmount = -420;
                }

                this.updateText.positionAbsolute = new Vector2(0, scrollAmmount);
            });

            this.container.parentTo(this.modal);

            const content = versionText.split('\n');

            for (let i = 0; i < content.length; i++) {
                const text = new UIText(content[i], {
                    sizeScale: new Vector2(1, 1),
                    position: new Vector2(0, i * 25),
                    textXAlignment: 'left',
                    textYAlignment: 'top',
                    paddingLeft: 20,
                    paddingRight: 10,
                    fontColor: '#bbbbbb',
                    fontSize: 18,
                    font: 'myriadpro_light',
                    shadow: true,
                    shadowBlur: 5,
                });
                text.parentTo(this.container);
            }

            // this.updateText = new UIText(versionText, {
            //     sizeScale: new Vector2(1, 1),

            //     textXAlignment: 'left',
            //     textYAlignment: 'top',
            //     paddingLeft: 20,
            //     paddingRight: 10,

            //     fontColor: '#bbbbbb',
            //     fontSize: 18,
            //     font: 'myriadpro_light',

            //     shadow: true,
            //     shadowBlur: 5,
            // });
            // this.updateText.parentTo(this.container);

            this.continue = new RotmgButtonDefault('Continue', {
                positionScale: new Vector2(0.5, 1),
                size: new Vector2(200, 40),
                pivot: new Vector2(0.5, 1),
                position: new Vector2(0, -10),
            });
            this.continue.parentTo(this.modal);

            this.continue.mouseUp.listen(() => {
                this.visible = false;
                localStorage.setItem('lastUpdate', Constants.VERSION);
            });
        }
    }
})();