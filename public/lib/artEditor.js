// this module contains the main global singleton art editor class
// responsible for managing all on screen ui and editor state

import { WelcomeScreen } from "./ui/screens/welcomeScreen.js";
import { EditorScreen } from "./ui/screens/editorScreen.js";
import { UIManager } from "./ui/uiManager.js";
import { Vector2 } from "./utils/vector2.js";
import { Sprite } from "./assets/sprite.js";
import { Sounds } from "./assets/sounds.js";
import { Tween } from "./utils/tween.js";
import { Constants } from "./utils/constants.js";
import { UITextBox } from "./ui/uiTextBox.js";
import { SpriteEditor } from "./ui/objects/spriteEditor.js";
import { EditorButtons } from "./ui/objects/editorButtons.js";
import { UIImage } from "./ui/uiImage.js";
import { RotMGSpriteLoader } from "./assets/RotMGSpriteLoader/RotMGSpriteLoader.js";
import { UIBase } from "./ui/uiBase.js";
import { Auth } from "./api/auth.js";
import { LegalScreen } from "./ui/screens/legalScreen.js";
import { PreloadScreen } from "./ui/screens/preloadScreen.js";

export const ArtEditor = (function () {
    return class ArtEditor {
        static FRAME_RATE_CAP = 1000 / 80;

        constructor (canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');

            this.uiRoot = new UIManager(canvas, true);
            
            this.editorScreen = new EditorScreen();
            this.uiRoot.addObject(this.editorScreen);

            this.welcomeScreen = new WelcomeScreen();
            this.uiRoot.addObject(this.welcomeScreen);

            this.legalScreen = new LegalScreen();
            this.uiRoot.addObject(this.legalScreen);

            this.preloadScreen = new PreloadScreen();
            this.uiRoot.addObject(this.preloadScreen);

            // this.editorScreen.visible = false;
            // this.welcomeScreen.visible = false;

            // TODO: if no visible text box is parented to root,
            // cursor selection breaks for all textboxes, Why???
            const box = new UITextBox('', {
                backgroundEnabled: true,
                backgroundColor: 'gray',
                fontColor: 'white',
                // size: new Vector2(200, 100),
                // position: new Vector2(100, 100),
                // visible: false
            });
            this.uiRoot.addObject(box);
            
            this.user = null;
            this.mute = null;

            this.isRunning = false;
            this.initialized = false;
            this.initializing = false;

            this.lastFrame = -Infinity;
        }

        async initialize () {
            // preloads all content, and sets up the
            // editor for the first time
            if (this.initialized || this.initializing) return;

            this.initializing = true;

            this.canvas.width = Constants.DEFAULT_CANVAS_SIZE.x;
            this.canvas.height = Constants.DEFAULT_CANVAS_SIZE.y;
            this.lastFrame = performance.now();

            await this.preloadAll();

            this.mute = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                position: new Vector2(5, 5),
                size: new Vector2(32, 32),
                zIndex: 9999999
            });

            this.mute.mouseUp.listen(() => {
                if (!Sounds.system_MusicEnabled && !Sounds.system_SfxEnabled) {
                    Sounds.unmuteMusic(true);
                    Sounds.unmuteSfx(true);
                    this.mute.imageRectOffset = new Vector2(0, 0);
                    localStorage.setItem('mute', 'false');
                } else {
                    Sounds.muteMusic(true);
                    Sounds.muteSfx(true);
                    this.mute.imageRectOffset = new Vector2(16, 0);
                    localStorage.setItem('mute', 'true');
                }
            });

            this.uiRoot.addObject(this.mute);

            try {
                const jwt = Auth.getCookie('jwt');
    
                if (jwt !== null) {
                    const decoded = Auth.decodeUser(jwt);
                    const user = await Auth.me(decoded.token);

                    if (user.error === undefined) {
                        this.user = user;
                        this.editorScreen.onUserLogin(user);
                    } else {
                        Auth.eraseCookie('jwt');
                    }
                }
            } catch (error) {
                console.error('Error decoding user from jwt:', error);
                this.user = null;
                this.editorScreen.onUserLogout();
            }

            try {
                const isMuted = localStorage.getItem('mute');

                if (isMuted === 'true') {
                    Sounds.muteMusic(true);
                    Sounds.muteSfx(true);
                    this.mute.imageRectOffset = new Vector2(16, 0);
                } else if (isMuted === undefined) {
                    localStorage.setItem('mute', 'false');
                }
            } catch (error) {
                localStorage.setItem('mute', 'false');
            }

            const urlParams = new URLSearchParams(window.location.search);
            const temporarySigninToken = urlParams.get('tst');
            const resetCode = urlParams.get('code');

            if (temporarySigninToken !== null) {
                const user = await Auth.me(temporarySigninToken);

                if (user.error === undefined) {
                    this.user = user;
                    Auth.setCookie('jwt', Auth.encodeUser(user), 1);
                    this.editorScreen.onUserLogin(user);

                    this.editorScreen.currentAccountScreen.visible = false;
                    this.editorScreen.resetPasswordScreen.setResetCode(resetCode);
                    this.editorScreen.resetPasswordScreen.visible = true;
                }
            }

            this.initialized = true;
            this.initializing = false;
        }

        performKeybinds () {
            document.addEventListener('keydown', (event) => {
                if (UITextBox.current !== null) return; // absorb key events if a text box is active
                
                const key = event.key.toLowerCase();

                switch (key) {
                    case 'd':
                        this.editorScreen.spriteEditor.setMode(SpriteEditor.DRAW);
                        this.editorScreen.editorButtons.setButtonActive(EditorButtons.BUTTON_DRAW);
                        break;
                    case 'e':
                        this.editorScreen.spriteEditor.setMode(SpriteEditor.ERASE);
                        this.editorScreen.editorButtons.setButtonActive(EditorButtons.BUTTON_ERASE);
                        break;
                    case 'a':
                        this.editorScreen.spriteEditor.setMode(SpriteEditor.SAMPLE);
                        this.editorScreen.editorButtons.setButtonActive(EditorButtons.BUTTON_SAMPLE);
                        break;
                    case 'u':
                        this.editorScreen.history.undo();
                        this.editorScreen.refreshPreview();
                        break;
                    case 'r':
                        this.editorScreen.history.redo();
                        this.editorScreen.refreshPreview();
                        break;
                    case 'c':
                        this.editorScreen.spriteEditor.clearPixels();
                        this.editorScreen.refreshPreview();
                        this.editorScreen.clearCurrentPost();
                        break;
                    case 's':
                        if (this.editorScreen.resetPasswordScreen.visible) return;
                        this.editorScreen.saveScreen.visible = !this.editorScreen.saveScreen.visible;
                        this.getModals().forEach(modal => {
                            if (modal !== this.editorScreen.saveScreen) {
                                modal.visible = false;
                            }
                        });
                        break;
                    case 'l':
                        if (this.editorScreen.resetPasswordScreen.visible) return;
                        this.editorScreen.loadScreen.visible = !this.editorScreen.loadScreen.visible;
                        this.getModals().forEach(modal => {
                            if (modal !== this.editorScreen.loadScreen) {
                                modal.visible = false;
                            }
                        });
                        break;
                }
            });
        }

        async preloadAll () {
            await Sounds.preloadAll((amount, total) => {
                this.writePreloadText(`Loading Sounds... ${Math.floor(amount / total * 100)}%`);
            });

            await Sprite.preloadAll((amount, total) => {
                this.writePreloadText(`Loading Sprites... ${Math.floor(amount / total * 100)}%`);
            });

            this.writePreloadText('Loading Assets...');
            await RotMGSpriteLoader.preloadAll();

            this.preloadScreen.visible = false;
        }

        writePreloadText (text) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.font = '16px myriadpro';
            this.context.fillStyle = '#ffffff';
            this.context.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
            this.context.textBaseline = 'alphabetic';
        }

        globalStart () {
            // called to start the main loop
            // of the art editor
            if (this.isRunning) return;
            this.isRunning = true;
            this.loop();
            Sounds.resumeAudioContext();
        }
        
        globalStop () {
            // stops main loop for the editor
            if (!this.isRunning) return;
            this.isRunning = false;
            Sounds.suspendAudioContext();
        }

        update (deltaTime) {
            if (!this.initialized) return;
            this.uiRoot.update(deltaTime);
            Tween.update(deltaTime);
        }

        render () {
            if (!this.initialized) return;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.uiRoot.render();
        }

        loop () {
            // render & update loop function
            if (!this.initialized || !this.isRunning)  return;
            
            const now = performance.now();
            const deltaTime = now - this.lastFrame;

            if (deltaTime > ArtEditor.FRAME_RATE_CAP) {
                this.lastFrame = now - (deltaTime % ArtEditor.FRAME_RATE_CAP);
                this.update(deltaTime);
                this.render();
            }

            requestAnimationFrame(this.loop.bind(this));
        }

        async login (email, password) {
            return Auth.signIn(email, password).then((result) => {
                if (result.error === undefined) {
                    this.user = result;
                    Auth.setCookie('jwt', Auth.encodeUser(result), 1);
                    this.editorScreen.onUserLogin(result);
                }

                return result;
            }).catch((error) => {
                console.error('Error logging in:', error);
                return { error: 'An error occurred. Please try again later.'};
            });
        }

        async logout () {
            if (this.user === null) {
                return;
            }

            return Auth.signOut(this.user.token).then((result) => {
                return result;
            }).catch((error) => {
                console.error('Error logging out:', error);
                return { error: 'An error occurred. Please try again later.'};
            }).finally((result) => {
                this.user = null;
                Auth.eraseCookie('jwt');
                this.editorScreen.onUserLogout();
                return result;
            });
        }

        async register (username, email, password) {
            if (this.user !== null) {
                await this.logout();
            }

            return Auth.register(username, email, password).then((result) => {
                if (result.error === undefined) {
                    this.user = result;
                    this.editorScreen.onUserLogin(result);
                }

                return result;
            }).catch((error) => {
                console.error('Error registering:', error);
                return { error: 'An error occurred. Please try again later.'};
            });
        }

        isModalOpen () {
            return this.getModals().some(modal => modal.visible);
        }

        getModals () {
            return [this.welcomeScreen, this.legalScreen, ...this.editorScreen.getModals()];
        }
    }
})()