import { Vector2 } from './vector2.js';
import { Frame } from './frame.js';

export const PackagedSequence = (function () {
    return class PackagedSequence {

        static STAND = 'Stand';
        static WALK1 = 'Walk 1';
        static WALK2 = 'Walk 2';
        static ATTACK1 = 'Attack 1';
        static ATTACK2 = 'Attack 2';

        static DEFAULT_FRAME_RATE_MS = 1000 / 5;

        constructor (size) {
            this.size = size;

            this.stand = new Frame(size);

            this.walk1 = new Frame(size);
            this.walk1.link(this.stand);

            this.walk2 = new Frame(size);;
            this.walk2.link(this.stand);

            this.attack1 = new Frame(size);
            this.attack1.link(this.stand);

            const attack2Size = new Vector2(size.x * 2, size.y);
            this.attack2 = new Frame(attack2Size);
            this.attack2.link(this.stand);

            this.frameRate = PackagedSequence.DEFAULT_FRAME_RATE_MS;
        }

        static fromFrames (frames, size) {
            const packagedSequence = new PackagedSequence(size);

            packagedSequence.stand = new Frame(size);
            packagedSequence.stand.pixels = PackagedSequence.convertUInt8ArrayToHex(frames[0].pixels, size.x);

            packagedSequence.walk1 = new Frame(size);
            packagedSequence.walk1.pixels = PackagedSequence.convertUInt8ArrayToHex(frames[1].pixels, size.x);

            packagedSequence.walk2 = new Frame(size);
            packagedSequence.walk2.pixels = PackagedSequence.convertUInt8ArrayToHex(frames[2].pixels, size.x);

            packagedSequence.attack1 = new Frame(size);
            packagedSequence.attack1.pixels = PackagedSequence.convertUInt8ArrayToHex(frames[3].pixels, size.x);

            packagedSequence.attack2 = new Frame(new Vector2(size.x * 2, size.y));
            packagedSequence.attack2.pixels = PackagedSequence.convertUInt8ArrayToHex(frames[4].pixels, size.x * 2);

            packagedSequence.walk1.link(packagedSequence.stand, packagedSequence.walk1.compare(packagedSequence.stand));
            packagedSequence.walk2.link(packagedSequence.stand, packagedSequence.walk2.compare(packagedSequence.stand));
            packagedSequence.attack1.link(packagedSequence.stand, packagedSequence.attack1.compare(packagedSequence.stand));
            packagedSequence.attack2.link(packagedSequence.stand, packagedSequence.attack2.compare(packagedSequence.stand));
            
            return packagedSequence;
        }

        static fromJSON (json) {
            json.size = new Vector2(json.size.x, json.size.y);
            const packagedSequence = new PackagedSequence(json.size);
            
            packagedSequence.stand = new Frame(json.size);
            packagedSequence.stand.pixels = PackagedSequence.decompress(json.stand, json.size.x, json.size.y);

            packagedSequence.walk1 = new Frame(json.size);
            packagedSequence.walk1.pixels = PackagedSequence.decompress(json.walk1, json.size.x, json.size.y);

            packagedSequence.walk2 = new Frame(json.size);
            packagedSequence.walk2.pixels = PackagedSequence.decompress(json.walk2, json.size.x, json.size.y);

            packagedSequence.attack1 = new Frame(json.size);
            packagedSequence.attack1.pixels = PackagedSequence.decompress(json.attack1, json.size.x, json.size.y);
            
            packagedSequence.attack2 = new Frame(new Vector2(json.size.x * 2, json.size.y));
            packagedSequence.attack2.pixels = PackagedSequence.decompress(json.attack2, json.size.x * 2, json.size.y);
            
            packagedSequence.walk1.link(packagedSequence.stand, packagedSequence.walk1.compare(packagedSequence.stand));
            packagedSequence.walk2.link(packagedSequence.stand, packagedSequence.walk2.compare(packagedSequence.stand));
            packagedSequence.attack1.link(packagedSequence.stand, packagedSequence.attack1.compare(packagedSequence.stand));
            packagedSequence.attack2.link(packagedSequence.stand, packagedSequence.attack2.compare(packagedSequence.stand));

            return packagedSequence;
        }

        static convertUInt8ArrayToHex (array, width, height) {
            function decimalToHex(decimal) {
                let hex = decimal.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }

            let hexColors = [];
            for (let i = 0; i < array.length; i += 4) {
                const x = i / 4 % width;
                const y = Math.floor(i / 4 / width);

                if (hexColors[y] === undefined) {
                    hexColors[y] = [];
                }

                let r = array[i];
                let g = array[i + 1];
                let b = array[i + 2];
                let a = array[i + 3];

                let hexColor = "#" + decimalToHex(r) + decimalToHex(g) + decimalToHex(b);

                if (a === 0) {
                    hexColors[y][x] = null;
                } else {
                    hexColors[y][x] = hexColor;
                }
            }

            return hexColors;
        }

        static compress (array, width, height) {
            let colors = new Array(width * height).fill(-1);

            for (let y = 0; y < array.length; y++) {
                for (let x = 0; x < array[y].length; x++) {
                    const i = y * array[y].length + x;

                    if (array[y][x] === null) {
                        colors[i] = -1
                    } else {
                        // pack into a single number
                        const color = array[y][x];
                        const r = parseInt(color.substring(1, 3), 16);
                        const g = parseInt(color.substring(3, 5), 16);
                        const b = parseInt(color.substring(5, 7), 16);

                        const packed = (r << 16) | (g << 8) | b;
                        colors[i] = packed;
                    }
                }
            }

            return colors;
        
        }

        static decompress (array, width, height) {
            let colors = new Array(width * height).fill(null);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = y * width + x;

                    if (array[i] === -1) {
                        colors[y][x] = null;
                    } else {
                        const r = (array[i] >> 16) & 0xFF;
                        const g = (array[i] >> 8) & 0xFF;
                        const b = array[i] & 0xFF;

                        colors[y][x] = "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
                    }
                }
            }

            return colors;
        }

        toJSON () {
            return {
                'stand': PackagedSequence.compress(this.stand.pixels, this.size.x, this.size.y),
                'walk1': PackagedSequence.compress(this.walk1.pixels, this.size.x, this.size.y),
                'walk2': PackagedSequence.compress(this.walk2.pixels, this.size.x, this.size.y),
                'attack1': PackagedSequence.compress(this.attack1.pixels, this.size.x, this.size.y),
                'attack2': PackagedSequence.compress(this.attack2.pixels, this.size.x * 2, this.size.y),
                'size': {x: this.size.x, y: this.size.y}
            };
        }

        edit (frame, position, value) {
            let framObject = null;

            switch (frame) {
                case PackagedSequence.WALK1:
                    framObject = this.walk1;
                    break;
                case PackagedSequence.WALK2:
                    framObject = this.walk2;
                    break;
                case PackagedSequence.ATTACK1:
                    framObject = this.attack1;
                    break;
                case PackagedSequence.ATTACK2:
                    framObject = this.attack2;
                    break;
                default:
                    return;
            }

            framObject.set(position, value);
        }

        get (frame) {
            switch (frame) {
                case PackagedSequence.STAND:
                    return this.stand;
                case PackagedSequence.WALK1:
                    return this.walk1;
                case PackagedSequence.WALK2:
                    return this.walk2;
                case PackagedSequence.ATTACK1:
                    return this.attack1;
                case PackagedSequence.ATTACK2:
                    return this.attack2;
                default:
                    return null;
            }
        }

        getAnimation (animation) {
            switch (animation) {
                case PackagedSequence.STAND:
                    return [this.stand];
                case PackagedSequence.WALK1:
                    return [this.walk1, this.walk2];
                case PackagedSequence.ATTACK1:
                    return [this.attack1, this.attack2];
                default:
                    return null;
            }
        }
    }
})();