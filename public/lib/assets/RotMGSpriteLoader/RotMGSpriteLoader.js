import { Page } from "./page.js";
import { Constants } from "../../utils/constants.js";

export const RotMGSpriteLoader = (function () {
    return class RotMGSpriteLoader {
        // static OBJECTS_JSON_URL = 'https://static.drips.pw/rotmg/production/current/json/Objects.json';
        static OBJECTS_JSON_URL = Constants.ORIGIN + '/Objects.json';
        static globalObjects = null;
        static objecLoadPromise = null;   

        constructor (pageSize) {
            this.pageSize = pageSize;
            this.pages = [];
        }

        static async preloadAll () {
            if (RotMGSpriteLoader.objecLoadPromise) return RotMGSpriteLoader.objecLoadPromise;
            
            const loadPromise = fetch(RotMGSpriteLoader.OBJECTS_JSON_URL)
                .then((result) => result.json())
                .then((objectsJSON) => {
                    RotMGSpriteLoader.globalObjects = objectsJSON.Object.filter((object) => {
                        const texture = object.Texture || object.AnimatedTexture;
                        const notInvisible = texture && texture.File !== 'invisible';
                        return texture && notInvisible;
                    });
                });
            
            RotMGSpriteLoader.objecLoadPromise = loadPromise;

            return loadPromise;
        }

        isLoaded () {
            return RotMGSpriteLoader.globalObjects !== null;
        }

        waitLoad () {
            return RotMGSpriteLoader.objecLoadPromise;
        }

        initializePages () {
            const totalPages = this.getTotalPages();

            for (let index = 0; index < totalPages; index++) {
                const startIndex = index * this.pageSize;
                const endIndex = startIndex + this.pageSize;
                
                const objects = RotMGSpriteLoader.globalObjects.slice(startIndex, endIndex);
                const page = new Page(index, objects);

                this.pages.push(page);
            }
        }

        getTotalPages () {
            // return this.pages.reduce((a, b) => {
                
            // }, 0);
            return Math.ceil(RotMGSpriteLoader.globalObjects.length / this.pageSize);
        }

        getPage (index) {
            if (this.pages.length === 0) this.initializePages();
            return this.pages.at(index % this.pages.length);
        }
        
        query (searchQuery) {
            if (this.pages.length === 0) this.initializePages();
            let resultObjects = [];
            const pages = [];

            this.pages.forEach((page) => {
                const matches = page.query(searchQuery);

                if (matches.length > 0) {
                    for (let i = 0; i < matches.length; i++) {
                        resultObjects.push(matches[i]);
                    }
                }
            });

            const totalPages = Math.ceil(resultObjects.length / this.pageSize);
    
            for (let i = 0; i < totalPages; i++) {
                const startIndex = i * this.pageSize;
                const endIndex = startIndex + this.pageSize;
                
                const objects = resultObjects.slice(startIndex, endIndex);
                const page = new Page(i, objects, false);

                pages.push(page);
            }

            return pages;
        }
    }
})();