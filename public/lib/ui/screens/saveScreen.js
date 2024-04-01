// save pop up modal

import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { RotmgButtonBorder } from "../objects/rotmgButtonBorder.js";
import { UIDropdownMenu } from "../uiDropdownMenu.js";
import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { Posts } from "../../api/posts.js";
import { UIText } from "../uiText.js";
import { UIBase } from "../uiBase.js";

export const SaveScreen = (function () {
    return class SaveScreen extends UIBase {
        constructor (options) {
            super({
                backgroundColor: '#000000',
                backgroundEnabled: true,
                // transparency: 0.5,
                sizeScale: Vector2.one,
                zIndex: 9999,

                visible: false,
                ...options
            });

            this.modal = new UIBase({
                size: new Vector2(450, 420),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),

                backgroundColor: '#363636',
                backgroundEnabled: true,

                shadow: true,
                shadowBlur: 5,

                borderSize: 1,
                borderColor: '#ffffff',
                borderRadius: 6,
            });
            this.modal.parentTo(this);

            this.header = new UIText('Save', {
                position: new Vector2(0, 25),
                sizeScale: new Vector2(1, 0),
                font: 'myriadpro_bold',

                fontSize: 24,
                fontColor: '#578763',
                textXAlignment: 'center',
                textYAlignment: 'center',

                shadow: true,
                shadowBlur: 5,
            });
            this.header.parentTo(this.modal);

            this.nameLabel = new UIText('Name:', {
                position: new Vector2(35, 70),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 20,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 5,
            });
            this.nameLabel.parentTo(this.modal);

            this.nameEnter = new UITextBox('name of your creation', {
                position: new Vector2(115.5, 55.5),
                size: new Vector2(280, 30),
                font: 'myriadpro',

                fontSize: 14,
                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',
                placeholderColor: 'gray',

                textShadowBlur: 5,

                borderSize: 1,
                paddingLeft: 5,

                textXAlignment: 'left',
                textBaseLine: 'middle',
            });
            this.nameEnter.parentTo(this.modal);

            this.typeLabel = new UIText('Type:', {
                position: new Vector2(35, 120),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 20,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 5,
            });
            this.typeLabel.parentTo(this.modal);

            this.typeDropdown = new UIDropdownMenu({
                position: new Vector2(115.5, 110.5),
                size: new Vector2(280, 30),

                choices: ['Items', 'Entities', 'Tiles', 'Objects', 'Misc'],
                defaultChoice: 'Items'
            });
            this.typeDropdown.onChoice.listen(() => {
                this.tagsEnter.blur();
            });
            this.typeDropdown.parentTo(this.modal);

            this.tagsLabel = new UIText('Tags:', {
                position: new Vector2(35, 175),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 20,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 5,
            });
            this.tagsLabel.parentTo(this.modal);

            this.tagsEnter = new UITextBox('comma-separated list of tags\n(e.g. "elf, wizard, abyss of demons, crunchy")', {
                position: new Vector2(115.5, 165.5),
                size: new Vector2(280, 120),
                font: 'myriadpro',

                fontSize: 14,
                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',
                placeholderColor: 'gray',

                textShadowBlur: 5,

                borderSize: 1,
                paddingLeft: 5,

                textXAlignment: 'left',
                textYAlignment: 'top',
                textBaseLine: 'middle',
                multiline: true
            });
            this.tagsEnter.parentTo(this.modal);

            this.saveButton = new RotmgButtonDefault('Save', {
                size: new Vector2(140, 30),
                positionScale: new Vector2(1, 1),
                pivot: new Vector2(1, 1),
                position: new Vector2(-20, -20),
            });
            this.saveButton.mouseUp.listen(() => {
                this.saveCreation();
            });
            this.saveButton.parentTo(this.modal);

            this.cancelButton = new RotmgButtonDefault('Cancel', {
                size: new Vector2(140, 30),
                positionScale: new Vector2(1, 1),
                pivot: new Vector2(1, 1),
                position: new Vector2(-180, -20),
            });
            this.cancelButton.mouseUp.listen(() => {
                this.visible = false;
                this.isSubmitting = false;
                this.clearInputs();
            });
            this.cancelButton.parentTo(this.modal);

            this.incorrect = new UIText('Error', {
                position: new Vector2(35, 300),
                size: new Vector2(330, 30),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro_light',
                fontColor: '#FA8641',
                shadow: true,
                shadowBlur: 3,
                visible: false,
            });
            this.incorrect.parentTo(this.modal);

            this.isSubmitting = false;
        }

        clearInputs () {
            this.incorrect.visible = false;
            this.nameEnter.text = '';
            this.tagsEnter.text = '';
            this.typeDropdown.setCurrentChoice('Items');
        }

        showError (message) {
            this.incorrect.visible = true;
            this.incorrect.text = message;
        }

        saveCreation () {
            if (this.isSubmitting) return;

            if (ArtEditor.user === null) {
                this.showError('Log in or Register to save creations');
                return;
            }

            let name = this.nameEnter.text;
            let type = this.typeDropdown.currentChoice;
            let tags = this.tagsEnter.text.split(',').map(tag => tag.trim());
            let isAnimated = ArtEditor.editorScreen.sequence !== null;
            let image = ArtEditor.editorScreen.exportImage();

            this.isSubmitting = true;

            Posts.createPost(name, tags, image, type, isAnimated)
                .then((result) => {
                    if (result.error) throw result.error;

                    this.visible = false
                    this.isSubmitting = false;
                    this.clearInputs();
                })
                .catch((error) => {
                    console.log('error saving creation', error);
                    this.isSubmitting = false;

                    if (typeof error === 'string') {
                        this.showError(error);
                    } else {
                        this.showError('Error saving creation');
                    }
                });
        }
    }
})();