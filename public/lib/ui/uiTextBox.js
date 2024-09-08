// class for basic functioning of text box

import { Constants } from "../utils/constants.js";
import { Event } from "../utils/event.js";
import { Vector2 } from "../utils/vector2.js";
import { UIText } from "./uiText.js";

export const UITextBox = (function () {
    return class UITextBox extends UIText {
        static current = null;
        static mobileInputs = document.getElementById('mobile-inputs');
        static canvasElement = document.getElementById('canvas');

        static {
            document.oncopy = (event) => {
                if (UITextBox.current !== null && UITextBox.current.focused) {
                    UITextBox.current.oncopy(event);
                }
            }

            document.oncut = (event) => {
                if (UITextBox.current !== null && UITextBox.current.focused) {
                    UITextBox.current.oncut(event);
                }
            }

            document.onpaste = (event) => {
                if (UITextBox.current !== null && UITextBox.current.focused) {
                    UITextBox.current.onpaste(event);
                }
            }

            if (Constants.MOBILE_ENVIRONMENT) {
                UITextBox.mobileInputs.addEventListener('keydown', (event) => {
                    if (UITextBox.current !== null) {
                        UITextBox.current.handleKeyInput(event);
                    }

                    event.preventDefault();
                });
            }
        }

        constructor(placeholder, options) {
            super('', options);

            this.maxInputLength = options.maxInputLength || Infinity;
            this.placeholderColor = options.placeholderColor || '#aaaaaa';

            this.textXAlignment = options.textXAlignment || 'left';
            this.textYAlignment = options.textYAlignment || 'top';

            this.lastCursorFlash = 0;
            this.cursorVisible = false;

            this.cursorPosition = 0;
            this.selectionStart = 0;
            this.selectionEnd = 0;
            this.selectionAnchor = 0;
            this.textEditable = typeof options.textEditable === "boolean" ? options.textEditable : true;

            this.clipChildren = typeof options.clipChildren !== 'undefined' ? options.clipChildren : true;

            this.multiline = typeof options.multiline !== 'undefined' ? options.multiline : false;
            this.placeholder = placeholder;
            this.focused = false;
            this.context = null;

            this.submit = new Event();
            this.onInput = new Event();
            this.onFocus = new Event();
            this.onBlur = new Event();

            let isHeld = false;

            this.mouseDown.listen((position, mouse) => {
                this.focus();
                this.cursorPosition = this.positionToIndex(position);
                this.selectionStart = this.selectionEnd = this.cursorPosition;
                this.selectionAnchor = this.cursorPosition;


                const listener = (position) => {
                    if (isHeld) {
                        const cursorPosition = this.positionToIndex(position);
                        
                        if (cursorPosition < this.selectionAnchor) {
                            this.selectionStart = cursorPosition;
                            this.selectionEnd = this.selectionAnchor;
                        } else if (cursorPosition > this.selectionAnchor) {
                            this.selectionStart = this.selectionAnchor;
                            this.selectionEnd = cursorPosition;
                        } else {
                            this.selectionStart = this.selectionEnd = cursorPosition;
                        }
                        
                        this.cursorPosition = cursorPosition;
                        this.lastCursorFlash = Date.now();
                        this.cursorVisible = true;
                    }
                };

                mouse.mouseMoved.listen(listener);
                mouse.mouseUp.listenOnce(() => {
                    mouse.mouseMoved.unlisten(listener);
                })

                isHeld = true;
            });

            // this.mouseMove.listen();

            this.mouseUp.listen(() => isHeld = false);
            this.onInput.listen(() => isHeld = false);
        }

        handleKeyInput(event) {
            if (!this.focused || !this.textEditable) return;

            this.cursorVisible = true;
            this.lastCursorFlash = Date.now();

            const { key, ctrlKey, shiftKey } = event;

            if (ctrlKey && !['c', 'x', 'v'].includes(key.toLowerCase())) {
                event.preventDefault();
            }

            switch (key) {
                case 'Backspace':
                    if (this.selectionStart === this.selectionEnd) {
                        if (ctrlKey) {
                            // remove word
                            let start = this.cursorPosition;
                            let end = this.cursorPosition;

                            while (start > 0 && this.text[start] !== ' ') start--;
                            while (end < this.text.length && this.text[end] !== ' ') end++;

                            this.text = this.text.substring(0, start) + this.text.substring(end);
                            this.cursorPosition = start;
                            this.selectionStart = 0;
                            this.selectionEnd = 0;
                        } else {
                            this.text = this.text.substring(0, this.cursorPosition - 1) + this.text.substring(this.cursorPosition);

                            if (this.cursorPosition > 0) {
                                this.cursorPosition--;
                            }
                        }
                    } else {
                        this.text = this.text.substring(0, this.selectionStart) + this.text.substring(this.selectionEnd);
                        this.cursorPosition = this.selectionStart;
                        this.selectionStart = 0;
                        this.selectionEnd = 0;
                    }
                    this.onInput.trigger(this.text);
                    break;
                case 'ArrowLeft':
                    if (this.selectionStart !== this.selectionEnd) {
                        this.cursorPosition = this.selectionStart;
                        this.selectionStart = this.selectionEnd = 0;
                    } else {
                        if (this.cursorPosition > 0) {
                            this.cursorPosition--;
                        }
                    }
                    break;
                case 'ArrowRight':
                    if (this.selectionStart !== this.selectionEnd) {
                        this.cursorPosition = this.selectionEnd;
                        this.selectionStart = this.selectionEnd = 0;
                    } else {
                        if (this.cursorPosition < this.text.length) {
                            this.cursorPosition++;
                        }
                    }
                    break;
                case 'ArrowUp':
                    break;
                case 'ArrowDown':
                    break;
                case 'Enter':
                    if (this.multiline) {
                        this.text = this.text.substring(0, this.cursorPosition) + '\n' + this.text.substring(this.cursorPosition);
                        this.cursorPosition++;
                    } else {
                        this.submit.trigger(this.text);
                        this.focused = false;
                    }
                    break;
                case 'Escape':
                    this.blur();
                    break;
                default:
                    if (key.length === 1) {
                        if (ctrlKey) {
                            switch (key.toLowerCase()) {
                                case 'a':
                                    this.selectionStart = 0;
                                    this.selectionEnd = this.text.length;
                                    this.cursorPosition = this.selectionEnd;
                                    break;
                                // case 'v':
                                //     navigator.clipboard.readText().then((text) => {
                                //         const maxAllowed = Math.min(this.maxInputLength - this.text.length, text.length);
                                //         text = text.substring(0, maxAllowed);

                                //         if (this.selectionStart === this.selectionEnd) {
                                //             this.text = this.text.substring(0, this.cursorPosition) + text + this.text.substring(this.cursorPosition);
                                //         } else {
                                //             this.text = this.text.substring(0, this.selectionStart) + text + this.text.substring(this.selectionEnd);
                                //             this.cursorPosition = this.selectionStart;
                                //             this.selectionStart = this.selectionEnd = 0;
                                //         }
                                        
                                //         this.cursorPosition += text.length;
                                //         this.onInput.trigger(this.text, text);
                                //     });
                                //     break;
                                // case 'c':
                                // case 'x':
                                //     if (this.selectionStart !== this.selectionEnd) {
                                //         navigator.clipboard.writeText(this.text.substring(this.selectionStart, this.selectionEnd));

                                //         if (key === 'x') {
                                //             this.text = this.text.substring(0, this.selectionStart) + this.text.substring(this.selectionEnd);
                                //             this.cursorPosition = this.selectionStart;
                                //             this.selectionStart = this.selectionEnd = 0;
                                //         }
                                //     }
                                //     break;
                            }
                            return;
                        }

                        if (this.text.length < this.maxInputLength || this.selectionStart !== this.selectionEnd) {
                            if (this.selectionStart === this.selectionEnd) {
                                this.text = this.text.substring(0, this.cursorPosition) + key + this.text.substring(this.cursorPosition);
                            } else {
                                this.text = this.text.substring(0, this.selectionStart) + key + this.text.substring(this.selectionEnd);
                                this.cursorPosition = this.selectionStart;
                                this.selectionStart = this.selectionEnd = 0;
                            }
                            this.cursorPosition++;
                            this.onInput.trigger(this.text, key);
                        }
                    }
                    break;
            }
        }

        oncopy (event) {
            event.preventDefault();
            event.clipboardData.setData('text/plain', this.text.substring(this.selectionStart, this.selectionEnd));
        }

        oncut (event) {
            if (!this.textEditable) return;
            
            event.preventDefault();
            event.clipboardData.setData('text/plain', this.text.substring(this.selectionStart, this.selectionEnd));
            this.text = this.text.substring(0, this.selectionStart) + this.text.substring(this.selectionEnd);
            this.cursorPosition = this.selectionStart;
            this.selectionStart = this.selectionEnd = 0;
            this.onInput.trigger(this.text);
        }

        onpaste (event) {
            if (!this.textEditable) return;

            event.preventDefault();
            let text = event.clipboardData.getData('text/plain');
            const maxAllowed = Math.min(this.maxInputLength - this.text.length, text.length);
            text = text.substring(0, maxAllowed);

            if (this.selectionStart === this.selectionEnd) {
                this.text = this.text.substring(0, this.cursorPosition) + text + this.text.substring(this.cursorPosition);
            } else {
                this.text = this.text.substring(0, this.selectionStart) + text + this.text.substring(this.selectionEnd);
                this.cursorPosition = this.selectionStart;
                this.selectionStart = this.selectionEnd = 0;
            }
            
            this.cursorPosition += text.length;
            this.onInput.trigger(this.text, text);
        }

        focus() {
            if (!this.textEditable) {
                return;
            }

            if (UITextBox.current !== null) {
                UITextBox.current.blur();
            }

            this.focused = true;
            this.cursorVisible = true;
            this.lastCursorFlash = Date.now();

            UITextBox.current = this;
            this.onFocus.trigger();
        }

        blur() {
            this.focused = false;

            if (UITextBox.current === this) {
                UITextBox.current = null;
            }

            this.selectionStart = 0;
            this.selectionEnd = 0;
            this.onBlur.trigger();
        }

        positionToIndex(position) {
            const context = this.context;

            const text = this.getRenderedText();

            const objectPosition = this.getScreenPosition(this.lastScreenSize);
            const objectSize = this.getScreenSize(this.lastScreenSize);

            const lines = this.textWraps ? this.getLines(context, text, objectSize.x) : [text];
            const relative = position.subtract(objectPosition).subtract(new Vector2(this.paddingLeft, this.paddingTop));
            const lineHeight = this.fontSize + 5;

            let targetLineIndex = Math.floor(relative.y / lineHeight);

            targetLineIndex = Math.max(0, targetLineIndex);
            targetLineIndex = Math.min(lines.length - 1, targetLineIndex);

            const targetLine = lines[targetLineIndex];

            let targetCharacterIndex = Infinity;

            for (let i = 0; i < targetLine.length; i++) {
                const previousWidth = context.measureText(targetLine.substring(0, i - 1)).width;
                const currentWidth = context.measureText(targetLine.substring(i, i + 1)).width;

                if (previousWidth + currentWidth > relative.x) {
                    targetCharacterIndex = i - 1;
                    break;
                }
            }

            targetCharacterIndex = Math.min(targetCharacterIndex, targetLine.length);

            for (let i = 0; i < targetLineIndex; i++) {
                targetCharacterIndex += lines[i].length;
            }

            return Math.max(0, targetCharacterIndex);
        }

        update(deltaTime) {
            super.update(deltaTime);

            // update cursors current state
            if (this.lastCursorFlash + 500 < Date.now()) {
                this.cursorVisible = !this.cursorVisible;
                this.lastCursorFlash = Date.now();
            }

            if (!this.textEditable && this.focused) {
                this.blur();
            }
        }

        render(context, screenSize) {
            this.textFocal = this.focused ? this.cursorPosition : -1;

            super.render(context, screenSize);

            context.save();

            const text = this.getRenderedText();

            const objectPosition = this.getScreenPosition(screenSize);
            const objectSize = this.getScreenSize(screenSize);

            if (this.clipChildren) {
                const path = new Path2D();
                path.rect(objectPosition.x, objectPosition.y, objectSize.x, objectSize.y);
                context.clip(path);
            }


            if (text === '' && !this.focused) {
                this.renderText(context, screenSize, this.placeholder, this.placeholderColor);
            }

            // TODO: selection rendering
            if (this.selectionStart !== this.selectionEnd) {
                const lines = this.textWraps ? this.getLines(context, text, objectSize.x) : [text];

                for (let i = 0, textIndex = 0; i < lines.length; i++) {
                    const line = lines[i];

                    const lineStartIndex = textIndex;
                    const lineEndIndex = lineStartIndex + line.length;

                    const selectionPosition = objectPosition.clone();
                    const selectionSize = new Vector2(0, this.fontSize + 5);

                    if (this.selectionStart <= lineStartIndex && this.selectionEnd >= lineEndIndex) {
                        // this entire line should be highlighted
                        selectionSize.x = context.measureText(line).width;
                    } else if (this.selectionStart >= lineStartIndex || this.selectionEnd <= lineEndIndex) {
                        const start = this.selectionStart - lineStartIndex, end = this.selectionEnd - lineStartIndex;
                        selectionSize.x = context.measureText(line.substring(start, end)).width;
                        selectionPosition.x += context.measureText(line.substring(0, start)).width;
                    }

                    selectionPosition.y += i * (this.fontSize + 5);
                    selectionPosition.x += this.paddingLeft;
                    selectionPosition.y += this.paddingTop;

                    context.globalAlpha = 0.25;
                    context.fillStyle = '#0000ff';
                    context.fillRect(selectionPosition.x, selectionPosition.y,
                        selectionSize.x, selectionSize.y);

                    textIndex += line.length;
                }
            }

            // cursor rendering
            if (this.focused && this.cursorVisible) {
                const cursorPosition = objectPosition.clone();
                const cursorIndex = this.cursorPosition;

                if (this.textWraps) {
                    // we need to determine which line the cursor
                    // is currently residing at
                    const lines = this.getLines(context, text, objectSize.x);

                    for (let i = 0, textIndex = 0; i < lines.length; i++) {
                        const line = lines[i];

                        if (cursorIndex > textIndex && cursorIndex <= textIndex + line.length) {
                            cursorPosition.y += i * (this.fontSize + 5); // TODO: better logic for determining line height
                            cursorPosition.x += context.measureText(line.substring(0, cursorIndex - textIndex)).width;
                            break;
                        }

                        textIndex += line.length;
                    }
                } else {
                    cursorPosition.x += context.measureText(text.substring(0, cursorIndex)).width;
                }

                cursorPosition.x += this.paddingLeft;
                cursorPosition.y += this.paddingTop;

                context.fillStyle = '#ffffff';
                context.globalAlpha = 1;
                context.fillRect(cursorPosition.x, cursorPosition.y, 1, this.fontSize);
            }

            this.context = context;
            context.restore();
        }

    }
})();