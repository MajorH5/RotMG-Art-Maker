import { API } from './api.js';

export const Comments = (function () {
    return class Comments {
        static async getComments (postId, offset = 0, token) {
            return API.post(`/get-comments`, { postId, offset, token });
        }

        static async getComment (commentId, token) {
            return API.post(`/get-comment`, { commentId, token });
        }

        static async getReplies (commentId, offset = 0, token) {
            return API.post(`/get-reply-comments`, { commentId, offset, token });
        }

        static async postComment (postId, content, token) {
            return API.post('/create-comment', { postId, token, content });
        }

        static async replyComment (commentId, content, token){
            return API.post('/reply-comment', { commentId, token, content });
        }

        static async deleteComment (commentId, token) {
            return API.post('/delete-comment', { commentId, token });
        }

        static async updateLikeStatus (commentId, token, status) {
            return API.post('/interact-comment', { commentId, token, status });
        }

        static async reportComment (commentId, reason, token) {
            return API.post('/report-comment', { commentId, token, reason });
        }
    }
})();