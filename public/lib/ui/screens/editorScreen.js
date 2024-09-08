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
import { RotMGSprite } from '../objects/rotmgSprite.js';
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
import { ChangePasswordScreen } from './changePasswordScreen.js';
import { ForgotPasswordScreen } from './forgotPasswordScreen.js';
import { DeleteScreen } from './deleteScreen.js';
import { ResetPasswordScreen } from './resetPassswordScreen.js';
import { ExportScreen } from './exportScreen.js';
import { Constants } from '../../utils/constants.js';
import { UIImage } from '../uiImage.js';
import { Sprite } from '../../assets/sprite.js';
import { PatchNotes } from '../objects/patchNotes.js';
import { Notifications } from '../objects/notifications.js';

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

            this.resetPasswordScreen = new ResetPasswordScreen();
            this.resetPasswordScreen.parentTo(this);

            this.currentAccountScreen = new CurrentAccountScreen();
            this.currentAccountScreen.parentTo(this);

            this.deleteScreen = new DeleteScreen();
            this.deleteScreen.parentTo(this);

            this.exportScreen = new ExportScreen();
            this.exportScreen.exported.listen((format, delay, rotmgify) => {
                this.export(format, parseInt(delay), rotmgify === 'Yes');
            });
            this.exportScreen.parentTo(this);

            this.changePasswordScreen = new ChangePasswordScreen();
            this.changePasswordScreen.closed.listen(() => {
                this.currentAccountScreen.visible = true;
            });
            this.changePasswordScreen.parentTo(this);

            this.forgotPasswordScreen = new ForgotPasswordScreen();
            this.forgotPasswordScreen.closed.listen(() => {
                this.signInScreen.visible = true;
            });
            this.forgotPasswordScreen.parentTo(this);

            this.currentSize = new Vector2(8, 8);
            this.sequence = null;
            this.spriteEditor.setActiveColor(this.colorEditor.getActiveColor());

            this.currentAccountScreen.changePassword.mouseUp.listen(() => {
                this.changePasswordScreen.visible = true;
                this.currentAccountScreen.visible = false;
            });

            this.signInScreen.forgot.mouseUp.listen(() => {
                this.forgotPasswordScreen.visible = true;
                this.signInScreen.visible = false;
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

            this.notificationIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(1*16, 3*16),
                position: new Vector2(42, 5),
                size: new Vector2(32, 32),
                clickable: true,
                zIndex: 999
            });
            this.notificationIcon.mouseUp.listen((position, mouse) => {
                if (ArtEditor.isModalOpen() && !this.notifications.visible) return;
                this.notificationIcon.imageRectOffset = new Vector2(1*16, 3*16);
                this.notifications.visible = !this.notifications.visible

                if (this.notifications.visible) {
                    this.notifications.markViewed();
                    if (this.notifications.stale) {
                        this.notifications.loadNotifications();
                    } else {
                        this.notifications.stale = true;
                    }

                    this.listenForClickout(mouse, this.notifications, this.notificationIcon).then((clickedOutside) => {
                        if (clickedOutside) {
                            this.notifications.stale = true;
                        }
                    });
                }
            });
            this.notificationIcon.parentTo(this);

            this.updatesIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: localStorage.getItem('lastUpdate') === Constants.VERSION ? new Vector2(1*16, 4*16) : new Vector2(2*16, 4*16),
                position: new Vector2(84, 5),
                size: new Vector2(32, 32),
                clickable: true,
                zIndex: 999
            });
            this.patchNotes = new PatchNotes({
                size: new Vector2(400, 550),
                positionScale: new Vector2(1, 1),
                visible: false
            });
            this.updatesIcon.mouseUp.listen((position, mouse) => {
                if (ArtEditor.isModalOpen()) return;
                localStorage.setItem('lastUpdate', Constants.VERSION);
                this.updatesIcon.imageRectOffset = new Vector2(1*16, 4*16);
                this.patchNotes.visible = !this.patchNotes.visible;
                this.listenForClickout(mouse, this.patchNotes, this.updatesIcon);
            });
            this.patchNotes.parentTo(this.updatesIcon);
            this.updatesIcon.parentTo(this);

            this.notifications = new Notifications({
                size: new Vector2(400, 550),
                // position: new Vector2(10, 10),
                positionScale: new Vector2(1, 1),
                visible: false
            });
            this.notifications.parentTo(this.notificationIcon);

            this.versionText = new UIText(Constants.VERSION, {
                font: 'myriadpro_light',
                fontSize: 13,
                fontColor: '#aaaaaa',
                textXAlignment: 'right',
                pivot: new Vector2(1, 1),
                position: new Vector2(-10, 3),
                size: new Vector2(60, 15),
                positionScale: new Vector2(1, 1),
                shadowBlur: 5,
                textTransparency: 0.5,
                shadow: true,
                zIndex: -1
            });
            this.versionText.parentTo(this);

            this.currentPost = false;

            this.setupListeners();
        }

        listenForClickout (mouse, element, trigger) {
            return new Promise((resolve) => {
                const handler = () => {
                    let clickedOutside = true;
                    let hitIcon = false;
    
                    mouse.heldObjects.keys().forEach((object) => {
                        if (object === trigger) {
                            hitIcon = true;
                        }
    
                        if (object.isDescendantOf(element)) {
                            clickedOutside = false
                        }
                    });
    
                    if (clickedOutside) {
                        if (!hitIcon) {
                            element.visible = false;
                        }
                    }
    
                    if (!element.visible) {
                        mouse.mouseUp.unlisten(handler);
                    }

                    resolve(clickedOutside, element.visible);
                }
    
                mouse.mouseUp.listen(handler);
            });
        }
        
        refreshPreview () {
            if (this.modeDropdown.currentChoice !== 'Characters') {
                const [pixels, width, height] = this.spriteEditor.getPixels();
                this.spritePreview.loadPixels(pixels, width, height);
            }
            
            // when mode is characters, spritepreview will
            // be updated by the current animation frame
        }

        getModals () {
            return [this.loadScreen, this.saveScreen,
                this.signInScreen, this.signUpScreen,
                this.currentAccountScreen, this.changePasswordScreen,
                this.deleteScreen, this.resetPasswordScreen, this.forgotPasswordScreen,
                this.exportScreen, this.notifications,
                this.patchNotes
            ];
        }

        isModalOpen () {
            return this.getModals().some((modal) => modal.visible);
        }

        clearCurrentPost () {
            this.currentPost = false;
            this.saveScreen.clearInputs();
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

        export (format, delay, rotmgify) {
            const frames = [];

            if (this.sequence === null) {
                let [pixels, width, height] = this.spriteEditor.getPixels();
    
                if (rotmgify) {
                    pixels = RotMGSprite.RotMGify(pixels, width, height);
                    width = (width + 2) * 5, height = (height + 2) * 5;
                }

                frames.push({ pixels, width, height });
            } else {
                let spriteSize = this.sequence.size;
                const setFrames = [
                    PackagedSequence.STAND, PackagedSequence.WALK1,
                    PackagedSequence.WALK2, PackagedSequence.ATTACK1,
                    PackagedSequence.ATTACK2
                ];

                if (format === 'PNG') {
                    let width = 6 * spriteSize.x, height = 1 * spriteSize.y;
                    let pixels = new Uint8Array(width * height * 4);

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const frame = Math.min(Math.floor(x / spriteSize.x), setFrames.length - 1);
                            const frameData = this.sequence.get(setFrames[frame]);

                            const frameX = x % spriteSize.x + (x >= (spriteSize.x * 5) ? spriteSize.x : 0);
                            const frameY = y % spriteSize.y;

                            const pixelHex = frameData.get(new Vector2(frameX, frameY));
                            const index = (x + y * width) * 4;
                            let r = 0, g = 0, b = 0, a = 0;
                            
                            if (pixelHex !== null && pixelHex !== undefined) {
                                [r, g, b] = this.spriteEditor.hexToRGB(pixelHex);
                                a = 255;
                            }
                            
                            pixels[index] = r;
                            pixels[index + 1] = g;
                            pixels[index + 2] = b;
                            pixels[index + 3] = a;
                        }
                    }

                    if (rotmgify) {
                        pixels = RotMGSprite.RotMGify(pixels, width, height);
                        width = (width + 2) * 5, height = (height + 2) * 5;
                    }

                    frames.push({ pixels: pixels, width: width, height: height });
                } else if (format === 'GIF') {
                    for (let i = 0; i < setFrames.length; i++) {
                        let width = spriteSize.x * (i === setFrames.length - 1 ? 2 : 1),
                            height = spriteSize.y;

                        const frame = setFrames[i];
                        const frameData = this.sequence.get(frame);
                        let framePixels = new Uint8Array(width * height * 4);
        
                        for (let y = 0; y < height; y++) {
                            for (let x = 0; x < width; x++) {
                                const pixelHex = frameData.get(new Vector2(x, y));
                                const index = (x + y * width) * 4;
                                let r = 0, g = 0, b = 0, a = 0;
        
                                if (pixelHex !== null && pixelHex !== undefined) {
                                    [r, g, b] = this.spriteEditor.hexToRGB(pixelHex);
                                    a = 255;
                                }
        
                                framePixels[index] = r;
                                framePixels[index + 1] = g;
                                framePixels[index + 2] = b;
                                framePixels[index + 3] = a;
                            }
                        }

                        if (rotmgify) {
                            framePixels = RotMGSprite.RotMGify(framePixels, width, height);
                            width = (width + 2) * 5, height = (height + 2) * 5;
                        }
        
                        frames.push({ pixels: framePixels, width, height });
                    }
                }
            }

            if (format === 'PNG') {
                this.exportImagePNG(frames[0].pixels, frames[0].width, frames[0].height);
            } else if (format === 'GIF') {
                this.exportImageGIF(frames, delay);
            }
        }

        exportImagePNG (pixels, width, height) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            context.imageSmoothingEnabled = false;

            canvas.width = width;
            canvas.height = height;

            const imageData = context.createImageData(width, height)

            for (let i = 0; i < pixels.length; i++) {
                imageData.data[i] = pixels[i];
            }

            context.putImageData(imageData, 0, 0);

            const trigger = document.createElement('a');
            trigger.href = canvas.toDataURL('image/png');
            trigger.download = 'sprite.png';
            trigger.click();
        }

        exportImageGIF (frames, delay) {
            const gif = new GIF({
                workers: 2,
                quality: 1,
                workerScript: '/lib/libraries/gif.worker.js'
            });

            for (let i = frames.length - 1; i >= 0; i--) {
                const {pixels, width, height} = frames[i];
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                context.imageSmoothingEnabled = false;

                canvas.width = width;
                canvas.height = height;

                const imageData = context.createImageData(width, height);

                for (let j = 0; j < pixels.length; j++) {
                    imageData.data[j] = pixels[j];
                }

                context.putImageData(imageData, 0, 0);
                gif.addFrame(canvas, { delay: delay });
            }

            gif.on('finished', (blob) => {
                const trigger = document.createElement('a');
                trigger.href = URL.createObjectURL(blob);
                trigger.download = 'animation.gif';
                trigger.click();
            });

            gif.render();
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
            this.loadScreen.aboutScreen.commentsContainer.textEnter.placeholder = this.loadScreen.aboutScreen.commentsContainer.getPlaceHolder();
            this.loadScreen.aboutScreen.commentsContainer.textEnter.textEditable = true;
            this.loadScreen.aboutScreen.commentsContainer.textDisabled.visible = false;
            this.loadScreen.aboutScreen.commentsContainer.submitDarken.visible = false;
            this.loadScreen.aboutScreen.commentsContainer.submitButton.setDisabled(false);
            this.notifications.infoMessage.text = 'No notifications';
            this.notifications.clearAll.visible = true;
            this.notifications.loadNotifications().then(() => {
                if (this.notifications.visible) return;
                if (this.notifications.hasUnviewedNotifications()) {
                    this.notificationIcon.imageRectOffset = new Vector2(2*16, 3*16);
                } else {
                    this.notificationIcon.imageRectOffset = new Vector2(1*16, 3*16);
                }
                this.notifications.markViewed();
            });
        }
        
        onUserLogout () {
            this.register.text = 'register';
            this.register.paddingLeft = 0;
            this.loginStatus.paddingLeft = 68;
            this.loginOut.text = 'log in';
            this.loginStatus.text = 'guest account -';
            this.currentAccountScreen.emailLabel.text = '';
            this.loadScreen.aboutScreen.commentsContainer.textEnter.placeholder = this.loadScreen.aboutScreen.commentsContainer.getPlaceHolder();
            this.loadScreen.aboutScreen.commentsContainer.textEnter.textEditable = false;
            this.loadScreen.aboutScreen.commentsContainer.textDisabled.visible = true;
            this.loadScreen.aboutScreen.commentsContainer.submitDarken.visible = true;
            this.loadScreen.aboutScreen.commentsContainer.submitButton.setDisabled(true);
            this.notifications.clearNotifications();
            this.notifications.infoMessage.text = 'Log in or create an account to receive notifications';
            this.notifications.clearAll.visible = false;
        }

        setCurrentFrame (frame) {
            if (this.sequence === null) return;

            this.spriteEditor.setFrame(this.sequence.get(frame));
            this.history.clear();
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
                if (this.isModalOpen()) return;

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
                        this.clearCurrentPost();
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
                    case EditorButtons.BUTTON_EXPORT:
                        this.exportScreen.visible = true;
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
                this.clearCurrentPost();
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
                this.clearCurrentPost();
            });

            this.loadScreen.onSelect.listen((isAnimatedTexture, size, objectData, post) => { 
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
                this.clearCurrentPost();

                if (post !== undefined) {
                    this.saveScreen.nameEnter.text = post.postName;
                    this.saveScreen.typeDropdown.setCurrentChoice(post.type);
                    this.saveScreen.tagsEnter.text = post.tags;
                    this.currentPost = true;
                }
            });
        }
    }
})();