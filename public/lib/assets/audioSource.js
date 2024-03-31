import { Constants } from "../utils/constants.js";

export const AudioSource = (function () {
    return class AudioSource {
        // class for managing audio data
        constructor (src, audioContext) {
            this.src = Constants.ORIGIN + src;
            this.audioContext = audioContext;
            this.buffer = null;
            this.loaded = false;
            this.loading = false;
        }

        // loads in the audio data
        // from the given source
        async load () {
            if (this.loaded || this.loading) return;

            this.loading = true;
            this.buffer = await fetch(this.src)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    this.loaded = true;
                    return this.audioContext.decodeAudioData(buffer)
                })
                .catch(e => {
                    console.error(`There was an error loading sound ${this.src}\n\t${e}`);
                    return null;
                });
            }

        // returns true if the audio
        // data has been loaded
        isLoaded () {
            return this.buffer !== null && this.loaded;
        }

        // returns true if the audio
        // data is currently loading
        isLoading () {
            return this.loading;
        }

        // returns the audio data
        getBuffer () {
            return this.buffer;
        }

        // returns the audio context
        getAudioContext () {
            return this.audioContext;
        }

        // returns the audio source
        getAudioSource () {
            return this.src;
        }
    }
})();