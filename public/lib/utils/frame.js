import { Vector2 } from "./vector2.js";

export const Frame = (function () {
    return class Frame {
        constructor (size) {
            this.size = size;
            this.pixels = [];

            this.parentLink = null;
            this.childLinks = [];

            this.cachedImage = null;
            this.dirty = false;

            for (let y = 0; y < size.y; y++) {
                this.pixels[y] = [];

                for (let x = 0; x < size.x; x++) {
                    this.pixels[y][x] = null;
                }
            }
        }
        
        link (frame, isActive = true) {
            // TODO: when new parent is linked, unlink from old parent children links

            this.parentLink = frame === undefined ? this.parentLink : frame;

            const index = this.parentLink.childLinks.findIndex(link => link.target === this);

            if (index !== -1) {
                this.parentLink.childLinks[index].active = isActive;
            } else {
                this.parentLink.childLinks.push({
                    target: this,
                    active: isActive
                });
            }
        }

        unlink () {
            if (this.parentLink !== null) {
                const link = this.parentLink.childLinks.find(link => link.target === this);
                link.active = false;
            }
        }

        set (position, value, isFromLink = false) {
            if (!isFromLink && this.parentLink !== null) {
                this.unlink();
            }

            this.pixels[position.y][position.x] = value;

            this.childLinks.forEach(link => {
                if (!link.active) return;
                link.target.set(position, value, true);
            });

            this.cachedImage = null;
            this.dirty = false;
        }

        get (position) {
            return this.pixels[position.y][position.x];
        }

        clear () {
            for (let y = 0; y < this.size.y; y++) {
                for (let x = 0; x < this.size.x; x++) {
                    this.set(new Vector2(x, y), null);
                }
            }
            this.cachedImage = null;
            this.dirty = true;
            this.link();
        }

        unify () {
            const parent = this.getParent();

            for (let y = 0; y < this.size.y; y++) {
                for (let x = 0; x < this.size.x; x++) {
                    const color = parent.get(new Vector2(x, y));
                    this.set(new Vector2(x, y), color, true);
                }
            }

            this.dirty = false;
        }

        compare (frame) {
            for (let y = 0; y < this.size.y; y++) {
                for (let x = 0; x < this.size.x; x++) {
                    if (this.get(new Vector2(x, y)) !== frame.get(new Vector2(x, y))) {
                        return false;
                    }
                }
            }

            return true;
        }
        
        isDirty () {
            return this.dirty;
        }

        getParent () {
            return this.parentLink;
        }

        getPixels () {
            if (this.cachedImage !== null) {
                return this.cachedImage;
            }

            const pixels = new Uint8ClampedArray(this.size.x * this.size.y * 4);

            for (let y = 0; y < this.size.y; y++) {
                for (let x = 0; x < this.size.x; x++) {
                    const index = (y * this.size.x + x) * 4;
                    const color = this.pixels[y][x];

                    let r = 0, g = 0, b = 0, a = 0 ;

                    if (color !== null) {
                        r = parseInt(color.substring(1, 3), 16);
                        g = parseInt(color.substring(3, 5), 16);
                        b = parseInt(color.substring(5, 7), 16);
                        a = 255;
                    }

                    pixels[index] = r;
                    pixels[index + 1] = g;
                    pixels[index + 2] = b;
                    pixels[index + 3] = a;
                }
            }

            this.cachedImage = pixels;

            return pixels;
        }
    }
})();