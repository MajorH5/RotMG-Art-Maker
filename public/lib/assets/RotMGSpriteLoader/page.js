import { Object } from "./object.js";

export const Page = (function () {
    return class Page {
        constructor (pageIndex, objects, parseObjects = true) {
            this.pageIndex = pageIndex;
            this.objects = parseObjects ? this.parseObjects(objects) : objects;
            this.pageSize = objects.length;

            this.isLoaded = false;
            this.isLoading = false;
        }

        async load () {
            if (this.isLoaded || this.isLoading) return;

            this.isLoading = true;

            await Promise.all(this.objects.map((object) => object.load()));

            // note: even after await has finished,
            // not all are garunteed to be loaded (probably due to 404 on textures)

            this.isLoaded = true;
            this.isLoading = false;
        }

        parseObjects (objects) {
            const parsed = [];

            for (let i = 0; i < objects.length; i++) {
                const rawObject = objects[i];

                const {
                    id, Class,
                    Texture, AnimatedTexture,
                    DisplayId
                } = rawObject;

                const texture = Texture || AnimatedTexture;

                if (texture === undefined) {
                    // doesn't always necesarily mean it has no sprite,
                    // just not sure how to find it in this case
                    continue;
                }

                const object = new Object(texture.File, texture.Index, id, DisplayId || id, Class, AnimatedTexture !== undefined);
                
                parsed.push(object);
            }

            return parsed;
        }

        query (searchQuery) {
            const filtered = this.objects.filter((object) => {
                return object.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    object.displayId.toLowerCase().includes(searchQuery.toLowerCase());
            });

            return filtered;
        }
    }
})();