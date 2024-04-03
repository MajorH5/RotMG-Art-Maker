// container class for the sprite pixel editor frame

import { Vector2 } from '../../utils/vector2.js';
import { Sprite } from '../../assets/sprite.js';
import { Event } from '../../utils/event.js';
import { UIBase } from '../uiBase.js';

export const SpriteEditor = (function () {
    return class SpriteEditor extends UIBase {
        static MAX_WIDTH = 400;

        static DRAW = 'draw';
        static ERASE = 'erase';
        static SAMPLE = 'sample';
        static CLEAR = 'clear';
        static HOVER = 'hover';

        static HISTORY_PIXEL_EDIT = 'history_pixel_edit';

        constructor (options) {
            super({ ...options });

            this.scale = 5;
            this.spriteSize = new Vector2(8, 8);
            this.pixels = [];
            this.frame = null;
            this.onInteract = new Event();
            this.sizeAbsolute = new Vector2(SpriteEditor.MAX_WIDTH, SpriteEditor.MAX_WIDTH);
            this.selectedColor = '#ffffff';
            this.mode = SpriteEditor.DRAW;

            this.history = options.history || null;
            
            if (this.history !== null) {
                this.history.register(SpriteEditor.HISTORY_PIXEL_EDIT, (action) => {
                    const data = action.getData();

                    for (let i = 0; i < data.length; i++) {
                        const event = data[i];
                        const { pixel, from, to } = event;

                        if (to === null) {
                            pixel.backgroundEnabled = false;
                            pixel.setAttribute('color', null);
                        } else {
                            pixel.backgroundColor = to;
                            pixel.backgroundEnabled = true;
                            pixel.setAttribute('color', to);
                        }

                        if (this.frame !== null) {
                            const position = pixel.getAttribute('position');
                            this.frame.set(position, pixel.getAttribute('color'));
                        }

                        event.from = to;
                        event.to = from;
                    }
                    
                    return action;
                });
            }

            // fix weird blurry lines...
            this.positionAbsolute.x += -0.5;
            this.positionAbsolute.y += -0.5;

            this.setSpriteSize(this.spriteSize);
        }

        setFrame (frame) {
            this.setSpriteSize(frame.size);
            
            for (let y = 0; y < frame.size.y; y++) {
                for (let x = 0; x < frame.size.x; x++) {
                    const pixel = this.pixels[y][x];
                    const color = frame.get(new Vector2(x, y));

                    if (color !== null) {
                        pixel.backgroundColor = color;
                        pixel.backgroundEnabled = true;
                        pixel.setAttribute('color', color);
                    } else {
                        pixel.backgroundEnabled = false;
                        pixel.setAttribute('color', null);
                    }
                }
            }

            this.frame = frame;
        }

        setActiveColor (color) {
            this.selectedColor = color;
        }

        setSpriteSize (size) {
            const aspectRatio = size.y / size.x;

            this.sizeAbsolute = new Vector2(
                SpriteEditor.MAX_WIDTH,
                aspectRatio * SpriteEditor.MAX_WIDTH
            );

            this.spriteSize = size;
            this.resetPixels();
        }

        resetPixels () {
            this.clearChildren();
            this.pixels = [];
            this.frame = null;

            for (let y = 0; y < this.spriteSize.y; y++) {
                this.pixels[y] = [];

                for (let x = 0; x < this.spriteSize.x; x++) {
                    this.pixels[y][x] = this.createPixel(x, y);
                }
            }

            this.onInteract.trigger(SpriteEditor.CLEAR);
        }

        loadPixels (pixels, width, height) {
            const pixelSize = new Vector2(width, height);
            this.setSpriteSize(pixelSize);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixel = this.pixels[y][x];
                    const index = (y * width + x) * 4;

                    const r = pixels[index];
                    const g = pixels[index + 1];
                    const b = pixels[index + 2];
                    const a = pixels[index + 3];

                    const hex = this.RGBtohex(r, g, b);

                    if (a === 0) {
                        pixel.backgroundEnabled = false;
                        pixel.setAttribute('color', null);
                    } else {
                        pixel.backgroundColor = hex;
                        pixel.backgroundEnabled = true;
                        pixel.setAttribute('color', pixel.backgroundColor);
                    }
                }
            }
        }

        clearPixels () {
            for (let y = 0; y < this.spriteSize.y; y++) {
                for (let x = 0; x < this.spriteSize.x; x++) {
                    const pixel = this.pixels[y][x];
                    pixel.backgroundEnabled = false;
                    pixel.setAttribute('color', null);
                }
            }

            if (this.frame !== null) {
                this.frame.clear();
            }

            // store the clear action in the history
            for (let y = 0; y < this.spriteSize.y; y++) {
                for (let x = 0; x < this.spriteSize.x; x++) {
                    const pixel = this.pixels[y][x];
                    this.history.update(SpriteEditor.HISTORY_PIXEL_EDIT, {
                        from: pixel.getAttribute('color'),
                        to: null,
                        pixel: pixel
                    });
                }
            }
        }

        createPixel (x, y) {
            const size = new Vector2(this.sizeAbsolute.x / this.spriteSize.x,
            this.sizeAbsolute.y / this.spriteSize.y);
            const pixel = new UIBase({
                size: size,
                position: new Vector2(x, y).multiply(size),
                backgroundColor: 'black',
                backgroundEnabled: false,

                borderSize: 0.5,
                borderColor: '#ffffff'
            });
            pixel.parentTo(this);

            const hover = new UIBase({
                sizeScale: Vector2.one,
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(-1, -1),
                visible: this.mode === SpriteEditor.DRAW
            });
            hover.parentTo(pixel);

            pixel.mouseEnter.listen(() => {
                hover.backgroundColor = this.selectedColor;
                hover.backgroundEnabled = true;    

                const color = pixel.getAttribute('color');

                //  if (color !== null && )
                
                this.onInteract.trigger(SpriteEditor.HOVER, pixel);
            });
            pixel.mouseLeave.listen(() => {
                hover.backgroundEnabled = false;
                this.onInteract.trigger(SpriteEditor.HOVER, pixel);
            });

            pixel.mouseDown.listen((position, mouse) => {
                this.handlePixelInteract(pixel);

                mouse.mouseUp.listenOnce(() => {
                    if (this.history !== null) {
                        const pending = this.history.getPendingAction();
    
                        if (pending !== null && pending.getTag() === SpriteEditor.HISTORY_PIXEL_EDIT) {
                            this.history.close();
                        }
                    }
                })
            });
            
            pixel.mouseMove.listen((position, mouse) => {
                if (!mouse.down) return;
                this.handlePixelInteract(pixel);
            });

            pixel.setAttribute('position', new Vector2(x, y));
            pixel.setAttribute('color', null);

            return pixel;
        }

        handlePixelInteract (pixel) {
            if (ArtEditor.isModalOpen()) {
                return; 
            }
            
            const oldColor = pixel.getAttribute('color');
            
            switch (this.mode) {
                case SpriteEditor.DRAW:
                    if (pixel.getAttribute('color') === this.selectedColor) return;
                    
                    pixel.backgroundColor = this.selectedColor;
                    pixel.backgroundEnabled = true;
                    pixel.setAttribute('color', this.selectedColor);

                    if (this.history !== null) {
                        this.history.update(SpriteEditor.HISTORY_PIXEL_EDIT, {
                            from: this.selectedColor,
                            to: oldColor,
                            pixel: pixel
                        });
                    }
                    break;
                case SpriteEditor.ERASE:
                    if (pixel.getAttribute('color') === null) return;

                    pixel.backgroundEnabled = false;
                    pixel.setAttribute('color', null);

                    if (this.history !== null) {
                        this.history.update(SpriteEditor.HISTORY_PIXEL_EDIT, {
                            from: this.selectedColor,
                            to: oldColor,
                            pixel: pixel
                        });
                    }
                    break;
                case SpriteEditor.SAMPLE:
                    if (pixel.getAttribute('color') === null || this.selectedColor === pixel.getAttribute('color')) return;

                    this.selectedColor = pixel.backgroundColor;
                    break;
            }

            if (this.frame !== null) {
                const position = pixel.getAttribute('position');
                this.frame.set(position, pixel.getAttribute('color'));
            }

            this.onInteract.trigger(this.mode, pixel);
        }

        setMode (mode) {
            this.mode = mode;

            for (let y = 0; y < this.spriteSize.y; y++) {
                for (let x = 0; x < this.spriteSize.x; x++) {
                    const pixel = this.pixels[y][x];
                    const [hover] = pixel.children;

                    hover.visible = mode === SpriteEditor.DRAW;
                }
            }
        }

        getPixels () {
            const pixels = new Uint8ClampedArray(this.spriteSize.x * this.spriteSize.y * 4);

            for (let y = 0; y < this.spriteSize.y; y++) {
                for (let x = 0; x < this.spriteSize.x; x++) {
                    const pixel = this.pixels[y][x];
                    let color = pixel.getAttribute('color');
                    const [hover] = pixel.children;

                    if (hover.visible && hover.backgroundEnabled) {
                        // if they're hovering over this pixel, use the hover color
                        color = hover.backgroundColor;
                    } else if (!pixel.backgroundEnabled) {
                        color = null;
                    }

                    let r = 0, g = 0, b = 0, a = 0;

                    if (color !== null) {
                        [r, g, b] = this.hexToRGB(color);
                        a = 255;
                    }

                    const index = (y * this.spriteSize.x + x) * 4;
                    
                    pixels[index] = r;
                    pixels[index + 1] = g;
                    pixels[index + 2] = b;
                    pixels[index + 3] = a;
                }
            }

            return [pixels, this.spriteSize.x, this.spriteSize.y];
        }

        getCompressedPixels () {
            const pixels = [];

            for (let y = 0; y < this.spriteSize.y; y++) {
                for (let x = 0; x < this.spriteSize.x; x++) {
                    const pixel = this.pixels[y][x];
                    let color = pixel.getAttribute('color');

                    if (!pixel.backgroundEnabled || color === null) {
                        color = -1;
                    } else {
                        const [r, g, b] = this.hexToRGB(color);
                        const packed = (r << 16) | (g << 8) | b;

                        color = packed;
                    }


                    pixels.push(color);
                }
            }

            return [pixels, this.spriteSize.x, this.spriteSize.y];
        }

        hexToRGB (hex) {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);

            return [r, g, b]
        }

        RGBtohex (r, g, b) {
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        render (context, screenSize) {
            const objectSize = this.getScreenSize(screenSize);
            const screenPosition = this.getScreenPosition(screenSize);

            const transparentTile = Sprite.getCachedImage(Sprite.IMG_TRANSPARENT_TILE);
            const pattern = context.createPattern(transparentTile, 'repeat');
            context.fillStyle = pattern;
            context.fillRect(screenPosition.x, screenPosition.y, objectSize.x, objectSize.y);
            
            this.renderChildren(context, screenSize);
        }
    }
})();