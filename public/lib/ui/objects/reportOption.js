import { UIBase } from '../uiBase.js';
import { Vector2 } from '../../utils/vector2.js';
import { UIText } from '../uiText.js';

export const ReportOption = (function () {
    return class ReportOption extends UIBase {
        constructor (text, options) {
            super({
                size: new Vector2(-12, 30),
                sizeScale: new Vector2(1, 0),
                clickable: true,
                backgroundEnabled: true,
                backgroundColor: '#222222',
                ...options
            });

            this.text = new UIText(text, {
                sizeScale: new Vector2(1, 1),
                font: 'myriadpro_light',
                fontSize: 14,
                fontColor: '#B5B5B5',
                textXAlignment: 'left',
                textYAlignment: 'center',
                paddingLeft: 10,
            });
            this.text.parentTo(this);

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

            this.isSelected = false;

            this.mouseUp.listen(() => {
                if (!this.clickable) return;
                this.isSelected = !this.isSelected;
                this.backgroundColor = this.isSelected ? '#aaaaaa' : '#222222';
                this.text.fontColor = this.isSelected ? '#000000' : '#B5B5B5';
            });
            
        }
    }
})();