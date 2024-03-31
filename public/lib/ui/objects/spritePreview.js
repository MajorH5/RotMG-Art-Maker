// rendering current view inside of the
// sprite editor frame

import { RotmgButtonBorder } from "./rotmgButtonBorder.js";
import { Vector2 } from "../../utils/vector2.js";
import { Sprite } from "../../assets/sprite.js";
import { RotMGSprite } from "./rotmgSprite.js";
import { UIImage } from "../uiImage.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { PackagedSequence } from "../../utils/packagedSequence.js";

export const SpritePreview = (function () {
    return class SpritePreview extends UIBase {
        static MAX_ZOOM = 200;
        static MIN_ZOOM = 10;

        constructor (options) {
            super({
                backgroundEnabled: true,
                backgroundColor: '#808080',
                size: new Vector2(300, 400),

                borderSize: 0.5,
                borderColor: '#ffffff',

                ...options
            });

            this.zoomLevel = 100;
            this.zoomRate = 10;
            this.pixelData = null;
            this.cachedImage = null;
            this.sequence = null;

            this.rootWidth = 0;
            this.rootHeight = 0;

            this.width = 0;
            this.height = 0;

            this.currentAnimation = PackagedSequence.STAND;
            this.elapsed = 0;
            this.frame = 0;

            this.zoomOutButton = new RotmgButtonBorder('-', {
                backgroundColor: '#ffffff',

                size: new Vector2(16, 16),
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                position: new Vector2(-16*2, 5),

                borderSize: 1,
                paddingLeft: 0,
                paddingBottom: 2.5,
                textXAlignment: 'center'
            });
            this.zoomOutButton.mouseUp.listen(() => {
                this.setZoom(this.zoomLevel - this.zoomRate);
            });
            this.zoomOutButton.parentTo(this);

            this.zoomInButton = new RotmgButtonBorder('+', {
                backgroundColor: '#ffffff',
    
                size: new Vector2(16, 16),
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                position: new Vector2(-8, 5),
                clickable: true,

                borderSize: 1,
                paddingLeft: 0,
                paddingBottom: 2.5,
                textXAlignment: 'center'
            });
            this.zoomInButton.mouseUp.listen(() => {
                this.setZoom(this.zoomLevel + this.zoomRate);
            });
            this.zoomInButton.parentTo(this);

            this.zoomText = new UIText('100%', {
                fontColor: 'white',
                fontSize: 16,
                position: new Vector2(8, 5),
                sizeScale: new Vector2(1, 1),
                textXAlignment: 'left',
                textYAlignment: 'top'
            });
            this.zoomText.parentTo(this);

            this.scrolled.listen((direction) => {
                this.setZoom(this.zoomLevel + direction * this.zoomRate);
            });

            this.animationPicker = new UIBase({
                size: new Vector2(0, 16*2),
                sizeScale: new Vector2(1, 0),
                position: new Vector2(0, -10),
                pivot: new Vector2(0.5, 1),
                positionScale: new Vector2(0.5, 1),
                visible: false,
            });
            this.animationPicker.parentTo(this);

            const padding = 4;

            this.standAnimation = this.createAnimationButton(3, PackagedSequence.STAND);
            this.standAnimation.positionAbsolute.x = -32 - padding;
            this.standAnimation.mouseUp.trigger(); //laziness
            this.standAnimation.parentTo(this.animationPicker);
            
            this.walkAnimation = this.createAnimationButton(4, PackagedSequence.WALK1);
            this.walkAnimation.positionAbsolute.x = 0;
            this.walkAnimation.parentTo(this.animationPicker);
            
            this.attackAnimation = this.createAnimationButton(5, PackagedSequence.ATTACK1);
            this.attackAnimation.positionAbsolute.x = 32 + padding;
            this.attackAnimation.parentTo(this.animationPicker);
        }

        createAnimationButton (index, animation) {
            const button = new UIImage(Sprite.IMG_ICONS, {
                size: new Vector2(32, 32),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                imageRectOffset: new Vector2(index % 3, Math.floor(index / 3)).scale(16),
                imageRectSize: new Vector2(16, 16),
                imageSmoothingEnabled: false,
            });

            const defaultOffset = button.imageRectOffset.clone();
            const selectOffset = defaultOffset.add(new Vector2(0, 16));

            button.setAttribute('DefaultOffset', defaultOffset);
            button.setAttribute('SelectOffset', selectOffset);
            button.setAttribute('Animation', animation);

            button.mouseUp.listen(() => {
                this.playAnimation(animation);
            });

            return button;
        }

        setSequence (sequence) {
            this.sequence = sequence;
            this.animationPicker.visible = sequence !== null;
            this.playAnimation(PackagedSequence.STAND);
        }
        
        playAnimation (animation) {
            this.animationPicker.children.forEach((child) => {
                const childAnimation = child.getAttribute('Animation');

                child.imageRectOffset = childAnimation === animation ?
                    child.getAttribute('SelectOffset') : child.getAttribute('DefaultOffset');
            });
            
            this.currentAnimation = animation;
            this.elapsed = 0;
            this.frame = 0;
        }

        setZoom (zoom) {
            this.zoomLevel = Math.max(SpritePreview.MIN_ZOOM, Math.min(SpritePreview.MAX_ZOOM, zoom));
            this.zoomText.text = `${this.zoomLevel}%`;
        }

        loadPixels (pixels, width, height, rootWidth, rootHeight) {
            this.cachedImage = null;
            this.pixelData = pixels;

            this.width = width;
            this.height = height;

            this.rootWidth = rootWidth || width;
            this.rootHeight = rootHeight || height;
        }

        update (deltaTime) {
            super.update(deltaTime);

            if (this.sequence === null) {
                return;
            }
            
            this.elapsed += deltaTime;
            
            const animation = this.sequence.getAnimation(this.currentAnimation)
            const frame = animation[this.frame];

            if (this.elapsed > this.sequence.frameRate) {
                this.frame = (this.frame + 1) % animation.length;
                this.elapsed = 0;
            }

            // TODO: this is inefficent because RotMGify is called every frame
            // for now, it's fine, but it should be optimized later
            this.loadPixels(frame.getPixels(), frame.size.x, frame.size.y, this.sequence.size.x, this.sequence.size.y);
        }

        render (context, screenSize) {
            super.render(context, screenSize);

            if (this.pixelData === null) {
                return;
            }

            if (this.cachedImage === null) {
                const pixels = RotMGSprite.RotMGify(this.pixelData, this.width, this.height);

                const renderCanvas = document.createElement('canvas');
                const renderContext = renderCanvas.getContext('2d');

                renderCanvas.width = (this.width + 2) * 5;
                renderCanvas.height = (this.height + 2) * 5;

                const imageData = new ImageData(pixels, renderCanvas.width, renderCanvas.height);
                renderContext.putImageData(imageData, 0, 0);

                this.cachedImage = renderCanvas;
            }

            const objectPosition = this.getScreenPosition(screenSize);
            const objectSize = this.getScreenSize(screenSize);

            context.save();

            const region = new Path2D()
            region.rect(objectPosition.x, objectPosition.y, objectSize.x, objectSize.y);
            context.clip(region);

            
            const zoom = this.zoomLevel / 100;
            const rootSize = new Vector2((this.rootWidth + 2) * 5, (this.rootHeight + 2) * 5).scale(zoom);
            const scaledSize = new Vector2(this.cachedImage.width * zoom, this.cachedImage.height * zoom);
            const scaledPosition = new Vector2(
                objectPosition.x + (objectSize.x - rootSize.x) / 2,
                objectPosition.y + (objectSize.y - rootSize.y) / 2
            );

            context.shadowBlur = 5;
            context.imageSmoothingEnabled = false;
            context.drawImage(this.cachedImage, scaledPosition.x, scaledPosition.y, scaledSize.x, scaledSize.y);

            context.restore();
        }
    }
})();