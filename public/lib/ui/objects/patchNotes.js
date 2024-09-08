import { UIBase } from "../uiBase.js";
import { Modal } from "./modal.js";
import { Vector2 } from "../../utils/vector2.js";
import { UIText } from "../uiText.js";
import { Constants } from "../../utils/constants.js";
import { Notification } from "./notification.js";
import { Utils } from "../../utils/utils.js";
import { NotificationsAPI } from "../../api/notificationsAPI.js";
import { RotmgButtonDefault } from "./rotmgButtonDefault.js";

export const PatchNotes = (function () {
    return class PatchNotes extends Modal {
        constructor(options) {
            super({
                backgroundColor: '#363636',
                backgroundEnabled: true,
                clipChildren: true,
    
                borderRadius: 6,
                ...options
            });
            
            this.border = new UIBase({
                sizeScale: Vector2.one,
                positionScale: new Vector2(0.5, 0.5),
                size: new Vector2(-1, -1),
                pivot: new Vector2(0.5, 0.5),
                zIndex: 100,

                shadow: true,
                shadowBlur: 5,

                borderSize: 1,
                borderColor: '#ffffff',
                borderRadius: 6,
            });
            this.border.parentTo(this);

            this.header = new UIText(`Patch notes ${Constants.VERSION}`, {
                backgroundEnabled: true,
                backgroundColor: '#4D4D4D',
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 45),
                font: 'myriadpro_light',

                fontSize: 16,
                fontColor: '#B5B5B5',
                textXAlignment: 'left',
                textYAlignment: 'center',
                paddingLeft: 10,

                shadow: true,
                shadowBlur: 2,
            });
            this.header.parentTo(this);

            this.container = new UIBase({
                sizeScale: new Vector2(1, 1),
                position: new Vector2(0, 45),
                size: new Vector2(0, -45),
                scrollableY: true,
                clipChildren: true,
            });
            this.container.parentTo(this);

            this.notesText = new UIBase({
                sizeScale: new Vector2(1, 1),
            });
            this.notesText.parentTo(this.container);

            let commentY = 0;
            Constants.PATCH_NOTES[Constants.VERSION]
                .forEach((notes, index) => {
                    const primary = new UIText(`• ${notes[0]}`, {
                        size: new Vector2(-12, 20),
                        sizeScale: new Vector2(1, 0),
                        positionAbsolute: new Vector2(0, commentY),
                        font: 'myriadpro',

                        fontSize: 18,
                        fontColor: '#ffffff',
                        textXAlignment: 'left',
                        textYAlignment: 'top',
                        paddingTop: 20,
                        paddingLeft: 20,

                        shadow: true,
                        shadowBlur: 5,
                    });
                    primary.parentTo(this.notesText);
                    commentY += primary.getTextHeight();

                    if (notes.length > 0) {
                        notes
                            .slice(1)
                            .forEach((comment, index) => {
                                const secondary = new UIText(`- ${comment}`, {
                                    size: new Vector2(-12, 20),
                                    sizeScale: new Vector2(1, 0),
                                    positionAbsolute: new Vector2(0, commentY),
                                    font: 'myriadpro_light',
                    
                                    fontSize: 16,
                                    fontColor: 'white',
                                    textXAlignment: 'left',
                                    textYAlignment: 'top',
                                    textTransparency: 0.75,
                                    paddingTop: 20,
                                    paddingLeft: 40,
                    
                                    shadow: true,
                                    shadowBlur: 2,
                                });
                                secondary.parentTo(this.notesText);
                                commentY += secondary.getTextHeight();
                            });
                    }
                });
            
            this.container.canvasSize.y = Math.max(commentY - this.sizeAbsolute.y, 1);
        }
    }
})();