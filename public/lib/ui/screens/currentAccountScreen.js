import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { Sounds } from "../../assets/sounds.js";
import { Auth } from "../../api/auth.js";

export const CurrentAccountScreen = (function () {
    return class CurrentAccountScreen extends UIBase {
        constructor (options) {
            super({
                backgroundColor: '#000000',
                backgroundEnabled: true,
                sizeScale: Vector2.one,
                zIndex: 9999,
                
                visible: false,
                ...options
            });

            this.modal = new UIBase({
                size: new Vector2(400, 315),
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

            this.header = new UIText('Current account', {
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

            this.loginLabel = new UIText('Currently logged in as:', {
                position: new Vector2(35, 70),
                size: new Vector2(300, 20),
                textXAlignment: 'left',
                fontSize: 22,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.loginLabel.parentTo(this.modal);

            this.emailLabel = new UIText('example@domain.com', {
                position: new Vector2(35, 95.5),
                size: new Vector2(280, 30),
                font: 'myriadpro_light',

                fontSize: 20,
                textWraps: false,
                
                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',

                textXAlignment: 'left',
                textBaseLine: 'middle',
            });
            this.emailLabel.parentTo(this.modal);
            
            this.notVerified = new UIText('Email not verified. Click here to resend email', {
                position: new Vector2(35, 160),
                size: new Vector2(330, 15),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro_light',
                fontColor: '#ffffff',
                shadow: true,
                shadowBlur: 3,
            });
            this.bindHover(this.notVerified, '#ffda84', '#ffffff');
            this.notVerified.mouseUp.listen(() => {
                if (ArtEditor.user === null) return;
                
                Auth.resendVerificationEmail(ArtEditor.user.token).then((result) => {
                    if (result.error === 'User is already verified') {
                        ArtEditor.user.details.verified = true;
                        Auth.setCookie('jwt', Auth.encodeUser(ArtEditor.user), 1);
                        this.notVerified.visible = false;
                        this.incorrect.visible = true;
                        this.incorrect.text = 'Your are already verified';
                        return;
                    }

                    this.sent.visible = result.error === undefined;
                    this.notVerified.visible = !this.sent.visible;
                    
                    this.incorrect.visible = true;
                    this.incorrect.text = result.error || result.message || '';
                    
                    if (result.error) {
                        Sounds.playSfx(Sounds.SND_ERROR);
                    }
                });
            })
            this.notVerified.parentTo(this.modal);

            this.sent = new UIText('Sent...', {
                position: new Vector2(35, 160),
                size: new Vector2(330, 15),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro_light',
                fontColor: '#aaaaaa',
                shadow: true,
                shadowBlur: 3,
                visible: false
            });
            this.sent.parentTo(this.modal);

            this.changePassword = new UIText('Click here to change password', {
                position: new Vector2(35, 180),
                size: new Vector2(180, 15),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro_light',
                fontColor: '#ffffff',
                shadow: true,
                shadowBlur: 3,
            });
            this.bindHover(this.changePassword, '#ffda84', '#ffffff');
            this.changePassword.parentTo(this.modal);

            this.notYou = new UIText('Not you? Click here to log out', {
                position: new Vector2(35, 200),
                size: new Vector2(180, 15),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro_light',
                fontColor: '#ffffff',
                shadow: true,
                shadowBlur: 3,
            });
            this.bindHover(this.notYou, '#ffda84', '#ffffff');
            this.notYou.parentTo(this.modal);

            this.incorrect = new UIText('Error', {
                position: new Vector2(35, 220),
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

            this.continue = new UIText('Continue', {
                positionScale: new Vector2(1, 1),
                position: new Vector2(-20, -20),
                pivot: new Vector2(1, 1),
                size: new Vector2(120, 30),
                clickable: true,
                textXAlignment: 'right',
                textYAlignment: 'bottom',
                font: 'myriadpro_bold',
                fontSize: 24,
                fontColor: '#ffffff'
            });
            this.bindHover(this.continue, '#ffda84');
            this.continue.parentTo(this.modal);

            this.continue.mouseUp.listen(async () => {
                this.visible = false;
                this.sent.visible = false;
                this.incorrect.visible = false;
                this.notVerified.visible = ArtEditor.user === null ? false : !ArtEditor.user.details.verified;
            });
        }
        
        bindHover (object, hoverColor, defaultColor = '#ffffff') {
            object.mouseEnter.listen(() => { object.fontColor = hoverColor });
            object.mouseLeave.listen(() => { object.fontColor = defaultColor });
        }
    }
})();