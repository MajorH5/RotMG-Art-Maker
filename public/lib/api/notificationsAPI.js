import { API } from "./api.js";

export const NotificationsAPI = (function () {
    return class NotificationsAPI {
        static async getNotifications (token, offset = 0) {
            return API.post('/get-notifications', { token, offset });
        }

        static async deleteNotification (notificationId, token) {
            return API.post('/delete-notification', { notificationId, token });
        }

        static async deleteAllNotifications (token) {
            return API.post('/delete-all-notifications', { token });
        }

        static async readNotification (notificationId, token) {
            return API.post('/read-notification', { notificationId, token });
        }
    }
})();