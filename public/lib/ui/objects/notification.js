import { UIBase } from "../uiBase.js";
import { Vector2 } from "../../utils/vector2.js";
import { UIText } from "../uiText.js";
import { UIImage } from "../uiImage.js";
import { Sprite } from "../../assets/sprite.js";
import { RotmgButtonBorder } from "./rotmgButtonBorder.js";
import { Utils } from "../../utils/utils.js";
import { Posts } from "../../api/posts.js";
import { Post } from "../../utils/post.js";
import { NotificationsAPI } from "../../api/notificationsAPI.js";

export const Notification = (function () {
    return class Notification extends UIBase {
        constructor(notif, options) {
            super({
                sizeScale: new Vector2(1, 0),
                size: new Vector2(-11, 100),
                backgroundEnabled: true,
                backgroundColor: notif.is_read === 0 ? '#4D4D4D' : '#363636',
                borderSize: 1,
                borderColor: 'grey',
                clickable: true,
                ...options
            });

            this.mouseEnter.listen(() => this.backgroundColor = '#585858');
            this.mouseLeave.listen(() => this.backgroundColor = notif.is_read === 0 ? '#4D4D4D' : '#363636');

            this.header = new UIText(notif.subject, {
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 45),
                position: new Vector2(0, 10),
                font: notif.is_read === 0 ? 'myriadpro_bold' : 'myriadpro_light',

                fontSize: 18,
                fontColor: 'white',
                textXAlignment: 'left',
                textYAlignment: 'center',
                paddingLeft: 10,

                shadow: true,
                shadowBlur: 2,
            });
            this.header.parentTo(this);

            var text = notif.message;

            if (text.length > 100) {
                text = text.substring(0, 100) + '...';
            }

            this.body = new UIText(text, {
                position: new Vector2(0, 45),
                sizeScale: new Vector2(1, 1),
                size: new Vector2(0, -45),
                font: 'myriadpro_light',

                fontSize: 14,
                fontColor: '#B5B5B5',
                textXAlignment: 'left',
                textYAlignment: 'top',
                paddingLeft: 10,
                paddingRight: 10,

                shadow: true,
                shadowBlur: 2,
            });
            this.body.parentTo(this);

            this.date = new UIText(Utils.formatTime(new Date(notif.created_at)), {
                size: new Vector2(0, 45),
                sizeScale: new Vector2(1, 0),
                font: 'myriadpro_light',

                fontSize: 14,
                fontColor: 'white',
                textXAlignment: 'left',
                textTransparency: 0.5,
                paddingTop: -10,
                paddingLeft: notif.is_read === 0 ? 30 : 10,

                shadow: true,
                shadowBlur: 2,
            });
            this.date.parentTo(this);

            this.deleteButton = new RotmgButtonBorder('X', {
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
            this.deleteButton.mouseDown.listen(() => this.absorb = true);
            this.deleteButton.mouseUp.listen(() => this.absorb = false);
            this.deleteButton.parentTo(this);

            this.unreadIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(0, 3*16),
                position: new Vector2(0, -5),
                size: new Vector2(32, 32),
                visible: notif.is_read === 0,
            });
            this.unreadIcon.parentTo(this);


            this.notification = notif;
            this.absorb = false;
            this.isWorking = false;
            this.parentChanged.listen(() => this.sizeAbsolute.y = this.body.getTextHeight() + 70);

            this.mouseUp.listen(() => {
                if (this.isWorking || this.absorb) return

                var metadata = JSON.parse(notif.metadata);
                
                switch(notif.type) {
                    case "comment":
                    case "comment_reply":
                        const postId = metadata.post_id;
                        const comment_id = metadata.comment_id;

                        const promise = Posts.getPost(postId);

                        promise
                            .then(({result: post}) => {
                                ArtEditor.editorScreen.notifications.visible = false;
                                ArtEditor.editorScreen.loadScreen.visible = true;
                                ArtEditor.editorScreen.loadScreen.modal.visible = false;
                                ArtEditor.editorScreen.loadScreen.viewingObject = post;
                                ArtEditor.editorScreen.loadScreen.aboutScreen.visible = true;
                                ArtEditor.editorScreen.loadScreen.aboutModal.visible = true;
                               
                                return ArtEditor.editorScreen.loadScreen.aboutScreen.load(post !== null ? new Post(post) : null, comment_id);
                            })
                            .then(() => {
                                return NotificationsAPI.readNotification(notif.id, ArtEditor.user?.token);
                            })
                            .catch((error) => console.error(error))
                            .finally(() => {
                                this.isWorking = false;
                                this.markAsRead();
                            });

                        break;
                }
            })
        }

        markAsRead() {
            this.isWorking = true;
            this.unreadIcon.visible = false;
            this.date.paddingLeft = 10;
            this.backgroundColor = '#363636';
            this.notification.is_read = 1;
        }
    }
})();