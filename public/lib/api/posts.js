import { API } from "./api.js";

export const Posts = (function (){
    return class Posts {
        static async createPost (name, tags, image, type, isAnimated) {
            return API.post('/create-post', { name, tags, image, type, isAnimated, token: ArtEditor.user.token });
        }

        static async deletePost (postid) {
            return API.post('/delete-post', { postid, token: ArtEditor.user.token });
        }

        static async getPosts (mineOnly = true, tags = [], type  = '', offset) {
            if (mineOnly) {
                return API.post('/get-posts', { mineOnly, tags, type, offset, token: ArtEditor.user.token });
            } else {
                return API.post('/get-posts', { mineOnly, tags, type, offset });
            }
        }
    }
})();