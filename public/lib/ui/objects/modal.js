import { UIBase } from '../uiBase.js';
export const Modal = (function () {
    return class Modal extends UIBase {
        constructor (options) {
            super({
                isModal: true,
                ...options
            });
        }
    }
})();