import { RotMGSpriteLoader } from "../assets/RotMGSpriteLoader/RotMGSpriteLoader.js";
import { Page } from "../assets/RotMGSpriteLoader/page.js";
import { Posts } from "../api/posts.js";

export const Query = (function () {
    return class {
        static async searchMyPosts (tags, type, pageIndex) {
            return Posts.getPosts(true, tags, type, pageIndex);
        }

        static async searchAllPosts (tags, type, pageIndex) {
            return Posts.getPosts(false, tags, type, pageIndex);
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
                
                const objects = objects.slice(startIndex, endIndex);
                const page = new Page(i, objects, false);

                pages.push(page);
            }

            return pages;
        } 

        static getSearchIndex (totalRotMGResults, totalRealmSpriterResults, pageIndex) {
            const OBJECTS_PER_PAGE = 15;
            
            // if there are no realm spriter results
            // then no point in searching further
            if (totalRealmSpriterResults === 0) {
                return null;
            }

            // check if this page is still within bounds
            /// of the rotmg sprites
            if ((pageIndex + 1) * OBJECTS_PER_PAGE <= totalRotMGResults) {
                // no need to query realm spriter for this page
                return null;
            }

            const excess = (pageIndex + 1) * OBJECTS_PER_PAGE - totalRotMGResults;
            const searchIndex = Math.floor(excess / OBJECTS_PER_PAGE);

            return [searchIndex, excess % OBJECTS_PER_PAGE];
        }
        
        static async search (domain, type, tags, pageIndex = 0) {
            const OBJECTS_PER_PAGE = 15;

            if (domain === 'Deca') {
                const objects = ArtEditor.editorScreen.loadScreen.spriteLoader.query(tags, type);
                const pages = Query.divideObjects(objects, 15);

                return [pages.at(pageIndex % pages.length), 0];
            } else if (domain === 'Community') {
                const { posts, total } = await Query.searchAllPosts(tags, type, pageIndex);
                const page = new Page(pageIndex, posts, true);

                return [page, total];
            } else if (domain === 'Mine') {
                const { posts, total } = await Query.searchMyPosts(tags, type, pageIndex);
                const page = new Page(pageIndex, posts, true);
                
                return [page, total];
            } else if (domain === 'All') {
                const objects = ArtEditor.editorScreen.loadScreen.spriteLoader.query(tags, type);
                const { total } = await Query.searchAllPosts(tags, type, 0);
                
                if ((pageIndex + 1) * OBJECTS_PER_PAGE <= totalRotMGResults) {
                    const pages = Query.divideObjects(objects, 15);
                    return [pages.at(pageIndex % pages.length), null];
                }

                const [searchIndex, excess] = Query.getSearchIndex(objects.length, total, pageIndex);
                const { posts } = await Query.searchAllPosts(tags, type, searchIndex);

                
                
            }
        }
    }
})();