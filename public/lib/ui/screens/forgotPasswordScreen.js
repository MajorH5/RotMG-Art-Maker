import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { Sounds } from "../../assets/sounds.js";
import { Auth } from "../../api/auth.js";
import { Event } from "../../utils/event.js";

export const ForgotPasswordScreen = (function () {
    return class ForgotPasswordScreen extends UIBase {
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
                size: new Vector2(400, 260),
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

            this.emailLabel = new UIText('Email:', {
                position: new Vector2(35, 70),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 17,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.emailLabel.parentTo(this.modal);

            this.emailEnter = new UITextBox('example@domain.com', {
                position: new Vector2(35, 105.5),
                size: new Vector2(280, 30),
                font: 'myriadpro',

                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',
                placeholderColor: 'gray',
                
                borderSize: 3,
                paddingLeft: 5,

                textXAlignment: 'left',
                textBaseLine: 'middle',
            });
            this.emailEnter.parentTo(this.modal);

            this.notice = new UIText('Reset link will be sent to the email', {
                position: new Vector2(35, 150),
                size: new Vector2(330, 15),
                textXAlignment: 'left',
                fontSize: 14,
                fontColor: '#B3B3B3',
                shadow: true,
                shadowBlur: 3,
            });
            this.notice.parentTo(this.modal);

            this.incorrect = new UIText('Error', {
                position: new Vector2(35, 170),
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
                const email = this.emailEnter.text;
                
                let result = Auth.validateEmail(email);

                if (result !== true) {
                    this.incorrect.text = result;
                    this.incorrect.visible = true;
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                } else if (isResetting) {
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                }

                isResetting = true;

                this.incorrect.visible = false;
                Auth.resetPassword(email).then((response) => {
                    this.incorrect.text = response.error || response.message || '';
                    this.incorrect.visible = true;
                    this.submit.visible = response.error !== undefined;
    
                    isResetting = false;
                }).catch((error) => {
                    console.error('Error resetting password:', error);
                    this.incorrect.text = 'An error occurred. Please try again later.'
                    this.incorrect.visible = true;
                    this.submit.visible = true;
    
                    isResetting = false;
                });
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
                this.submit.visible = true;
                this.clearInputs();
                this.closed.trigger();
            });

            this.closed = new Event();
        }

        clearInputs () {
            this.incorrect.visible = false;
            this.emailEnter.text = '';
        }
        
        bindHover (object, hoverColor, defaultColor = '#ffffff') {
            object.mouseEnter.listen(() => { object.fontColor = hoverColor });
            object.mouseLeave.listen(() => { object.fontColor = defaultColor });
        }
    }
})();