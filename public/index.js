import { ArtEditor } from "./lib/artEditor.js";

var global = global || (() => {
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof globalThis !== 'undefined') { return globalThis; }
    if (typeof this !== 'undefined') { return this; }
    
    throw new Error('index.js: Unable to locate global object');
})();

(async function () {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    const artEditor = new ArtEditor(canvas, context);

    // Expose the ArtEditor API to the global object
    // just so it can be accessed from the console
    Object.defineProperty(global, 'ArtEditor', {
        value: artEditor,
        writable: false,
        enumerable: false,
        configurable: false
    });

    await artEditor.initialize();
    artEditor.globalStart();
})();
