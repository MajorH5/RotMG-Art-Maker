import { AudioObject } from "./audioObject.js";
import { AudioSource } from "./audioSource.js";

export const Sounds = (function () {
    return class Sounds {
        static sfxContext = new AudioContext();
        static musicContext = new AudioContext();

        static SND_BUTTON_CLICK = new AudioSource('/assets/sounds/button_click.mp3', Sounds.sfxContext);
        static SND_ERROR = new AudioSource('/assets/sounds/error.mp3', Sounds.sfxContext);
        
        static SND_THEME = new AudioSource('/assets/sounds/sorc.mp3', Sounds.musicContext);

        static GLOBAL_VOLUME = 1;

        static MUSIC_DEFAULT_VOLUME = 0.25;
        static SFX_DEFAULT_VOLUME = 0.25;

        static user_SfxEnabled = true;
        static user_MusicEnabled = true;

        static system_SfxEnabled = true;
        static system_MusicEnabled = true;

        static currentTheme = null;

        static activeSounds = [];

        static async preloadAll(callback) {
            let totalLoaded = 0;

            let promises = Object.values(Sounds)
                .filter(sound => sound instanceof AudioSource)
                .map(sound => {
                    return sound.load();
                });

            if (callback) {
                promises.forEach(promise => {
                    promise.then(() => {
                        totalLoaded++;
    
                        callback(totalLoaded, promises.length);
                    });
                });
    
                callback(totalLoaded, promises.length);
            }

            return Promise.all(promises);
        }

        static allLoaded() {
            return Object.values(Sounds)
                .filter(sound => sound instanceof AudioSource)
                .every(sound => {
                    return sound.isLoaded();
                });
        }

        // plays the given audio object
        static play (audioObject, timePosition = 0) {
            audioObject.played.listen(() => {
                Sounds.activeSounds.push(audioObject);
            });
            
            audioObject.stopped.listen(() => {
                const index = Sounds.activeSounds.indexOf(audioObject);
                
                if (index === -1) { return; }

                Sounds.activeSounds.splice(index, 1);
            });

            audioObject.play(timePosition);
        }

        // plays a given sound effect once
        static async playSfx(audioSource, volume = Sounds.SFX_DEFAULT_VOLUME, rate = 1) {
            if (!(audioSource instanceof AudioSource)) {
                console.error('Invalid sound effect provided to playSfx()');
                return;
            }

            const soundEffect = new AudioObject(audioSource, true);
            
            const sfxAreMuted = !Sounds.user_SfxEnabled || !Sounds.system_SfxEnabled;

            if (sfxAreMuted) {
                soundEffect.mute();
            }

            soundEffect.setVolume(volume * Sounds.GLOBAL_VOLUME);
            soundEffect.setPlaybackRate(rate);

            Sounds.play(soundEffect);

            return soundEffect;
        }

        // plays a given theme sound and loops it
        // will stop the current theme if one is playing
        static async playTheme(audioSource, volume = Sounds.MUSIC_DEFAULT_VOLUME, crossfade = 0, loops = true, timePosition = 0) {
            if (Sounds.currentTheme && Sounds.currentTheme.audioSource === audioSource) {
                // the theme is already playing
                return;
            }

            if (!(audioSource instanceof AudioSource)) {
                console.error('Invalid theme provided to playTheme()');
                return;
            }

            if (Sounds.currentTheme !== null && crossfade === 0) {
                Sounds.currentTheme.pause();
            }

            let oldTheme = Sounds.currentTheme;
            let newTheme = new AudioObject(audioSource);

            const themesAreMuted = !Sounds.user_MusicEnabled || !Sounds.system_MusicEnabled;

            if (themesAreMuted) {
                newTheme.mute();
            }
            
            Sounds.currentTheme = newTheme;
            Sounds.currentTheme.setVolume((crossfade > 0 ? 0 : volume) * Sounds.GLOBAL_VOLUME);
            Sounds.currentTheme.setLoop(loops);
            Sounds.play(Sounds.currentTheme, timePosition);

            // fade logic
            if (crossfade > 0) {
                if (oldTheme !== null && oldTheme !== newTheme) {
                    oldTheme.tweenVolume(0, crossfade, true);
                }

                newTheme.tweenVolume(volume, crossfade);
            }

            return Sounds.currentTheme;
        }

        // stops the currently playing theme
        static stopTheme(fade = 0) {
            const currentTheme = Sounds.currentTheme;

            if (currentTheme !== null) {
                if (fade <= 0) {
                    currentTheme.pause();
                } else {
                    currentTheme.tweenVolume(0, fade, true);
                }

                Sounds.currentTheme = null;
            }
        }

        // updates all currently playing audio objects
        static update (dt) {
            for (let i = 0; i < Sounds.activeSounds.length; i++) {
                let audioObject = Sounds.activeSounds[i];
                audioObject.update(dt);
            }
        }

        // returns true if a theme is currently playing
        static isThemePlaying() {
            return Sounds.currentTheme !== null;
        }

        // returns true if the given theme is currently playing
        static isThemePlayingType(audioSource) {
            if (Sounds.currentTheme === null) {
                return false;
            }

            return Sounds.currentTheme.audioSource === audioSource;
        }

        // suspends all active audio objects
        static suspendActiveObjects () {
            Sounds.currentTheme = null;
            Sounds.activeSounds.slice().forEach(sound => {
                sound.pause();
            });
        }

        // suspends both the music and sfx context
        static suspendAudioContext () {
            Sounds.musicContext.suspend();
            Sounds.sfxContext.suspend();
        }

        // resume the music and sfx context
        static resumeAudioContext () {
            Sounds.musicContext.resume();
            Sounds.sfxContext.resume()
        }

        // toggles the audio objects which match
        // the given predicate function
        static toggleAudioObjects (predicate, shouldMute) {
            Sounds.activeSounds.filter(predicate).forEach((sound) => {
                if (shouldMute) {
                    sound.mute();
                } else {
                    sound.unmute();
                }
            });
        }

        // mutes all sound effects
        static muteSfx(fromSystem) {
            if (fromSystem) {
                // game is muting sfx
                Sounds.system_SfxEnabled = false;
            } else {
                // user is muting sfx
                Sounds.user_SfxEnabled = false;
            }
            
            Sounds.toggleAudioObjects(sound => sound.isSfx(), true);
        }

        // unmutes all sound effects
        static unmuteSfx(fromSystem) {
            if (fromSystem && Sounds.user_SfxEnabled) {
                // game is unmuting sfx, only resume if user hasn't muted sfx
                Sounds.system_SfxEnabled = true;
                Sounds.toggleAudioObjects(sound => sound.isSfx(), false);
            } else if (!fromSystem) {
                // user is unmuting sfx
                Sounds.user_SfxEnabled = true;
                Sounds.toggleAudioObjects(sound => sound.isSfx(), false);
            }
        }

        // mutes all music
        static muteMusic(fromSystem = false) {
            if (fromSystem) {
                // game is muting music
                Sounds.system_MusicEnabled = false;
            } else {
                // user is muting music
                Sounds.user_MusicEnabled = false;
            }
            
            Sounds.toggleAudioObjects(sound => !sound.isSfx(), true);
        }

        // unmutes all music
        static unmuteMusic(fromSystem = false) {
            if (fromSystem) {
                Sounds.system_MusicEnabled = true;
                
                // game is unmuting music, only resume if user hasn't muted music
                if (Sounds.user_MusicEnabled) {
                    Sounds.toggleAudioObjects(sound => !sound.isSfx(), false);
                }
            } else if (!fromSystem) {
                // user is unmuting music
                Sounds.user_MusicEnabled = true;
                Sounds.toggleAudioObjects(sound => !sound.isSfx(), false);
            }
        }

    }
})();