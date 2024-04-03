import { Vector2 } from "./vector2.js";

export const Post = (function () {
    return class Post {
        constructor (post) {
            this.animated = post.animated === 1;
            this.createdAt = post.created_at;
            this.postId = post.id;
            this.image = JSON.parse(post.image);
            this.size = new Vector2(this.image.size.x, this.image.size.y);
            this.postName = post.name;
            this.tags = post.tags;
            this.type = post.type;
            this.ownerId = post.user_id;
            this.objectId = post.name;
            this.isAnimatedTexture = this.animated
            this.isLoaded = false;
        }

        async load () {
            if (this.isLoaded) return;
            this.isLoaded = true;
        }

        decodeFrame (frame, size) {
            const image = new Uint8ClampedArray(size.x * size.y * 4);
            
            for (let i = 0; i < frame.length; i++) {
                const imageIndex = i * 4;
                const packed = frame[i];

                if (packed !== -1) {
                    const r = (packed >> 16) & 0xFF;
                    const g = (packed >> 8) & 0xFF;
                    const b = packed & 0xFF;

                    image[imageIndex] = r;
                    image[imageIndex + 1] = g;
                    image[imageIndex + 2] = b;
                    image[imageIndex + 3] = 255;
                }
            }

            return image;
        }

        getTextureFrames () {
            const unprocessed = this.animated ? [
                this.image.stand,
                this.image.walk1,
                this.image.walk2,
                this.image.attack1,
                this.image.attack2
            ] : [this.image.pixels];

            const frames = [];

            for (let i = 0; i < unprocessed.length; i++) {
                const canvas = document.createElement("canvas");
                const size = i !== 4  ? this.size : new Vector2(this.size.x * 2, this.size.y);
                frames.push({
                    size: size,
                    pixels: this.decodeFrame(unprocessed[i], size),
                    canvas: canvas,
                    isProcessed: false
                });
            }

            return frames
        }

        getTextureRect () {
            return [new Vector2(0, 0), this.size];
        }
    }
})();