import { RotmgButtonBorder } from './rotmgButtonBorder.js';
import { Vector2 } from '../../utils/vector2.js';
import { UIBase } from '../uiBase.js';
import { UIText } from '../uiText.js';
import { RotMGSprite } from './rotmgSprite.js';
import { DeleteScreen } from '../screens/deleteScreen.js';

export const SpriteCell = (function () {
    return class SpriteCell extends UIBase {
        constructor (postOrObject, options) {
            super({
                backgroundColor: '#ffffff',
                transparency: 0.25,
                size: new Vector2(16*7, 16*7),
                clipChildren: true,

                position: new Vector2(50, 100),

                ...options
            });

            this.postOrObject = postOrObject;
            
            if (ArtEditor.user !== null) {
                this.isOwner = postOrObject.ownerId !== null && postOrObject.ownerId === ArtEditor.user.details.userId;
            } else {
                this.isOwner = false;
            }

            this.deleteButton = new RotmgButtonBorder('X', {
                size: new Vector2(18, 18),
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                position: new Vector2(-10, 10),
                fontSize: 13,
                paddingLeft: 0,
                textXAlignment: 'center',
                borderSize: 1,
                shadow: true,
                shadowBlur: 3,
                borderColor: '#888888',
                borderRadius: 5,
                clipChildren: true,
                visible: false,
                zIndex: 10
            });

            this.absorb = false;
            this.deleteButton.parentTo(this);

            this.deleteButton.mouseDown.listen((pos, mouse) => {
                this.absorb = true;
                mouse.mouseUp.listenOnce(() => {
                    setTimeout(() => this.absorb = false);
                });
            });

            this.mouseEnter.listen(() => {
                this.backgroundEnabled = true;
                this.deleteButton.visible = this.isOwner;
            });
            
            this.mouseLeave.listen(() => {
                this.backgroundEnabled = false;
                this.deleteButton.visible = false;
            });

            // console.log(object)
            const frames = postOrObject.getTextureFrames();
            const textureSize = postOrObject.isLoaded ? postOrObject.getTextureRect()[1] : Vector2.zero;

            this.sprite = new RotMGSprite(textureSize, {
                frames: frames,
                pivot: new Vector2(0.5, 0.5),
                positionScale: new Vector2(0.5, 0.5)
            });
            this.sprite.parentTo(this);

            if (frames.length  > 1) {
                let current = 0;
                let interval = setInterval(() => {
                    if (!this.parent) {
                        clearInterval(interval);
                    }
                    
                    this.sprite.setFrame(current);
                    current = (current + 1) % 4
                }, 200);
            }

            this.spriteLabel = new UIText(postOrObject.objectId.replace(/ /g, ''), {
                positionScale: new Vector2(0.5, 1),
                sizeScale: new Vector2(1, 0),
                pivot: new Vector2(0.5, 1),
                position: new Vector2(0, -10),
                textXAlignment: 'left',
                paddingLeft: 5,
                paddingTop: -10,
                shadow: true,
                shadowBlur: 3,
                fontColor: '#999999',
                fontSize: 14,
                textWraps: false,
            });
            this.spriteLabel.parentTo(this);

        }
    }
})();