import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { Sounds } from "../../assets/sounds.js";
import { Auth } from "../../api/auth.js";

export const SignUpScreen = (function () {
    return class SignUpScreen extends UIBase {
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
                size: new Vector2(400, 550),
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

            this.header = new UIText('Register in order to save your progress', {
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

            this.nameLabel = new UIText('Username:', {
                position: new Vector2(35, 70),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 17,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.nameLabel.parentTo(this.modal);

            this.usernameEnter = new UITextBox('username', {
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
            this.usernameEnter.parentTo(this.modal);

            this.emailLabel = new UIText('Email:', {
                position: new Vector2(35, 150),
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
            this.emailEnter.parentTo(this.modal);

            this.passwordLabel = new UIText('Password:', {
                position: new Vector2(35, 230),
                size: new Vector2(100, 20),
                textXAlignment: 'left',
                fontSize: 17,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.passwordLabel.parentTo(this.modal);

            this.passwordEnter = new UITextBox('password', {
                position: new Vector2(35, 265.5),
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
            this.passwordEnter.onInput.listen((contents) => {
                this.passwordEnter.displayText = contents.replace(/./g, '*');
            });
            this.passwordEnter.parentTo(this.modal);

            this.retypeLabel = new UIText('Retype Password:', {
                position: new Vector2(35, 310),
                size: new Vector2(150, 20),
                textXAlignment: 'left',
                fontSize: 17,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.retypeLabel.parentTo(this.modal);

            this.retypeEnter = new UITextBox('password', {
                position: new Vector2(35, 345.5),
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
                position: new Vector2(35, 380),
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
            

            this.already = new UIText('Already registered? Click here to sign in!', {
                position:  new Vector2(35, 410),
                size: new Vector2(330, 15),
                textXAlignment: 'left',
                fontSize: 14,
                fontColor: '#B3B3B3',
                shadow: true,
                shadowBlur: 3,
            });
            this.bindHover(this.already, '#ffda84', '#B3B3B3');
            this.already.parentTo(this.modal);

            this.notice = new UIText('By clicking \'Register\', you are indicating that you have read and agreed to the Terms of Use and Privacy Policy', {
                position: new Vector2(35, 455),
                size: new Vector2(330, 15),
                textXAlignment: 'left',
                fontSize: 14,
                fontColor: '#B3B3B3',
                shadow: true,
                shadowBlur: 3,
            });
            this.notice.parentTo(this.modal);

            this.register = new UIText('Register', {
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
            this.bindHover(this.register, '#ffda84');
            this.register.parentTo(this.modal);

            let isRegistering = false;

            this.register.mouseUp.listen(async () => {
                const password = this.passwordEnter.text;
                const retypePassword = this.retypeEnter.text;
                const email = this.emailEnter.text;
                const username = this.usernameEnter.text;

                let result = [
                    Auth.validateUsername(username),
                    Auth.validateEmail(email),
                    Auth.validatePassword(password),
                ];
                result = result.filter((error) => error !== true);

                if (result.length > 0) {
                    this.incorrect.text = result[0];
                    this.incorrect.visible = true;
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                } else if (password !== retypePassword) {
                    this.incorrect.text = 'Passwords do not match';
                    this.incorrect.visible = true;
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                } else if (isRegistering) {
                    Sounds.playSfx(Sounds.SND_ERROR);
                    return;
                }

                isRegistering = true;

                this.incorrect.visible = false;
                const response = await ArtEditor.register(username, email, password);

                if (response.error === undefined) {
                    this.visible = false;
                    this.clearInputs();
                } else {
                    this.incorrect.text = response.error;
                    this.incorrect.visible = true;
                }

                isRegistering = false;
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
                isRegistering = false;
                this.visible = false;
                this.clearInputs();
            });
        }

        clearInputs () {
            this.incorrect.visible = false;
            this.emailEnter.text = '';
            this.passwordEnter.text = '';
            this.passwordEnter.displayText = '';
            this.usernameEnter.text = '';
            this.retypeEnter.text = '';
            this.retypeEnter.displayText = '';
        }
        
        bindHover (object, hoverColor, defaultColor = '#ffffff') {
            object.mouseEnter.listen(() => { object.fontColor = hoverColor });
            object.mouseLeave.listen(() => { object.fontColor = defaultColor });
        }
    }
})();