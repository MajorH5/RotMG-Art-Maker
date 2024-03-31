import { RotmgButtonBorder } from "./objects/rotmgButtonBorder.js";
import { Vector2 } from "../utils/vector2.js";
import { UIBase } from "./uiBase.js";
import { UIText } from "./uiText.js";
import { Constants } from "../utils/constants.js";
import { Event } from "../utils/event.js";

export const UIDropdownMenu = (function () {
    return class UIDropdownMenu extends RotmgButtonBorder {
        constructor (options) {
            super(options.defaultChoice || '', {
                backgroundColor: '#333333',
                backgroundEnabled: true,

                size: new Vector2(150, 30),
                
                fontSize: 18,
                fontColor: '#bbbbbb',

                borderColor: 'gray',
                borderSize: 1,

                clickable: true,
                textXAlignment: 'center',
                paddingLeft: 0,

                textBaseLine: 'middle',
                zIndex: 20,

                ...options
            });

            this.choices = options.choices || []; // makes no sense butok
            this.currentChoice = options.defaultChoice || '';
            this.onChoice = new Event();

            this.choiceContainer = new UIBase({
                position: new Vector2(0, 1),
                sizeScale: new Vector2(1, 0),
                backgroundEnabled: true,
                backgroundColor: '#333333',
                transparency: 0.5,
                zIndex: 9999,
                visible: false
            });
            this.choiceContainer.parentTo(this);

            for (let i = 0; i < this.choices.length; i++) {
                const choice = this.choices[i];
                const choiceText = new RotmgButtonBorder(choice, {
                    backgroundEnabled: true,
                    backgroundColor: '#333333',

                    borderSize: 1,
                    borderColor: 'gray',

                    fontSize: 18,

                    clickable: true,
                    fontColor: '#bbbbbb',
                    textXAlignment: 'center',
                    paddingLeft: 0,
                    playMouseDownSound: false,

                    sizeScale: new Vector2(1, 0),
                    size: new Vector2(0, 30),
                    position: new Vector2(0, 30 * (i + 1))
                });
                choiceText.parentTo(this.choiceContainer);

                choiceText.mouseUp.listen(() => {
                    this.choiceContainer.visible = false;
                    this.text = choice;
                    this.currentChoice = choice;
                    this.onChoice.trigger(choice);
                });

                choiceText.visible = this.currentChoice !== choice;
            }

            this.mouseDown.listen((position, mouse) => {
                this.choiceContainer.visible = !this.choiceContainer.visible;

                if (this.choiceContainer.visible) {
                    for (let i = 0; i < this.choices.length; i++) {
                        const choiceText = this.choiceContainer.children[i];
                        choiceText.visible = this.currentChoice !== this.choices[i];
                    }

                    const choiceIndex = this.choices.indexOf(this.currentChoice);
                    const available = this.choices.slice();

                    available.splice(choiceIndex, 1);

                    for (let i = 0; i < available.length; i++) {
                        const choiceText = this.choiceContainer.children.find((child) => child.text === available[i]);
                        choiceText.positionAbsolute.y = 30 * (i + 1);
                    }
                    
                    mouse.mouseDown.listenOnce(() => {
                        const clickedChoice = this.choices.find((choice, i) => {
                            const choiceText = this.choiceContainer.children[i];
                            return choiceText.isPointInside(mouse.position, Constants.DEFAULT_CANVAS_SIZE);
                        });
                        
                        if (!clickedChoice) {
                            this.choiceContainer.visible = false;
                        }
                    });
                }
            });
        }

        isOpen () {
            return this.choiceContainer.visible;
        }

        setCurrentChoice (choice) {
            this.currentChoice = choice;
            this.text = choice;
        }
    }
})();