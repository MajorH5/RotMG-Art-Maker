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
            
            this.absorb = false;

            this.mouseEnter.listen(() => {
                this.backgroundEnabled = true;
            });
            
            this.mouseLeave.listen(() => {
                this.backgroundEnabled = false;
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
                    current = (current + 1) % 5;
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