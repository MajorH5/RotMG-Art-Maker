import { RotMGSpriteLoader } from "../assets/RotMGSpriteLoader/RotMGSpriteLoader.js";
import { Page } from "../assets/RotMGSpriteLoader/page.js";
import { Posts } from "../api/posts.js";
import { Post } from "./post.js";

export const Query = (function () {
    return class {
        static async searchMyPosts (tags, type, offset) {
            const results = await Posts.getPosts(true, tags, type, offset);

            results.posts = results.posts.map((post) => {
                return new Post(post);
            });
            
            return results;
        }
        
        static async searchAllPosts (tags, type, offset) {
            const results = await Posts.getPosts(false, tags, type, offset);

            results.posts = results.posts.map((post) => {
                return new Post(post);
            });
            
            return results;
        }

        static async searchSprites (tags) {
            const sprites = RotMGSpriteLoader.getAllSprites();

            return sprites.filter((sprite) => {
                return sprite.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sprite.displayId.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        static divideObjects (objects, pageSize) {
            const totalPages = Math.ceil(objects.length / pageSize);
            const pages = [];
    
            for (let i = 0; i < totalPages; i++) {
                const startIndex = i * pageSize;
                const endIndex = startIndex + pageSize;
                
                const divded = objects.slice(startIndex, endIndex);
                const page = new Page(i, divded, false);

                pages.push(page);
            }

            return pages;
        } 
        
        static async search (domain, type, tags, pageIndex = 0) {
            const OBJECTS_PER_PAGE = 15;

            domain = arguments[0];

            if (domain === 'Deca') {
                const objects = ArtEditor.editorScreen.loadScreen.spriteLoader.query(tags, type);
                const pages = Query.divideObjects(objects, 15);

                return [pages.at(pageIndex % pages.length), Math.ceil(objects.length / OBJECTS_PER_PAGE)];
            } else if (domain === 'Community') {
                const { posts, total } = await Query.searchAllPosts(tags, type, pageIndex * OBJECTS_PER_PAGE);
                const page = new Page(pageIndex, posts, false);

                return [page, Math.ceil(total / OBJECTS_PER_PAGE)];
            } else if (domain === 'Mine') {
                const { posts, total } = await Query.searchMyPosts(tags, type, pageIndex * OBJECTS_PER_PAGE);
                const page = new Page(pageIndex, posts, false);
                
                return [page, Math.ceil(total / OBJECTS_PER_PAGE)];
            } else if (domain === 'All') {
                const objects = ArtEditor.editorScreen.loadScreen.spriteLoader.query(tags, type);
                const totalRotMGResults = objects.length;
                let totalRealmSpriterResults = 0;
                let totalRealmPages = Math.ceil(objects.length / OBJECTS_PER_PAGE) + 1;
                let actualIndex = (pageIndex % totalRealmPages + totalRealmPages) % totalRealmPages;
                
                if ((actualIndex + 1) * OBJECTS_PER_PAGE > totalRotMGResults) {
                    const end = (actualIndex + 1) * OBJECTS_PER_PAGE - totalRotMGResults;
                    let start = end - OBJECTS_PER_PAGE;
                    
                    if (start < 0) {
                        start = 0;
                    }

                    for (let i = 0; i < start; i++) {
                        objects.push(null);
                    }

                    const { posts, total } = await Query.searchAllPosts(tags, type, start);

                    for (let i = 0; i < posts.length; i++) {
                        objects.push(posts[i]);
                    }

                    totalRealmSpriterResults = total;
                }

                const pages = Query.divideObjects(objects, 15);
                let totalPages = pages.length;

                if (totalPages > 0) {
                    pageIndex = (pageIndex % totalPages + totalPages) % totalPages;
                } else {
                    pageIndex = 0;
                }


                return [pages.at(pageIndex), totalPages];
            }
        }
    }
})();