import { UIBase } from "../uiBase.js";
import { Modal } from "./modal.js";
import { Vector2 } from "../../utils/vector2.js";
import { UIText } from "../uiText.js";
import { Notification } from "./notification.js";
import { Utils } from "../../utils/utils.js";
import { NotificationsAPI } from "../../api/notificationsAPI.js";
import { RotmgButtonDefault } from "./rotmgButtonDefault.js";

export const Notifications = (function () {
    return class Notifications extends Modal {
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

            this.header = new UIText('Notifications', {
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
            this.container.canvasSize.y = 1;
            this.container.parentTo(this);

            this.infoMessage = new UIText('No notifications', {
                position: new Vector2(0, 0),
                size: new Vector2(0, 0),
                sizeScale: new Vector2(1, 1),
                paddingTop: 20,
                textXAlignment: 'center',
                textYAlignment: 'top',
                fontSize: 16,
                font: 'myriadpro',
                fontColor: '#ffffff',
                textTransparency: 0.5,
                shadow: true,
                shadowBlur: 5,
            });
            this.infoMessage.text = 'Log in or create an account to receive notifications';
            this.infoMessage.parentTo(this.container);

            this.clearAll = new RotmgButtonDefault('Clear All', {
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                position: new Vector2(-10, 12),
                size: new Vector2(100, 25),
            });
            this.clearAll.mouseUp.listen(() => this.deleteAllNotifications());
            this.clearAll.parentTo(this);

            this.isLoading = false;
            this.isDeletingAll = false;
            this.stale = true;
            this.notifications = [];
        }

        hasUnviewedNotifications() {
            const lastViewed = this.getLastViewedNotifications();

            if (this.notifications.length === 0) {
                return false;
            }

            return this.notifications.some((notif) => {
                return new Date(notif.notification.created_at) > new Date(parseInt(lastViewed)) && notif.notification.is_read === 0;
            });
        }

        getLastViewedNotifications() {
            return localStorage.getItem('lastViewedNotifications');
        }

        markViewed () {
            localStorage.setItem('lastViewedNotifications', Date.now());
        }

        clearNotifications() {
            this.notifications.forEach(notif => notif.unparent());
            this.notifications = [];
            this.infoMessage.visible = true;
            this.container.canvasPosition = new Vector2(0, 0);
            this.container.goalCanvasPosition = new Vector2(0, 0);
            this.clearAll.setActive(false);
        }

        loadNotifications() {
            if (ArtEditor.user === null || this.isLoading) {
                return;
            }

            this.clearNotifications();
            this.isLoading = true;

            return NotificationsAPI.getNotifications(ArtEditor.user.token).then(res => {
                if (res.error) {
                    console.error(res.error);
                    return;
                }

                res.notifications.forEach(notif => {
                    this.addNotification(notif);
                });

                return res.notifications;
            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                this.isLoading = false
                this.stale = false;
            });
        }

        deleteNotification(notificationId) {
            const notif = this.notifications.find(notif => notif.notification.id === notificationId);

            if (!notif || notif.isDeleting) {
                return;
            }

            notif.isDeleting = true;

            NotificationsAPI.deleteNotification(notificationId, ArtEditor.user.token).then(res => {
                if (res.error) {
                    console.error(res.error);
                    return;
                }

                this.notifications = this.notifications.filter((notif) => {
                    if (notif.notification.id !== notificationId) {
                        return true;
                    }

                    notif.unparent();
                    return false;
                });
                this.updatePositions();

                if (this.notifications.length === 0) {
                    this.infoMessage.visible = true;
                }
            }).catch((error) => {
                console.error(error);
            });
        }

        deleteAllNotifications() {
            if (this.isDeletingAll || this.notifications.length === 0) {
                return;
            }

            this.isDeletingAll = true;

            NotificationsAPI.deleteAllNotifications(ArtEditor.user.token).then(res => {
                if (res.error) {
                    console.error(res.error);
                    return;
                }

                this.clearNotifications();
            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                this.isDeletingAll = false;
            });
        }

        updatePositions () {
            let y = 0;

            for (let i = 0; i < this.notifications.length; i++) {
                const notif = this.notifications[i];
                notif.positionAbsolute = new Vector2(0, y);
                y += notif.sizeAbsolute.y;
            }

            if (this.notifications.length > 0) {
                this.container.canvasSize = new Vector2(0, Math.max(1,y - this.sizeAbsolute.y + 100));
            } else {
                this.container.canvasSize = new Vector2(0, 1);
            }
        }

        addNotification(notif) {
            this.infoMessage.visible = false;

            const notification = new Notification(notif, {});
            notification.parentTo(this.container);
            notification.deleteButton.mouseUp.listen(() => this.deleteNotification(notif.id));
            this.notifications.push(notification);
            this.updatePositions();
            this.clearAll.setActive(true);
        }
    }
})();