import { Action } from "./action.js";

export const History = (function () {
    return class History {
        constructor () {
            this.handlers = {};
            this.pending = null;

            this.undoCache = [];
            this.redoCache = [];
        }

        register (tag, handler) {
            this.handlers[tag] = handler;
        }

        update (tag, data) {
            if (this.handlers[tag] === undefined) {
                throw new Error(`history.update(): no handler was under the tag "${tag}"`);
            }

            if (this.redoCache.length > 0) {
                this.redoCache = [];
            }

            if (this.pending === null || this.pending.getTag() !== tag) {
                this.close();
                this.pending = new Action(tag, data);
            } else {
                this.pending.insert(data);
            }
        }

        close () {
            if (this.pending !== null) {
                this.undoCache.push(this.pending);
                this.pending = null;
            }
        }
        
        undo () {
            this.close();
            
            const action = this.undoCache.pop();

            if (action !== undefined) {
                const handler = this.handlers[action.getTag()];
                const redo = handler(action);

                this.redoCache.push(redo);
            }
        }
        
        redo () {
            this.close();

            const action = this.redoCache.pop();

            if (action !== undefined) {
                const handler = this.handlers[action.getTag()];
                const undo = handler(action);

                this.undoCache.push(undo);
            }
        }

        clear () {
            this.undoCache = [];
            this.redoCache = [];
            this.pending = null;
        }

        getPendingAction () {
            return this.pending;
        }
    }
})();