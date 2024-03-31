import { Vector2 } from "./vector2.js";

export const Constants = (function () {
    return {
        MOBILE_ENVIRONMENT: false,
        ORIGIN: "http://localhost:5500/public",
        DEFAULT_CANVAS_SIZE: new Vector2(880, 700),
    }
})();