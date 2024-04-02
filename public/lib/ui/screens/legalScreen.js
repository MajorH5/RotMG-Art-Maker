// pop up that appears when editor is first loaded
import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { Vector2 } from "../../utils/vector2.js";
import { Sounds } from '../../assets/sounds.js';
import { UIText } from "../uiText.js";
import { UIBase } from "../uiBase.js";

export const LegalScreen = (function () {
    const disclaimerText = `This website (www.realmspriter.com) and the tools provided herein are intended for entertainment and educational purposes only. This tool is a clone of a currently defunct tool originally created by Wildshadow Studios and is NOT associated with Realm of the Mad God (RotMG) or DECA LIVE OPERATIONS GMBH in any way.

All trademarks, service marks, trade names, product names, artworks, logos, and trade dress appearing on this website are the property of their respective owners, including but not limited to Wildshadow Studios, Kabam, Inc., and DECA LIVE OPERATIONS GMBH. Any reference to specific entities or brands on this website is purely for informational purposes and does not imply endorsement or affiliation.

By using this website and the tools provided herein, you agree to use them responsibly and in accordance with all applicable laws, rules, and regulations. You further acknowledge that the creators of this website shall not be liable for any damages or losses arising from the use or misuse of the tools provided.

Any artworks created using this tool are the sole responsibility of the user. The creators of this website shall not be held liable for any copyright infringement, intellectual property disputes, or legal claims arising from the creation, distribution, or use of artworks generated with this tool.

Users are advised to ensure that they have the necessary rights and permissions for any images, sprites, or other assets used in their artworks. It is the user's responsibility to obtain proper licensing or permissions for any third-party content used in their creations.

This website and its creators reserve the right to modify, suspend, or terminate access to the tools provided herein at any time and without prior notice.
The artwork uploaded to this website may be subject to removal or deletion at the discretion of the website owners or administrators. Reasons for removal may include, but are not limited to:

Violation of the website's terms of use,
Copyright infringement or intellectual property disputes,
Inappropriate or offensive content,
Technical issues or maintenance requirements.
The website owners reserve the right to remove or delete artwork without prior notice or explanation. Users acknowledge that they do not have an inherent right to the permanent storage or display of their artwork on this website.
By selecting "I Understand", you acknowledge that you have read and understood the information provided above.`;

    return class LegalScreen extends UIBase {
        constructor () {
            super({
                backgroundColor: '#222222',
                backgroundEnabled: true,
                sizeScale: Vector2.one,
                zIndex: 9998,

                visible: false
            });

            this.modal = new UIBase({
                size: new Vector2(550, 600),
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

            this.header = new UIText('Disclaimer', {
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

                this.disclaimer.positionAbsolute = new Vector2(0, scrollAmmount);
            });

            this.container.parentTo(this.modal);

            this.disclaimer = new UIText(disclaimerText, {
                sizeScale: new Vector2(1, 1),

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
            this.disclaimer.parentTo(this.container);

            this.understand = new RotmgButtonDefault('I Understand', {
                positionScale: new Vector2(0.5, 1),
                size: new Vector2(200, 40),
                pivot: new Vector2(0.5, 1),
                position: new Vector2(0, -10),
            });
            this.understand.parentTo(this.modal);

            this.understand.mouseUp.listen(() => {
                this.visible = false;
                Sounds.playTheme(Sounds.SND_THEME);
            });
        }
    }
})();