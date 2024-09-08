import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { Sounds } from "../../assets/sounds.js";
import { Auth } from "../../api/auth.js";
import { Event } from "../../utils/event.js";
import { Modal } from "../objects/modal.js";

export const ResetPasswordScreen = (function () {
    return class ResetPasswordScreen extends Modal {
        constructor (options) {
            super({
                backgroundColor: '#000000',
                backgroundEnabled: true,
                sizeScale: Vector2.one,
                zIndex: 99999,
                
                visible: false,
                ...options
            });

            this.modal = new UIBase({
                size: new Vector2(400, 320),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                
                backgroundColor: '#363636',
                backgroundEnabled: true,
                clipChildren: true,

                borderRadius: 6,
            });
            this.modal.parentTo(this);

            this.border = new UIBase({
                sizeScale: Vector2.one,
                positionScale: new Vector2(0.5, 0.5),
                size: new Vector2(-1, -1),
                pivot: new Vector2(0.5, 0.5),
                zIndex: 100,

                shadow: true,
                shadowBlur: 5,

                borderSize: 1,
                borderColor: '#ffffff',
                borderRadius: 6,
            });
            this.border.parentTo(this.modal);
            
            this.header = new UIText('Reset your password', {
                backgroundEnabled: true,
                backgroundColor: '#4D4D4D',
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 45),
                font: 'myriadpro_light',

                fontSize: 16,
                fontColor: '#B5B5B5',
                textXAlignment: 'left',
                textYAlignment: 'center',
                paddingLeft: 10,

                shadow: true,
                shadowBlur: 2,
            });
            this.header.parentTo(this.modal);

            this.newPasswordLabel = new UIText('New Password:', {
                position: new Vector2(35, 70),
                size: new Vector2(200, 20),
                textXAlignment: 'left',
                fontSize: 17,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.newPasswordLabel.parentTo(this.modal);

            this.newPasswordEnter = new UITextBox('password', {
                position: new Vector2(35, 105.5),
                size: new Vector2(280, 30),
                font: 'myriadpro',

                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',
                placeholderColor: 'gray',
                textWraps: false,

                borderSize: 3,
                paddingLeft: 5,

                textXAlignment: 'left',
                textBaseLine: 'middle',
            });
            this.newPasswordEnter.onInput.listen((contents) => {
                this.newPasswordEnter.displayText = contents.replace(/./g, '*');
            });
            this.newPasswordEnter.parentTo(this.modal);

            this.retypeLabel = new UIText('Retype New Password:', {
                position: new Vector2(35, 150),
                size: new Vector2(200, 20),
                textXAlignment: 'left',
                fontSize: 17,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.retypeLabel.parentTo(this.modal);
            
            this.retypeEnter = new UITextBox('password', {
                position: new Vector2(35, 185.5),
                size: new Vector2(280, 30),
                font: 'myriadpro',
                
                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',
                placeholderColor: 'gray',
                textWraps: false,

                borderSize: 3,
                paddingLeft: 5,
                
                textXAlignment: 'left',
                textBaseLine: 'middle',
            });
            this.retypeEnter.onInput.listen((contents) => {
                this.retypeEnter.displayText = contents.replace(/./g, '*');
            });
            this.retypeEnter.parentTo(this.modal);

            this.incorrect = new UIText('Incorrect Password', {
                position: new Vector2(35, 215),
                size: new Vector2(330, 30),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro_light',
                fontColor: '#FA8641',
                shadow: true,
                shadowBlur: 3,
                visible: false
            });
            this.incorrect.parentTo(this.modal);

            this.submit = new UIText('Submit', {
                positionScale: new Vector2(1, 1),
                position: new Vector2(-20, -20),
                pivot: new Vector2(1, 1),
                size: new Vector2(100, 30),
                clickable: true,
                textXAlignment: 'right',
                textYAlignment: 'bottom',
                font: 'myriadpro_bold',
                fontSize: 24,
                fontColor: '#ffffff'
            });
            this.bindHover(this.submit, '#ffda84');
            this.submit.parentTo(this.modal);

            let isResetting = false;

            this.submit.mouseUp.listen(async () => {
                const newPassword = this.newPasswordEnter.text;
                const retypePassword = this.retypeEnter.text;

                let result = [
                    Auth.validatePassword(newPassword),
                    Auth.validatePassword(retypePassword),
                ];
                if (result.some((error) => error !== true)){
                    this.incorrect.text = result[0];
                    this.incorrect.visible = true;
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                } else if (newPassword !== retypePassword) {
                    this.incorrect.text = 'New passwords do not match';
                    this.incorrect.visible = true;
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                } else if (this.resetCode === null) {
                    this.incorrect.text = 'An error occured while resetting password';
                    this.incorrect.visible = true;
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                } else if (isResetting) {
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                }

                isResetting = true;

                this.incorrect.visible = false;
                const response = await Auth.setPassword(ArtEditor.user.token, newPassword, this.resetCode);

                if (response.error === undefined) {
                    this.visible = false;
                    this.closed.trigger();
                    this.clearInputs();
                } else {
                    this.incorrect.text = response.error;
                    this.incorrect.visible = true;
                    Sounds.playSfx(Sounds.SND_ERROR);
                }

                isResetting = false;
            });
            
            this.cancel = new UIText('Cancel', {
                positionScale: new Vector2(1, 1),
                position: new Vector2(-160, -20),
                pivot: new Vector2(1, 1),
                size: new Vector2(80, 30),
                textXAlignment: 'right',
                clickable: true,
                textYAlignment: 'bottom',
                font: 'myriadpro_bold',
                fontSize: 24,
                fontColor: '#ffffff'
            });
            this.bindHover(this.cancel, '#ffda84');
            this.cancel.parentTo(this.modal);

            this.cancel.mouseUp.listen(() => {
                isResetting = false;
                this.visible = false;
                this.clearInputs();
                this.closed.trigger();
            });

            this.resetCode = null;
            this.closed = new Event();
        }

        setResetCode (resetCode) {
            this.resetCode = resetCode;
        }

        clearInputs () {
            this.incorrect.visible = false;
            this.newPasswordEnter.text = '';
            this.newPasswordEnter.displayText = '';
            this.retypeEnter.text = '';
            this.retypeEnter.displayText = '';
        }
        
        bindHover (object, hoverColor, defaultColor = '#ffffff') {
            object.mouseEnter.listen(() => { object.fontColor = hoverColor });
            object.mouseLeave.listen(() => { object.fontColor = defaultColor });
        }
    }
})();