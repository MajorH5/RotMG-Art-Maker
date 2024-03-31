import { Vector2 } from '../../utils/vector2.js';
import { UIBase } from '../uiBase.js';

export const RotMGSprite = (function () {
    return class RotMGSprite extends UIBase {
        constructor(rootSize, options) {
            super({
                ...options
            });

            this.frameRate = options.frameRate || 1 / 30;
            this.frames = options.frames || [];
            this.currentFrame = 0;
            this.lastFrameSet = -Infinity;
            this.loopRegion = options.loopRegion || null;
            this.isPlaying = false;

            this.rootSize = rootSize;
            this.size = Vector2.zero;
            this.pixels = new Uint8ClampedArray(0);
            this.canvas = null;

            this.setFrame(this.currentFrame);
        }

        static RotMGify(pixels, width, height) {
            // add two pixels of padding to the image
            let newWidth = width + 2, newHeight = height + 2;
            let resultPixels = new Uint8ClampedArray(newWidth * newHeight * 4).fill(0);

            // copy the original pixels to the new array
            // and move them to the right and down by one pixel
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const sourceIndex = (y * width + x) * 4;
                    const destinationIndex = ((y + 1) * newWidth + (x + 1)) * 4;

                    for (let channel = 0; channel < 4; channel++) {
                        resultPixels[destinationIndex + channel] = pixels[sourceIndex + channel];
                    }
                }
            }

            // now we can upscale the image by 5x
            resultPixels = RotMGSprite.upscale(resultPixels, newWidth, newHeight, 5);

            // apply the black outline
            resultPixels = RotMGSprite.outline(resultPixels, newWidth * 5, newHeight * 5);

            return resultPixels;
        }

        static upscale(pixels, width, height, scale) {
            // calculate new size for the final image
            const newWidth = width * scale;
            const newHeight = height * scale;

            // store pixels for the new upscaled image
            const resultPixels = new Uint8ClampedArray(newWidth * newHeight * 4).fill(0);

            for (let y = 0; y < newHeight; y++) {
                for (let x = 0; x < newWidth; x++) {
                    const sourceX = Math.floor(x / scale);
                    const sourceY = Math.floor(y / scale);

                    const sourceIndex = (sourceY * width + sourceX) * 4;
                    const destinationIndex = (y * newWidth + x) * 4;

                    for (let channel = 0; channel < 4; channel++) {
                        resultPixels[destinationIndex + channel] = pixels[sourceIndex + channel];
                    }
                }
            }

            return resultPixels;
        }

        static outline(pixels, width, height) {
            // copy pixels
            pixels = new Uint8ClampedArray(pixels);

            const outline = {};

            function getIndex(x, y) {
                return (y * width + x) * 4;
            }

            function isTransparent(x, y) {
                if (x < 0 || y < 0 || x >= width || y >= height) return true; // Handling out of bounds
                const index = getIndex(x, y);
                return pixels[index + 3] === 0;
            }

            function applyOutline(x, y) {
                const index = getIndex(x, y);
                pixels[index] = 0; // R
                pixels[index + 1] = 0; // G
                pixels[index + 2] = 0; // B
                pixels[index + 3] = 255; // A
                outline[`${x},${y}`] = true;

            }

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (isTransparent(x, y)) {
                        continue;
                    }

                    if (outline[`${x},${y}`] ) {
                        continue;
                    }

                    if (isTransparent(x, y - 1)) applyOutline(x, y - 1); // Top
                    if (isTransparent(x - 1, y)) applyOutline(x - 1, y); // Left
                    if (isTransparent(x + 1, y)) applyOutline(x + 1, y); // Right
                    if (isTransparent(x, y + 1)) applyOutline(x, y + 1); // Down
                    if (isTransparent(x - 1, y - 1)) applyOutline(x - 1, y - 1); // Top-left
                    if (isTransparent(x + 1, y - 1)) applyOutline(x + 1, y - 1); // Top-right
                    if (isTransparent(x - 1, y + 1)) applyOutline(x - 1, y + 1); // Bottom-left
                    if (isTransparent(x + 1, y + 1)) applyOutline(x + 1, y + 1); // Bottom-right
                }
            }

            return pixels;
        }

        setFrame(frameIndex) {
            const frame = this.frames[frameIndex];

            if (frame === undefined) {
                return;
            }

            let { pixels, size, canvas, isProcessed } = frame;

            if (canvas === undefined) {
                return;
            }

            if (!isProcessed) {
                pixels = RotMGSprite.RotMGify(pixels, size.x, size.y);
                size = new Vector2((size.x + 2) * 5, (size.y + 2) * 5);
                
                // TODO: change this mess in the future.
                // ideally we can just call putImageData with pixels onto
                // main canvas context but, for some reason
                // putImageData with raw pixels in render()
                // was causing background artifacts
                canvas.width = size.x;
                canvas.height = size.y;
                
                const context = canvas.getContext('2d');
                const imageData = new ImageData(pixels, size.x, size.y);
                
                context.putImageData(imageData, 0, 0);

                // no need to process the same frame again
                frame.isProcessed = true;
                frame.pixels = pixels;
                frame.size = size;
            }

            const realSize = new Vector2((this.rootSize.x + 2) * 5, (this.rootSize.y + 2) * 5);

            this.pixels = pixels;
            this.size = size;
            this.canvas = canvas;
            this.sizeAbsolute = realSize;
            this.currentFrame = frameIndex
        }

        render(context, screenSize) {
            super.render(context, screenSize);

            if (this.pixels.length === 0 || this.canvas === undefined) return;

            let objectPosition = this.getScreenPosition(screenSize);
            const objectSize = this.getScreenSize(screenSize);
            
            context.shadowBlur = 5;
            context.drawImage(this.canvas,
                0, 0,
                this.canvas.width, this.canvas.height,
                objectPosition.x, objectPosition.y,
                this.size.x, this.size.y
            );
            context.shadowBlur = 0;
        }
    }
})();