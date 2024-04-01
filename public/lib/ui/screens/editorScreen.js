// this class houses the main render element for
// the editor, most interaction is done through here
import { ScrollingBackground } from '../objects/scrollingBackground.js';
import { EditorButtons } from '../objects/editorButtons.js';
import { SpritePreview } from '../objects/spritePreview.js';
import { SpriteEditor } from '../objects/spriteEditor.js';
import { ColorEditor } from '../objects/colorEditor.js';
import { UIDropdownMenu } from '../uiDropdownMenu.js';
import { History } from '../../history/history.js';
import { Vector2 } from '../../utils/vector2.js';
import { Sounds } from '../../assets/sounds.js';
import { LoadScreen } from './loadScreen.js';
import { SaveScreen } from './saveScreen.js';
import { UIText } from '../uiText.js';
import { UIBase } from '../uiBase.js';
import { RotmgButtonBorder } from '../objects/rotmgButtonBorder.js';
import { PackagedSequence } from '../../utils/packagedSequence.js';
import { SignInScreen } from './signinScreen.js';
import { SignUpScreen } from './signupScreen.js';
import { CurrentAccountScreen } from './currentAccountScreen.js';
import { ForgotPasswordScreen } from './forgotPasswordScreen.js';

export const EditorScreen = (function () {
    return class EditorScreen extends UIBase {
        constructor () {
            super({
                backgroundEnabled: true,
                backgroundColor: 'black',

                sizeScale: new Vector2(1, 1)
            });

            this.history = new History();
            // logged in as majorh5@github.com - 
            this.loginStatus = new UIText('guest account -', {
                fontSize: 18,
                fontColor: 'white',
                fontColor: '#cccccc',
                textTransparency: 0.5,

                // backgroundColor: 'red',
                // backgroundEnabled: true,

                textXAlignment: 'right',
                paddingLeft: 68,

                position: new Vector2(-75, 0),
                sizeScale: new Vector2(1, 0.05),
                shadowBlur: 5,
                shadow: true,
            });
            this.loginStatus.parentTo(this);

            this.register = new UIText('register', {
                font: 'myriadpro_bold',
                fontSize: 18,
                fontColor: 'white',

                textXAlignment: 'right',
                clickable: true,
                
                positionScale: new Vector2(1, 0.5),
                position: new Vector2(2.5, 0),
                size: new Vector2(80, 20),
                pivot: new Vector2(1, 0.5),

                shadowBlur: 5,
                shadow: true
            });
            this.register.mouseEnter.listen(() => { this.register.fontColor = '#ffff00'; });
            this.register.mouseLeave.listen(() => { this.register.fontColor = '#ffffff'; });
            this.register.mouseUp.listen(() => {

            });
            this.register.parentTo(this.loginStatus);

            this.loginOut = new UIText('log in', {
                font: 'myriadpro_bold',
                fontSize: 18,
                fontColor: 'white',
                
                textXAlignment: 'right',
                clickable: true,

                positionScale: new Vector2(1, 0.5),
                position: new Vector2(2.5, 0),
                size: new Vector2(58, 20),
                pivot: new Vector2(0, 0.5),

                shadowBlur: 5,
                shadow: true,
            });
            this.loginOut.mouseEnter.listen(() => { this.loginOut.fontColor = '#ffff00'; });
            this.loginOut.mouseLeave.listen(() => { this.loginOut.fontColor = '#ffffff'; });
            this.loginOut.mouseUp.listen(() => {

            });
            this.loginOut.parentTo(this.loginStatus);

            this.background = new ScrollingBackground();
            this.background.parentTo(this);

            this.darken = new UIBase({
                backgroundEnabled: true,
                backgroundColor: '#000000',
                sizeScale: new Vector2(1, 1),
                transparency: 0.5,
                zIndex: -1
            });
            this.darken.parentTo(this);

            this.editorButtons = new EditorButtons({
                position: new Vector2(20, 50)
            });
            this.editorButtons.parentTo(this);

            this.dropDowns = new UIBase({
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 30),
                position: new Vector2(30, 40),
                zIndex: 20
            })
            this.dropDowns.parentTo(this);
            
            this.modeDropdown = new UIDropdownMenu({
                positionScale: new Vector2(1, 0),
                position: new Vector2(10, -1),
                choices: ['Characters', 'Objects', 'Textiles'],
                defaultChoice: 'Objects'
            });
            
            this.modeText = new UIText('Mode:', {
                font: 'myriadpro_bold',
                fontSize: 18,
                fontColor: '#dddddd',
                pivot: new Vector2(1, 0.5),
                position: new Vector2(-this.modeDropdown.sizeAbsolute.x + -this.modeDropdown.positionAbsolute.x + -10, 0),
                positionScale: new Vector2(0.5, 0.5),
                size: new Vector2(60, 30)
            });
            this.modeText.parentTo(this.dropDowns);
            this.modeDropdown.parentTo(this.modeText);
            
            this.sizeDropdown = new UIDropdownMenu({
                positionScale: new Vector2(1, 0),
                position: new Vector2(10, 0),
                choices: ['32 x 32', '16 x 16', '8 x 8', '16 x 8'],
                defaultChoice: '8 x 8'
            });
            this.sizeText = new UIText('Size:', {
                font: 'myriadpro_bold',
                fontSize: 18,
                fontColor: '#dddddd',
                pivot: new Vector2(0, 0.5),
                positionScale: new Vector2(0.5, 0.5),
                size: new Vector2(50, 30),
            });
            this.sizeText.parentTo(this.dropDowns);
            this.sizeDropdown.parentTo(this.sizeText);

            this.animations = new UIBase({
                position: new Vector2(150, 90),
                size: new Vector2(380, 30),
                visible: false
            });
            this.animations.parentTo(this);

            const animations = [
                PackagedSequence.STAND,
                PackagedSequence.WALK1,
                PackagedSequence.WALK2,
                PackagedSequence.ATTACK1,
                PackagedSequence.ATTACK2,
            ];

            for (let i = 0; i < animations.length; i++) {
                const animation = animations[i];
                const button = new RotmgButtonBorder(animation, {
                    position: new Vector2(i * 75, 0),
                    fontSize: 16,
                    paddingLeft: 0,
                    textXAlignment: 'center'
                });
                button.mouseUp.listen(() => {
                    this.animations.children.forEach((child) => {
                        child.setActive(false);
                    });
                    button.setActive(true);
                    this.setCurrentFrame(animation);
                });
                button.setActive(i === 0);
                button.sizeAbsolute.x = 70;
                button.parentTo(this.animations);
            }
            
            this.spriteEditor = new SpriteEditor({
                position: new Vector2(339, 329),
                pivot: new Vector2(0.5, 0.5),
                history: this.history
            });
            this.spriteEditor.parentTo(this);

            this.colorEditor = new ColorEditor({
                positionScale: new Vector2(0.5, 1),
                pivot: new Vector2(0.5, 1),
                sizeScale: new Vector2(0.95, 0),
                size: new Vector2(0, 150)
            });
            this.colorEditor.parentTo(this);

            this.spritePreview = new SpritePreview({
                position: new Vector2(560.5, 329.5),
                pivot: new Vector2(0, 0.5),
            });
            this.spritePreview.parentTo(this);

            this.loadScreen = new LoadScreen();
            this.loadScreen.parentTo(this);

            this.saveScreen = new SaveScreen();
            this.saveScreen.parentTo(this);

            this.signInScreen = new SignInScreen();
            this.signInScreen.parentTo(this);

            this.signUpScreen = new SignUpScreen();
            this.signUpScreen.parentTo(this);

            this.currentAccountScreen = new CurrentAccountScreen();
            this.currentAccountScreen.parentTo(this);

            this.forgotPasswordScreen = new ForgotPasswordScreen();
            this.forgotPasswordScreen.closed.listen(() => {
                this.currentAccountScreen.visible = true;
            })
            this.forgotPasswordScreen.parentTo(this);

            this.currentSize = new Vector2(8, 8);
            this.sequence = null;
            this.spriteEditor.setActiveColor(this.colorEditor.getActiveColor());

            this.currentAccountScreen.changePassword.mouseUp.listen(() => {
                this.forgotPasswordScreen.visible = true;
                this.currentAccountScreen.visible = false;
            });

            this.loginOut.mouseUp.listen(() => {
                if (!this.isModalOpen()) {
                    if (ArtEditor.user === null) {
                        this.signInScreen.visible = true
                    } else {
                        ArtEditor.logout();
                    }
                }
            });

            this.register.mouseUp.listen(() => {
                if (!this.isModalOpen()) {
                    if (ArtEditor.user === null) {
                        this.signUpScreen.visible = true;
                    } else {
                        this.currentAccountScreen.visible = true;
                    }
                }
            });

            this.signUpScreen.already.mouseUp.listen(() => {
                this.signInScreen.visible = true;
                this.signUpScreen.visible = false;
                this.signUpScreen.clearInputs();
            });

            this.signInScreen.new.mouseUp.listen(() => {
                this.signInScreen.visible = false;
                this.signUpScreen.visible = true;
                this.signInScreen.clearInputs();
            });

            this.currentAccountScreen.notYou.mouseUp.listen(async () => {
                await ArtEditor.logout();
                this.currentAccountScreen.visible = false;
                this.currentAccountScreen.incorrect.visible = false;
                this.currentAccountScreen.sent.visible = false;
                this.currentAccountScreen.notVerified.visible = ArtEditor.user === null ? false : !ArtEditor.user.details.verified;
            });

            this.versionText = new UIText('v1.0.0', {
                font: 'myriadpro_light',
                fontSize: 13,
                fontColor: '#aaaaaa',
                textXAlignment: 'right',
                pivot: new Vector2(1, 1),
                position: new Vector2(-10, 3),
                size: new Vector2(60, 30),
                positionScale: new Vector2(1, 1),
                shadowBlur: 5,
                textTransparency: 0.5,
                shadow: true,
                zIndex: -1
            });
            this.versionText.parentTo(this);

            this.setupListeners();
        }
        
        refreshPreview () {
            if (this.modeDropdown.currentChoice !== 'Characters') {
                const [pixels, width, height] = this.spriteEditor.getPixels();
                this.spritePreview.loadPixels(pixels, width, height);
            }
            
            // when mode is characters, spritepreview will
            // be updated by the current animation frame
        }

        isModalOpen () {
            return this.loadScreen.visible || this.saveScreen.visible
                || this.signInScreen.visible || this.signUpScreen.visible
                || this.currentAccountScreen.visible || this.forgotPasswordScreen.visible;
        }

        setSequence (sequence) {
            this.sequence = sequence;

            this.animations.children.forEach((child) => {
                child.setActive(false);
            });
            this.animations.children[0].setActive(true);

            this.animations.visible = sequence !== null;

            this.setCurrentFrame(PackagedSequence.STAND);
            this.spritePreview.setSequence(sequence);
        }

        exportImage () {
            if (this.sequence !== null) {
                return this.sequence.toJSON();
            }

            const [pixels, width, height] = this.spriteEditor.getCompressedPixels();

            return {
                pixels: Array.from(pixels),
                size: {
                    x: width,
                    y: height
                }
            };
        }

        onUserLogin (user) {
            this.register.text = 'account';
            this.register.paddingLeft = 9;
            this.loginStatus.text = `logged in as ${user.details.email} -`;
            this.loginStatus.paddingLeft = 76;
            this.loginOut.text = 'log out';
            this.currentAccountScreen.emailLabel.text = user.details.email;
            this.currentAccountScreen.visible = true;
            this.currentAccountScreen.notVerified.visible = !user.details.verified;
        }
        
        onUserLogout () {
            this.register.text = 'register';
            this.register.paddingLeft = 0;
            this.loginStatus.paddingLeft = 68;
            this.loginOut.text = 'log in';
            this.loginStatus.text = 'guest account -';
            this.currentAccountScreen.emailLabel.text = '';
        }

        setCurrentFrame (frame) {
            if (this.sequence === null) return;

            this.spriteEditor.setFrame(this.sequence.get(frame));
        }

        setupListeners () {
            this.spriteEditor.onInteract.listen((type, pixel) => {
                if (
                    type === SpriteEditor.DRAW ||
                    type === SpriteEditor.ERASE ||
                    type === SpriteEditor.CLEAR ||
                    type === SpriteEditor.HOVER
                ) {
                    if (type === SpriteEditor.DRAW) {
                        const color = pixel.getAttribute('color');

                        if (color !== null) {
                            this.colorEditor.addRecentColor(color);
                        }
                    }
                    this.refreshPreview();
                } else if (type === SpriteEditor.SAMPLE) {
                    const color = pixel.getAttribute('color');
                    this.colorEditor.huePicker.setBrightness(0);
                    this.colorEditor.setActiveColor(color);
                }
            });

            this.editorButtons.onButtonSelect.listen((button) => {
                switch (button) {
                    case EditorButtons.BUTTON_DRAW:
                        this.spriteEditor.setMode(SpriteEditor.DRAW);
                        break;
                    case EditorButtons.BUTTON_ERASE:
                        this.spriteEditor.setMode(SpriteEditor.ERASE);
                        break;
                    case EditorButtons.BUTTON_SAMPLE:
                        this.spriteEditor.setMode(SpriteEditor.SAMPLE);
                        break;
                    case EditorButtons.BUTTON_CLEAR:
                        this.spriteEditor.clearPixels();
                        this.refreshPreview();
                        break;    
                    case EditorButtons.BUTTON_UNDO:
                        this.history.undo();
                        this.refreshPreview();
                        break;
                    case EditorButtons.BUTTON_REDO:
                        this.history.redo();
                        this.refreshPreview();
                        break;        
                    case EditorButtons.BUTTON_LOAD:
                        this.loadScreen.visible = true;
                        break;
                    case EditorButtons.BUTTON_SAVE:
                        this.saveScreen.visible = true;
                        break;
                }
            });

            this.colorEditor.onColorSelected.listen((color) => {
                this.spriteEditor.setActiveColor(color);
            });

            this.sizeDropdown.onChoice.listen((choice) => {
                let size = null;

                switch (choice) {
                    case '32 x 32':
                        size = new Vector2(32, 32);
                        break;
                    case '16 x 16':
                        size = new Vector2(16, 16);
                        break;
                    case '8 x 8':
                        size = new Vector2(8, 8);
                        break;
                    case '16 x 8':
                        size = new Vector2(16, 8);
                        break;
                }
                
                if (this.modeDropdown.currentChoice !== 'Characters') {
                    this.spriteEditor.setSpriteSize(size);
                } else {
                    this.setSequence(new PackagedSequence(size));
                }

                this.history.clear();
            });

            this.modeDropdown.onChoice.listen((choice) => {
                this.spriteEditor.resetPixels();
                this.spriteEditor.setSpriteSize(new Vector2(8, 8));
                this.sizeDropdown.setCurrentChoice('8 x 8');

                switch (choice) {
                    case 'Characters':
                        this.setSequence(new PackagedSequence(this.spriteEditor.spriteSize));
                        break;
                    case 'Objects':
                        this.setSequence(null);
                        break;
                    case 'Textiles':
                        this.setSequence(null);
                        break;
                }

                this.history.clear();
            });

            this.loadScreen.onSelect.listen((isAnimatedTexture, size, objectData) => {                
                if (isAnimatedTexture) {
                    this.spriteEditor.resetPixels();
                    this.sizeDropdown.setCurrentChoice(`${size.x} x ${size.y}`);
                    this.modeDropdown.setCurrentChoice('Characters');
                    this.setSequence(objectData);
                } else {
                    this.setSequence(null);
                    this.spriteEditor.loadPixels(objectData, size.x, size.y);
                    this.modeDropdown.setCurrentChoice('Objects');
                    this.sizeDropdown.setCurrentChoice(`${size.x} x ${size.y}`);
                    this.refreshPreview();
                }

                this.history.clear();
            });
        }
    }
})();