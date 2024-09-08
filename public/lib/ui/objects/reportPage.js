import { Vector2 } from "../../utils/vector2.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { Modal } from "./modal.js";
import { RotmgButtonBorder } from "./rotmgButtonBorder.js";
import { RotmgButtonDefault } from "./rotmgButtonDefault.js";
import { ReportOption } from "./reportOption.js";
import { Event } from "../../utils/event.js";

export const ReportPage = (function () {
    return class ReportPage extends Modal {
        constructor (headerText, options) {
            super({
                size: new Vector2(400, 230),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                
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

            this.header = new UIText(headerText, {
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

            this.closeButton = new RotmgButtonBorder('X', {
                size: new Vector2(24, 24),
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                position: new Vector2(-10, 10),
                fontSize: 13,
                paddingLeft: 0,
                textXAlignment: 'center',
                borderSize: 1,
                borderColor: '#666666',
                borderRadius: 5,
                clipChildren: true
            });
            this.closeButton.mouseUp.listen(() => {
                this.visible = false;
                this.unselectAll();
            });
            this.closeButton.parentTo(this);

            this.reportButton = new RotmgButtonDefault('Submit', {
                positionScale: new Vector2(1, 1),
                pivot: new Vector2(1, 1),
                position: new Vector2(-10, -10),
                size: new Vector2(100, 30),
            });
            this.reportButton.mouseUp.listen(() => {
                if (this.getReason().length === 0) {
                    this.error.visible = true;
                    return;
                }
                this.darken.visible = true
                this.reportButton.setActive(false);
                this.cancelButton.setActive(false);
                this.closeButton.visible = false;
                for (let i = 0; i < this.reportOptionContainer.children.length; i++) {
                    const reportOption = this.reportOptionContainer.children[i];
                    reportOption.clickable = false;
                }
                this.submitted.trigger(this.getReason());
            });
            this.reportButton.parentTo(this);
            
            this.cancelButton = new RotmgButtonDefault('Cancel', {
                positionScale: new Vector2(1, 1),
                pivot: new Vector2(1, 1),
                position: new Vector2(-120, -10),
                size: new Vector2(100, 30),
            });
            this.cancelButton.mouseUp.listen(() => {
                if (!this.cancelButton.active) return;
                this.visible = false;
                this.unselectAll();
            });
            this.cancelButton.parentTo(this);

            this.error = new UIText('Please choose a reason', {
                position: new Vector2(20, -5),
                positionScale: new Vector2(0, 1),
                pivot: new Vector2(0, 1),
                size: new Vector2(330, 50),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro_light',
                fontColor: '#FA8641',
                shadow: true,
                shadowBlur: 3,
                visible: false,
            });
            this.error.parentTo(this);

            this.infoText = new UIText('Please provide reason(s) for reporting:', {
                sizeScale: new Vector2(1, 1),
                position: new Vector2(0, 50),
                font: 'myriadpro_light',
                fontSize: 14,
                fontColor: 'white',
                textXAlignment: 'top',
                textYAlignment: 'left',
                textWraps: false,
                paddingTop: 10,
                paddingLeft: 20,
            });
            this.infoText.parentTo(this);

            this.reportOptionContainer = new UIBase({
                size: new Vector2(360, 160),
                position: new Vector2(20, 100),
                clipChildren: true,
                backgroundEnabled: true,
                borderRadius: 5,
                backgroundColor: '#222222',
                scrollableY: true
            });
            this.reportOptionContainer.parentTo(this);

            this.darken = new UIBase({
                sizeScale: new Vector2(1, 1),
                backgroundEnabled: true,
                transparency: 0.5,
                visible: false,
                zIndex: 100
            });
            this.darken.parentTo(this);

            const reportReasons = [
                "Spam or Unwanted Advertising",
                "Harassment or Hate Speech",
                "Offensive or Inappropriate Content",
                "Misinformation or False Information",
                "Violence or Harmful Behavior",
                "Copyright or Intellectual Property Violation",
                "Impersonation or Fake Account",
                "Scam or Fraud",
                "Personal Information Sharing"
            ];
            
            for (let i = 0; i < reportReasons.length; i++) {
                const reportOption = new ReportOption(reportReasons[i], {
                    position: new Vector2(0, i * 32),
                    zIndex: 10,
                    borderSize: 1,
                    borderColor: '#666666',
                    borderRadius: 5,
                    shadow: true,
                    shadowBlur: 2
                });
                reportOption.parentTo(this.reportOptionContainer);
            }

            this.submitted = new Event();
            this.reportOptionContainer.canvasSize.y = 32 * reportReasons.length - this.reportOptionContainer.sizeAbsolute.y;
        }        

        getReason () {
            return this.reportOptionContainer.children
                .filter((option) => option.isSelected)
                .map((option) => option.text.text);
        }
        
        unselectAll(){
            this.error.visible = false;
            this.darken.visible = false;          
            this.reportButton.setActive(true);
            this.cancelButton.setActive(true);
            this.closeButton.visible = true;
            this.reportOptionContainer.canvasPosition = new Vector2(0, 0);
            this.reportOptionContainer.goalCanvasPosition = new Vector2(0, 0);
            for (let i = 0; i < this.reportOptionContainer.children.length; i++) {
                const reportOption = this.reportOptionContainer.children[i];
                reportOption.isSelected = false;
                reportOption.backgroundColor = '#222222';
                reportOption.text.fontColor = '#B5B5B5';
                reportOption.clickable = true;
            }
        }
    }
})();