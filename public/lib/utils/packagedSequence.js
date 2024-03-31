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

            return packagedSequence;
        }

        static fromJSON (json) {
            json.size = new Vector2(json.size.x, json.size.y);
            const packagedSequence = new PackagedSequence(json.size);
            
            packagedSequence.stand = new Frame(json.size);
            packagedSequence.stand.pixels = json.stand;

            packagedSequence.walk1 = new Frame(json.size);
            packagedSequence.walk1.pixels = json.walk1;

            packagedSequence.walk2 = new Frame(json.size);
            packagedSequence.walk2.pixels = json.walk2;

            packagedSequence.attack1 = new Frame(json.size);
            packagedSequence.attack1.pixels = json.attack1;

            packagedSequence.attack2 = new Frame(new Vector2(json.size.x * 2, json.size.y));
            packagedSequence.attack2.pixels = json.attack2;

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

        toJSON () {
            return JSON.stringify({
                'stand': this.stand.pixels,
                'attack1': this.attack1.pixels,
                'attack2': this.attack2.pixels,
                'walk1': this.walk1.pixels,
                'walk2': this.walk2.pixels,
                'size': {x: this.size.x, y: this.size.y}
            }); 
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