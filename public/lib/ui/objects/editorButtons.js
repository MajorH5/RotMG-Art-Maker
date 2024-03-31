// class handles creating the buttons for the editor
// that are seen on the left-hand side

import { RotmgButtonBorder } from './rotmgButtonBorder.js';
import { Vector2 } from '../../utils/vector2.js';
import { Event } from '../../utils/event.js';
import { UIBase } from '../uiBase.js';

export const EditorButtons = (function () {
    return class EditorButtons extends UIBase {
        static BUTTON_DRAW = '(D)raw';
        static BUTTON_ERASE = '(E)rase';
        static BUTTON_SAMPLE = 'S(A)mple';
        static BUTTON_UNDO = '(U)ndo';
        static BUTTON_REDO = '(R)edo';
        static BUTTON_CLEAR = '(C)lear';
        static BUTTON_LOAD = '(L)oad';
        static BUTTON_SAVE = '(S)ave';

        constructor (options) {
            super({
                ...options
            });

            this.onButtonSelect = new Event();

            const padding = 10;
            this.primaryButtons = [
                EditorButtons.BUTTON_DRAW,
                EditorButtons.BUTTON_ERASE,
                EditorButtons.BUTTON_SAMPLE,
                EditorButtons.BUTTON_UNDO,
                EditorButtons.BUTTON_REDO,
                EditorButtons.BUTTON_CLEAR
            ];

            for (let i = 0; i < this.primaryButtons.length; i++) {
                const tag = this.primaryButtons[i]
                const button = new RotmgButtonBorder(tag, {
                    position: new Vector2(0, i * 30 + i * padding),
                });

                button.mouseUp.listen(() => {
                    this.onButtonSelect.trigger(tag);
                    
                    if (i < 3) {
                        this.setButtonActive(tag);
                    }
                });

                button.setActive(i === 0);
                button.parentTo(this);
            }
            
            this.secondaryButtons = [
                EditorButtons.BUTTON_LOAD,
                EditorButtons.BUTTON_SAVE
            ];

            for (let i = 0; i < this.secondaryButtons.length; i++) {
                const button = new RotmgButtonBorder(this.secondaryButtons[i], {
                    position: new Vector2(0, (i + this.primaryButtons.length) * 30 + (i + this.primaryButtons.length) * padding + 30),
                });
                button.mouseUp.listen(() => {
                    this.onButtonSelect.trigger(this.secondaryButtons[i]);
                });
                button.parentTo(this);
            }
        }

        setButtonActive (button) {
            let index = this.primaryButtons.indexOf(button);

            for (let i = 0; i < this.children.length; i++) {
                if (i > 2) return;

                this.children[i].setActive(i === index);
            }
        }
    }
})();