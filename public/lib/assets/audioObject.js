import { Event } from "../utils/event.js";
import { Tween } from "../utils/tween.js";

export const AudioObject = (function () {
    return class AudioObject {
        // creates a new audio context
        constructor (audioSource, isSfx = false) {
            this.audioSource = audioSource;
            this.audioContext = audioSource.getAudioContext();
            this.buffer = audioSource.getBuffer();
            this.src = audioSource.getAudioSource();

            this.playbackRate = 1;
            this.volume = 1;
            this.loop = false;
            this.elapsed = 0;
            this.sfx = isSfx;
            this.isMuted = false;
            this.volumeTween = null;
            
            // source -> gain -> audioContext -> destination
            this.source = this.audioContext.createBufferSource();
            this.source.loop = this.loop;
            this.source.buffer = this.buffer;
            this.source.playbackRate.value = this.playbackRate;
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume;
            
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            this.playing = false;
            this.completed = false;

            this.played = new Event();
            this.stopped = new Event();

            this.source.addEventListener('ended', () => {
                this.completed = true;
                this.stopped.trigger();
            });
        }

        // plays the audio from the beginning
        async play (timePosition) {
            if (this.playing || this.completed) return;

            if (!this.audioSource.isLoaded() && !this.audioSource.isLoading()) {
                // it was never preloaded, but we'll just go ahead and do that now
                await this.audioSource.load();

                if (this.audioSource.isLoaded()) {
                    this.buffer = this.audioSource.getBuffer();
                    this.source.buffer = this.buffer;
                }
            }

            this.source.start(0, timePosition);
            this.playing = true;
            this.played.trigger();
        }

        // pauses the audio at the current position
        pause () {
            if (!this.playing || this.completed) return;

            this.source.stop();
            this.playing = false;
            this.stopped.trigger();
        }

        // resumes the audio from the current position
        resume () {
            if (this.playing || this.completed) return;

            this.audioContext.resume();
            this.playing = true;
            this.played.trigger();
        }

        // tweens the volume of the audio
        tweenVolume (targetVolume, duration = 1, stopOnComplete = false) {
            if (this.volumeTween !== null) {
                this.volumeTween.cancel();
            }

            this.volumeTween = new Tween(duration * 1000, [[this.volume, targetVolume]]);

            const promise = this.volumeTween.begin((volume) => {
                this.setVolume(volume);
            });
            
            if (stopOnComplete) {
                promise.then(() => {
                    this.pause();
                });
            }

            return promise;
        }

        // temporarily mutes the audio object
        mute () {
            this.gainNode.gain.value = 0;
            this.isMuted = true;
        }

        // unmutes the audio object
        unmute () {
            this.gainNode.gain.value = this.volume;
            this.isMuted = false;
        }

        // returns true if the audio is a sound effect
        isSfx () {
            return this.sfx;
        }

        // returns true if the audio is currently playing
        isPlaying () {
            return this.playing;
        }

        // sets the loop property of the audio
        setLoop (loop) {
            this.loop = loop;
            this.source.loop = loop;
        }

        // returns the actual volume of the audio
        getVolume () {
            return this.isMuted ? 0 : this.volume;
        }

        // sets the volume of the audio
        setVolume (volume) {
            this.volume = volume;
            
            if (!this.isMuted) {
                this.gainNode.gain.value = volume;
            }
        }

        // sets the playback rate of the audio
        setPlaybackRate (playbackRate) {
            this.playbackRate = playbackRate;
            this.source.playbackRate.value = playbackRate;
        }
    }
})();