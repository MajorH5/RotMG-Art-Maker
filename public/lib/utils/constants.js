import { Vector2 } from "./vector2.js";

export const Constants = (function () {
    const DEV_ENVIRONMENT = !location.origin.includes('rotmgartmaker');

    return {
        MOBILE_ENVIRONMENT: false,
        ORIGIN: DEV_ENVIRONMENT ? "http://localhost" : "https://rotmgartmaker.com",
        DEFAULT_CANVAS_SIZE: new Vector2(880, 700),
    }
})();