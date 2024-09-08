import { Constants } from "../../utils/constants.js";
import { Vector2 } from "../../utils/vector2.js";
import { Sprite } from "../sprite.js";

export const Object = (function () {
    return class Object {
        static BASE_TEXTURES_URL = Constants.RESOURCES_URL + '/rotmg/production/current/sheets/';
        static CLASS_CHARACTER = 'Character';

        constructor(rawTextureUrl, rawTextureIndex, objectId, displayId, objectClass, isAnimatedTexture, ownerId = null) {
            this.textureUrl = this.parseTextureUrl(rawTextureUrl);
            this.textureIndex = this.parseTextureIndex(rawTextureIndex);

            this.rawTextureUrl = rawTextureUrl;

            this.objectId = objectId
            this.objectClass = objectClass;
            this.isAnimatedTexture = isAnimatedTexture
            this.ownerId = ownerId;
            this.displayId = displayId;

            this.isLoaded = false;
            this.isLoading = false;
            this.texture = null;
        }

        async load() {
            if (this.isLoaded || this.isLoading) return;

            this.isLoading = true;

            return new Promise((resolve, reject) => {
                Sprite.getImage(this.textureUrl)
                    .then((texture) => {
                        this.isLoading = false;
                        this.isLoaded = true;
                        this.texture = texture;
                        resolve(texture);
                    })
                    .catch((error) => {
                        resolve(null); // TODO: how should this case be handled
                    });
            });
        }

        isType (type) {
            if (type === 'Any Type') {
                return true;
            }

            const lookup = {
                'Equipment': 'Items',
                'Character': 'Entities',
                'GameObject': 'Objects',
                'Pet': 'Character',
                'ConnectedWall': 'Tiles',
                'Wall': 'Tiles',
                'Portal': 'Objects',
                'SpiderWeb': 'Tiles',
                'Player': 'Character',
                'CaveWall': 'Tiles',
                'Projectile': 'Objects',
                'CharacterChanger': 'Objects',
                'YardUpgrader': 'Objects',
                'ReskinVendor': 'Objects',
                'GuildBoard': 'Objects',
                'GuildChronicle': 'Objects',
                'Stalagmite': 'Tiles',
                'Sign': 'Objects',
                'Dye': 'Items',
                'ClosedVaultChest': 'Objects',
            }

            if (lookup[this.objectClass] === undefined) {
                // console.warn('Object.isType: Unrecognized object class', this.objectClass)
                return false;
            }

            return lookup[this.objectClass] === type;
        }

        parseTextureIndex(rawIndex) {
            const isHex = rawIndex.includes('x');
            return parseInt(rawIndex, isHex ? 16 : 10);
        }

        parseTextureUrl(rawTextureUrl) {
            let formedUrl = `${Object.BASE_TEXTURES_URL}${rawTextureUrl}.png`;

            // have to destroy some terms which seem
            // to ruin the lookup for the spritesheet
            // don't ask why, just know it works.

            formedUrl = formedUrl.replace('Embed', '');
            formedUrl = formedUrl.replace('new', 'b');
            formedUrl = formedUrl.replace('skins', 'sSkins');

            if (rawTextureUrl.includes('chars') && rawTextureUrl.indexOf('chars') !== 0) {
                formedUrl = formedUrl.replace('chars', 'Chars');
            }

            if (rawTextureUrl.includes('8x8') && (!rawTextureUrl.includes('Chars') && !rawTextureUrl.includes('chars') && !rawTextureUrl.includes('Objects'))) {
                formedUrl = formedUrl.replace('8x8', '');
            }

            if (rawTextureUrl.includes('16x16') && (!rawTextureUrl.includes('Chars') && !rawTextureUrl.includes('chars') && !rawTextureUrl.includes('Objects'))) {
                formedUrl = formedUrl.replace('16x16', '');
            }
            
            if (rawTextureUrl.includes('16x8') && (!rawTextureUrl.includes('Chars') && !rawTextureUrl.includes('chars') && !rawTextureUrl.includes('Objects'))) {
                formedUrl = formedUrl.replace('16x8', '');
            }

            return formedUrl;
        }

        getTextureRect() {
            if (!this.isLoaded) {
                throw new Error('Object.getTextureRect: Object texture must be loaded before rect can be determined.')
            }
            let wraps = false;

            let width = 8;
            let height = 8;

            // const is16x16 = this.rawTextureUrl.includes('16x16') || this.textureUrl.includes('16x16');
            // const is8x8 = this.rawTextureUrl.includes('8x8') || this.textureUrl.includes('8x8');

            // const is8x8 = this.rawTextureUrl.includes('8x8');
            // const is16x16 = this.rawTextureUrl.includes('16x16');

            // console.log(this.objectId, this.rawTextureUrl,this.textureUrl)

            const is16x8 = this.rawTextureUrl.includes('16x8');
            const is16x16 = this.rawTextureUrl.includes('16x16') ||
                this.rawTextureUrl.includes('16') ||
                this.rawTextureUrl.includes('Big') ||
                this.rawTextureUrl.includes('Divine');
            const is8x8 = this.rawTextureUrl.includes('8x8');
            const is32x32 = this.rawTextureUrl.includes('32x32');

            if (is32x32) {
                width = 32;
                height = 32;
            } else if (is16x8) {
                width = 16;
                height = 8;
            } else if (is16x16) {
                width = 16;
                height = 16;
            } else if (is8x8) {
                width = 8
                height = 8;
            }
            wraps = !this.isAnimatedTexture

            const spritesX = this.texture.width / width;
            const heightScale = this.rawTextureUrl.includes('playerskins') ? 3 : 1;

            const sourceX = wraps ? (this.textureIndex % spritesX) * width : 0;
            const sourceY = wraps ? Math.floor(this.textureIndex / spritesX) * height : this.textureIndex * height * heightScale;

            return [new Vector2(sourceX, sourceY), new Vector2(width, height)];
        }

        getTextureFrames() {
            const isAnimatedCharacter = this.isAnimatedTexture;
            // const isAnimatedCharacter = false;
            if (!this.isLoaded) {
                // throw new Error('Object.getTextureData(): Object texture must be loaded before image data can be read.');
                return [{
                    pixels: new Uint8ClampedArray(0),
                    size: Vector2.zero
                }];
            }

            const [imageRectOffset, imageRectSize] = this.getTextureRect(this.texture);

            
            const horizontalScale = isAnimatedCharacter ? 7 : 1;
            const veritcalScale = isAnimatedCharacter ? 3 : 1;
            
            const frames = [];

            if (isAnimatedCharacter) {
                // [0]: standing animation
                // [1-2]: walking W-E
                // [3]: blank
                // [4-5]: attack W-E (last attack frame is w*2xh)
                // pattern repeats for subsequent N, S animations
                // note sizes of frames: [wxh, wxh, wxh, w*2xh] * 3

                for (let index = 0; index < (horizontalScale - 1) * veritcalScale; index++) {
                    if (index > 0 && index % 3 === 0) {
                        continue; // skip blank frames
                    }

                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');

                    // really the size should be of the frame whenever we are drawing image
                    // but filling whole sheet gauruntees no OOB draws.
                    canvas.width = imageRectSize.x * horizontalScale;
                    canvas.height = imageRectSize.y * veritcalScale;

                    const frameSize = (index === 0 || index % 5 !== 0) ? imageRectSize : new Vector2(imageRectSize.x * 2, imageRectSize.y);
                    const frameOffset = imageRectOffset.add(new Vector2(
                        (index % horizontalScale) * imageRectSize.x,
                        Math.floor(index / horizontalScale) * imageRectSize.y
                    ));

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(this.texture,
                        frameOffset.x, frameOffset.y,
                        frameSize.x, frameSize.y,
                        0, 0,
                        frameSize.x, frameSize.y);

                    const imageData = context.getImageData(0, 0, frameSize.x, frameSize.y);
                    const pixels = imageData.data;
                    frames.push({
                        size: frameSize,
                        pixels: pixels,
                        canvas: canvas,
                        isProcessed: false
                    });
                }
            } else {
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');
                
                canvas.width = imageRectSize.x * horizontalScale;
                canvas.height = imageRectSize.y * veritcalScale;

                context.drawImage(this.texture,
                    imageRectOffset.x, imageRectOffset.y,
                    imageRectSize.x * horizontalScale, imageRectSize.y * veritcalScale,
                    0, 0,
                    imageRectSize.x * horizontalScale, imageRectSize.y * veritcalScale);

                const imageData = context.getImageData(0, 0, imageRectSize.x, imageRectSize.y);
                const pixels = imageData.data;
                frames.push({
                    size: imageRectSize,
                    pixels: pixels,
                    canvas: canvas,
                    isProcessed: false
                });
            }

            return frames;
        }
    }
})();