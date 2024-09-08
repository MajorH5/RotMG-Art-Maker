import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { Sounds } from "../../assets/sounds.js";
import { Auth } from "../../api/auth.js";
import { Modal } from "../objects/modal.js";

export const DeleteScreen = (function () {
    return class DeleteScreen extends Modal {
        constructor (options) {
            super({
                backgroundColor: '#000000',
                backgroundEnabled: true,
                sizeScale: Vector2.one,
                zIndex: 9999,

                visible: false,
                ...options
            });

            this.modal = new UIBase({
                size: new Vector2(400, 230),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                
                backgroundColor: '#363636',
                backgroundEnabled: true,
                clipChildren: true,

                borderRadius: 6,
            });
            this.modal.parentTo(this);

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
            this.border.parentTo(this.modal);

            this.header = new UIText('Delete post', {
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
            this.header.parentTo(this.modal);

            this.infoLabel = new UIText('Are you sure you want to delete:', {
                position: new Vector2(35, 70),
                size: new Vector2(330, 20),
                textXAlignment: 'left',
                fontSize: 22,
                font: 'myriadpro_bold',
                fontColor: '#bbbbbb',
                shadow: true,
                shadowBlur: 3,
            });
            this.infoLabel.parentTo(this.modal);

            this.postName = new UIText('', {
                position: new Vector2(35, 115.5),
                size: new Vector2(280, 30),
                font: 'myriadpro_light',

                fontSize: 20,
                textWraps: false,
                
                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',

                textXAlignment: 'left',
                textBaseLine: 'middle',
            });
            this.postName.parentTo(this.modal);
            
            this.delete = new UIText('Delete', {
                positionScale: new Vector2(1, 1),
                position: new Vector2(-20, -20),
                pivot: new Vector2(1, 1),
                size: new Vector2(120, 30),
                clickable: true,
                textXAlignment: 'right',
                textYAlignment: 'bottom',
                font: 'myriadpro_bold',
                fontSize: 24,
                fontColor: '#ffffff'
            });
            this.bindHover(this.delete, '#ffda84');
            this.delete.parentTo(this.modal);

            let deleting = false;

            this.delete.mouseUp.listen(async () => {
                if (deleting) return;
                deleting = true;

                if (this.deleteFn !== null) {
                    await this.deleteFn(true)
                };

                deleting = false;
                this.visible = false;
                this.deleteFn = null;
            });

            this.cancel = new UIText('Cancel', {
                positionScale: new Vector2(0, 1),
                position: new Vector2(20, -20),
                pivot: new Vector2(0, 1),
                size: new Vector2(120, 30),
                clickable: true,
                textXAlignment: 'left',
                textYAlignment: 'bottom',
                font: 'myriadpro_bold',
                fontSize: 24,
                fontColor: '#ffffff'
            });
            this.bindHover(this.cancel, '#ffda84');
            this.cancel.parentTo(this.modal);

            this.cancel.mouseUp.listen(() => {
                if (this.deleteFn !== null) {
                    this.deleteFn(false);
                }
                this.visible = false;
            });

            this.deleteFn = null;
        }
        
        bindDelete (fn) {
            this.deleteFn = fn;
        }
        
        bindHover (object, hoverColor, defaultColor = '#ffffff') {
            object.mouseEnter.listen(() => { object.fontColor = hoverColor });
            object.mouseLeave.listen(() => { object.fontColor = defaultColor });
        }
    }
})();