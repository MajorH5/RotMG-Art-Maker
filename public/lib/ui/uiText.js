import { Constants } from "../utils/constants.js";
import { Vector2 } from "../utils/vector2.js";
import { UIBase } from "./uiBase.js";

export const UIText = (function () {
    return class UIText extends UIBase {
        static FONT_MYRIADPRO_REGULAR = new FontFace('myriadpro',
            `url(${Constants.ORIGIN}/assets/fonts/myriadpro_regular.otf)`);
        static FONT_MYRIADPRO_BOLD = new FontFace('myriadpro_bold',
            `url(${Constants.ORIGIN}/assets/fonts/myriadpro_bold.otf)`);
        static FONT_MYRIADPRO_LIGHT = new FontFace('myriadpro_light',
            `url(${Constants.ORIGIN}/assets/fonts/myriadpro_light.otf)`);

        static DEFAULT_FONT = "myriadpro";

        static {
            const fonts = [
                UIText.FONT_MYRIADPRO_REGULAR,
                UIText.FONT_MYRIADPRO_BOLD,
                UIText.FONT_MYRIADPRO_LIGHT
            ];

            fonts.forEach(font => {
                font.load().then(font => {
                    document.fonts.add(font);
                });
            });
        }

        // creates a new UI text object
        constructor (text, options) {
            super(options);

            this.text = text;
            this.displayText = options.displayText || '';
            this.font = options.font || UIText.DEFAULT_FONT;
            this.fontSize = options.fontSize || 16;
            this.fontColor = options.fontColor || "black";
            this.lineHeight = options.lineHeight || 5;
            this.textTransparency = typeof options.textTransparency === 'number' ? options.textTransparency : 1;

            this.paddingLeft = options.paddingLeft || 0;
            this.paddingTop = options.paddingTop || 0;
            this.paddingRight = options.paddingRight || 0;
            this.paddingBottom = options.paddingBottom || 0; // TODO: how to enforce this??
            
            this.textXAlignment = options.textXAlignment || "center";
            this.textYAlignment = options.textYAlignment || "center";

            this.textWraps = typeof options.textWraps === 'boolean' ? options.textWraps : true;
            this.textShadowBlur = options.textShadowBlur || 0;
            this.textFocal = typeof options.textFocal === 'number' ? options.textFocal : -1;
        }

        // clones the text object
        clone () {
            return new UIText(this.text, this);
        }

        // draws the text to the screen
        render (context, screenSize) {
            super.render(context, screenSize);
            this.renderText(context, screenSize, this.getRenderedText());
        }

        getRenderedText () {
            return this.displayText || this.text;
        }

        getLines(context, text, maxWidth) {
            // returns the given content string split into
            // lines that fit the given max width if possible.
            // note: modified to support word breaking and spacing
            // https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element

            maxWidth = Math.max(maxWidth - (this.paddingLeft + this.paddingRight), 0);

            var words = text.split(" ");
            var lines = [];
            var currentLine = '';
        
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                const space = (i > 0 ? " " : "");
                var width = context.measureText(currentLine + space + word).width;

                if (width < maxWidth) {
                    currentLine += space + word;
                } else {
                    currentLine += (i > 0 ? space : "") + word;

                    // break apart single long word into smaller
                    // parts which fit onto their own lines
                    const subchunks = [];
                    let wordWasBroken = false;
                    let fullLength = word.length;

                    while (context.measureText(word).width > maxWidth) {
                        let i = 0;

                        do {
                            i++;
                        } while (context.measureText(word.substring(0, i)).width < maxWidth && i < word.length);

                        // enforce acceptance of one character at minimum
                        i = Math.max(1, i - 1);

                        subchunks.push(word.substring(0, i));
                        word = word.substring(i, word.length);
                        wordWasBroken = true;
                    }
                    
                    if (fullLength < currentLine.length) {
                        lines.push(currentLine.substring(0, currentLine.length - fullLength));
                    }
                    
                    for (let i = 0; i < subchunks.length; i++) {
                        lines.push(subchunks[i]);
                    }
                                        
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }
        
        splitWord(word, maxWidth, context) {
            // Split a long word into multiple lines that fit within maxWidth
            const wordParts = [];
            let currentPart = '';
        
            for (let i = 0; i < word.length; i++) {
                const testPart = currentPart + word[i];
                const width = context.measureText(testPart).width;
        
                if (width <= maxWidth) {
                    currentPart = testPart;
                } else {
                    wordParts.push(currentPart);
                    currentPart = word[i];
                }
            }
        
            if (currentPart) {
                wordParts.push(currentPart);
            }
        
            return wordParts;
        }
        

        // renders the text to the screen
        renderText (context, screenSize, text, color=this.fontColor) {
            const rootPosition = this.getScreenPosition(screenSize);
            const size = this.getScreenSize(screenSize);
            
            context.font = `${this.fontSize}px ${this.font}`;
            context.fillStyle = color;
            context.textAlign = 'left';
            context.globalAlpha = this.textTransparency;
            context.shadowBlur = this.textShadowBlur;

            if (this.shadow) {
                context.shadowColor = this.shadowColor;
                context.shadowBlur = this.shadowBlur;
                context.shadowOffsetX = this.shadowOffset.x;
                context.shadowOffsetY = this.shadowOffset.y;
            }

            // context.save();

            // if (this.clipChildren) {
            //     const path = new Path2D();
            //     path.rect(rootPosition.x, rootPosition.y, size.x, size.y);
            //     context.clip(path);
            // }

            const lines = this.textWraps ? this.getLines(context, text, size.x) : text.split('\n');
            const textHeight = (this.fontSize + 5) * lines.length;

            if (this.textWraps) {
                for (let i = 0; i < lines.length; i++) {
                    const position = new Vector2(rootPosition.x, rootPosition.y + (this.fontSize + this.lineHeight) * i);
                    const textWidth = context.measureText(lines[i]).width;
    
                    position.y += this.fontSize;
        
                    // align the text on y axis
                    if (this.textYAlignment === "center") {
                        position.y += size.y / 2 - textHeight / 2;
                        position.y += this.paddingTop - this.paddingBottom;
                    } else if (this.textYAlignment === "bottom") {
                        position.y += size.y - textHeight;
                        position.y -= this.paddingTop;
                    } else if (this.textYAlignment === 'top') {
                        position.y += this.paddingTop;
                    }
    
                    if (this.textXAlignment === "center") {
                        position.x += size.x / 2 - textWidth / 2;
                        position.x += this.paddingLeft - this.paddingRight;
                    } else if (this.textXAlignment === "right") {
                        position.x += size.x - textWidth;
                        position.x -= this.paddingLeft;
                    } else if (this.textXAlignment === "left") {
                        position.x += this.paddingLeft;
                    }
    
                    context.fillText(lines[i], position.x, position.y);
                }
            } else {
                // TODO: respect alignment & padding when not wrapping
                const position = new Vector2(rootPosition.x, rootPosition.y + this.fontSize);

                position.x += this.paddingLeft;
                position.y += this.paddingTop

                context.fillText(text, position.x, position.y);
            }
            
            // context.restore();
            context.globalAlpha = 1;
            context.shadowColor = "black";
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        }
    }
})();