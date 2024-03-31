// logic for the repeating scrolling background
// seen on the editor

import { Constants } from "../../utils/constants.js";
import { Vector2 } from "../../utils/vector2.js";
import { Sprite } from "../../assets/sprite.js";
import { UIImage } from "../uiImage.js";
import { UIBase } from "../uiBase.js";

export const ScrollingBackground = (function () {
    return class ScrollingBackground extends UIBase {
        constructor () {
            super({
                size: new Vector2(800, 600),
                zIndex: -1,
            });

            this.totalSpritesX = Math.ceil(Constants.DEFAULT_CANVAS_SIZE.x / this.sizeAbsolute.x) + 1;
            this.totalSpritesY = Math.ceil(Constants.DEFAULT_CANVAS_SIZE.x / this.sizeAbsolute.y) + 1;

            this.totalScroll = new Vector2(0, 0);
            this.scrollSpeed = 0.5;

            for (let y = 0; y < this.totalSpritesY; y++) {
                for (let x = 0; x < this.totalSpritesX; x++) {
                    const bg = new UIImage(Sprite.IMG_BACKGROUND, {
                        size: this.sizeAbsolute.clone(),
                        position: new Vector2(x * this.sizeAbsolute.x, y * this.sizeAbsolute.y),
                        imageRectSize: new Vector2(800, 600)
                    });
                    bg.parentTo(this);
                }
            }
        }

        update (deltaTime) {
            super.update(deltaTime);
            
            this.totalScroll.x += this.scrollSpeed;
            this.totalScroll.y += this.scrollSpeed;

            this.positionAbsolute.x = -this.totalScroll.x;
            this.positionAbsolute.y = -this.totalScroll.y;

            if (this.totalScroll.x >= this.sizeAbsolute.x) {
                this.totalScroll.x = 0;
            }

            if (this.totalScroll.y >= this.sizeAbsolute.y) {
                this.totalScroll.y = 0;
            }
        }
    }
})();