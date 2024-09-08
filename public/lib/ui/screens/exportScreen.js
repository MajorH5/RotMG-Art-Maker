// export pop up modal

import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { RotmgButtonBorder } from "../objects/rotmgButtonBorder.js";
import { UIDropdownMenu } from "../uiDropdownMenu.js";
import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { Posts } from "../../api/posts.js";
import { UIText } from "../uiText.js";
import { UIBase } from "../uiBase.js";
import { Event } from "../../utils/event.js";
import { Modal } from "../objects/modal.js";

export const ExportScreen = (function () {
    return class ExportScreen extends Modal {
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
                size: new Vector2(450, 270),
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

            this.header = new UIText('Export', {
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

            this.formatLabel = new UIText('Format:', {
                position: new Vector2(35, 70),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 20,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 5,
            });
            this.formatLabel.parentTo(this.modal);

            this.formatDropdown = new UIDropdownMenu({
                position: new Vector2(115.5, 60.5),
                size: new Vector2(280, 30),
                zIndex: 200,

                choices: ['PNG', 'GIF'],
                defaultChoice: 'PNG',
            });
            this.formatDropdown.onChoice.listen((choice) => {
                this.delayBlocker.visible = choice === 'PNG';
            });
            this.formatDropdown.parentTo(this.modal);

            this.gifDelayLabel = new UIText('GIF Delay:', {
                position: new Vector2(15, 120),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 20,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 5,
            });
            this.gifDelayLabel.parentTo(this.modal);
            
            this.gifDelayDropdown = new UIDropdownMenu({
                position: new Vector2(115.5, 110.5),
                size: new Vector2(280, 30),
                zIndex: 100,

                choices: ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'],
                defaultChoice: '100',
            });
            this.gifDelayDropdown.triggered.listen(() => {
                if (this.formatDropdown.isOpen()) this.gifDelayDropdown.close();
                if (this.formatDropdown.getCurrentChoice() === 'PNG') {
                    this.gifDelayDropdown.close();
                }
            })
            this.gifDelayDropdown.parentTo(this.modal);

            this.delayBlocker = new UIBase({
                size: new Vector2(280, 30),
                position: new Vector2(115.5, 110.5),
                zIndex: 100,
                backgroundEnabled: true,
                backgroundColor: '#000000',
                transparency: 0.5
            });
            this.delayBlocker.parentTo(this.modal);

            this.rotmgifyLabel = new UIText('RotMGify:', {
                position: new Vector2(15, 170),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 20,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 5,
            });
            this.rotmgifyLabel.parentTo(this.modal);

            this.rotmgifyDropdown = new UIDropdownMenu({
                position: new Vector2(115.5, 160.5),
                size: new Vector2(280, 30),

                choices: ['Yes', 'No'],
                defaultChoice: 'Yes',
            });
            this.rotmgifyDropdown.triggered.listen(() => {
                if (this.gifDelayDropdown.isOpen()) this.rotmgifyDropdown.close();
            });
            this.rotmgifyDropdown.parentTo(this.modal);

            this.exportButton = new RotmgButtonDefault('Export', {
                size: new Vector2(140, 30),
                positionScale: new Vector2(1, 1),
                pivot: new Vector2(1, 1),
                position: new Vector2(-20, -20),
            });
            this.exportButton.mouseUp.listen(() => {
                if (this.dropdownOpen()) return;
                this.exported.trigger(this.formatDropdown.getCurrentChoice(),
                    this.gifDelayDropdown.getCurrentChoice(),
                    this.rotmgifyDropdown.getCurrentChoice());
                this.visible = false;
                this.clearInputs();
            });
            this.exportButton.parentTo(this.modal);

            this.cancelButton = new RotmgButtonDefault('Cancel', {
                size: new Vector2(140, 30),
                positionScale: new Vector2(1, 1),
                pivot: new Vector2(1, 1),
                position: new Vector2(-180, -20),
            });
            this.cancelButton.mouseUp.listen(() => {
                if (this.dropdownOpen()) return;
                this.visible = false;
                this.clearInputs();
            });
            this.cancelButton.parentTo(this.modal);

            this.exported = new Event();
        }
        
        dropdownOpen () {
            return this.formatDropdown.isOpen() || this.gifDelayDropdown.isOpen() || this.rotmgifyDropdown.isOpen();
        }

        clearInputs () {
            this.formatDropdown.setCurrentChoice('PNG');
            this.gifDelayDropdown.setCurrentChoice('100');
            this.rotmgifyDropdown.setCurrentChoice('Yes');

            this.formatDropdown.close();
            this.gifDelayDropdown.close();
            this.rotmgifyDropdown.close();

            this.delayBlocker.visible = true;
        }
    }
})();