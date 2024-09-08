// popup modal for loading in sprite art work
// from different sources

import { RotMGSpriteLoader } from "../../assets/RotMGSpriteLoader/RotMGSpriteLoader.js";
import { RotmgButtonBorder } from "../objects/rotmgButtonBorder.js";
import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { UIDropdownMenu } from "../uiDropdownMenu.js";
import { SpriteCell } from "../objects/spriteCell.js";
import { Vector2 } from "../../utils/vector2.js";
import { UITextBox } from "../uiTextBox.js";
import { UIBase } from "../uiBase.js";
import { UIText } from "../uiText.js";
import { PackagedSequence } from "../../utils/packagedSequence.js";
import { Event } from "../../utils/event.js";
import { Query } from "../../utils/query.js";
import { Posts } from "../../api/posts.js";
import { Post } from "../../utils/post.js";
import { AboutPostScreen } from "./aboutPostScreen.js";
import { Modal } from "../objects/modal.js";

export const LoadScreen = (function () {
    return class LoadScreen extends Modal {
        constructor (options) {
            super({
                sizeScale: Vector2.one,
                backgroundEnabled: true,
                backgroundColor: '#000000',
                // transparency: 0.5,
                zIndex: 9999,

                visible: false,
                ...options
            });

            this.modal = new UIBase({
                size: new Vector2(680, 550),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),

                backgroundColor: '#363636',
                backgroundEnabled: true,

                shadow: true,
                shadowBlur: 5,

                borderSize: 1,
                borderColor: '#ffffff',
                borderRadius: 6,
            });
            this.modal.parentTo(this);

            this.header = new UIText('Load', {
                position: new Vector2(0, 25),
                sizeScale: new Vector2(1, 0),
                font: 'myriadpro_bold',

                fontSize: 24,
                fontColor: '#578763',
                textXAlignment: 'center',
                textYAlignment: 'center',

                shadow: true,
                shadowBlur: 5,
            });
            this.header.parentTo(this.modal);

            this.sourceDropdown = new UIDropdownMenu({
                position: new Vector2(20.5, 50.5),

                choices: ['Deca', 'Mine', 'Community', 'All'],
                defaultChoice: 'Community'
            });;
            this.sourceDropdown.parentTo(this.modal);
            
            this.typeDropdown = new UIDropdownMenu({
                position: new Vector2(185.5, 50.5),
    
                choices: ['Any Type', 'Items', 'Entities', 'Tiles', 'Objects', 'Misc'],
                defaultChoice: 'Any Type'
            });
            this.typeDropdown.parentTo(this.modal);

            this.searchBox = new UITextBox('tags (comma-separated)', {
                position: new Vector2(350.5, 50.5),
                size: new Vector2(200, 30),
                
                fontColor: '#bbbbbb',
                borderColor: '#4f4f4f',
                placeholderColor: 'gray',

                borderSize: 1,
                paddingLeft: 5,
            });
            this.searchBox.parentTo(this.modal);

            this.searchButton = new RotmgButtonDefault('Search', {
                position: new Vector2(560.5, 50.5),
                size: new Vector2(100, 30),
            });
            this.searchButton.parentTo(this.modal);

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
            this.closeButton.parentTo(this.modal);

            this.closeButton.mouseUp.listen(() => {
                this.visible = false;
            });

            this.cells = new UIBase({
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 500),
                pivot: new Vector2(0, 1),
                positionScale: new Vector2(0, 1),
            });
            this.cells.parentTo(this.modal);
            
            this.loadingLabel = new UIText('Loading...', {
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 450),
                pivot: new Vector2(0, 1),
                positionScale: new Vector2(0, 1),
                fontSize: 20,
                font: 'myriadpro_bold',
                shadowBlur: 4,
                fontColor: '#bbbbbb',
                shadow: true,
            });
            this.loadingLabel.parentTo(this.modal);

            this.previous = new UIText('Previous', {
                positionScale: new Vector2(0, 1),
                position: new Vector2(20, -20),
                pivot: new Vector2(0, 1),
                size: new Vector2(70, 30),
                textXAlignment: 'left',
                textYAlignment: 'bottom',
                font: 'myriadpro_bold',
                fontSize: 18,
                fontColor: '#ffffff'
            });
            this.previous.mouseEnter.listen(() => { this.previous.fontColor = '#ffda84' });
            this.previous.mouseLeave.listen(() => { this.previous.fontColor = '#ffffff' });
            this.previous.parentTo(this.modal);
            this.previous.mouseUp.listen(() => {
                this.loadPage(this.currentIndex - 1);
            });
            
            this.next = new UIText('Next', {
                positionScale: new Vector2(1, 1),
                position: new Vector2(-20, -20),
                pivot: new Vector2(1, 1),
                size: new Vector2(40, 30),
                textXAlignment: 'right',
                textYAlignment: 'bottom',
                font: 'myriadpro_bold',
                fontSize: 18,
                fontColor: '#ffffff'
            });
            this.next.mouseEnter.listen(() => { this.next.fontColor = '#ffda84' });
            this.next.mouseLeave.listen(() => { this.next.fontColor = '#ffffff' });
            this.next.parentTo(this.modal);
            this.next.mouseUp.listen(() => {
                this.loadPage(this.currentIndex + 1);
            });

            this.pageCounter = new UIText('', {
                positionScale: new Vector2(0.5, 1),
                position: new Vector2(0, -20),
                pivot: new Vector2(0.5, 1),
                sizeScale: new Vector2(1, 0),
                size: new Vector2(0, 30),
                font: 'myriadpro_bold',
                fontSize: 20,
                shadow: true,
                shadowBlur: 4,
                visible: false,
                fontColor: '#bbbbbb'
            });
            this.pageCounter.parentTo(this.modal);

            this.cellsX = 5;
            this.cellsY = 3;
            
            this.aboutModal = this.modal.clone(false);
            this.aboutModal.sizeAbsolute = new Vector2(680, 660);
            this.aboutModal.visible = false
            this.viewingObject = null;
            this.aboutModal.parentTo(this);

            this.aboutScreen = new AboutPostScreen({});
            this.aboutScreen.backButton.mouseUp.listen(() => {
                this.aboutModal.visible = false;
                this.modal.visible = true;
                this.viewingObject = null;
            });
            this.aboutScreen.loadButton.mouseUp.listen(() => {
                const object = this.viewingObject;

                if (object === null) return;

                const [, rectSize] = object.getTextureRect();
                const frames = object.getTextureFrames();
                let objectData = null;

                if (object.isAnimatedTexture) {
                    objectData = PackagedSequence.fromFrames(frames, rectSize);
                } else {
                    objectData = frames[0].pixels;
                }

                if (object instanceof Post) {
                    this.onSelect.trigger(object.isAnimatedTexture, rectSize, objectData, object);
                } else {
                    this.onSelect.trigger(object.isAnimatedTexture, rectSize, objectData);
                }
                this.visible = false;
            });
            this.aboutScreen.deleteButton.mouseUp.listen(() => {
                if (!this.aboutScreen.deleteButton.active) return;

                const object = this.viewingObject;
                const deleteScreen = ArtEditor.editorScreen.deleteScreen;
                deleteScreen.postName.text = `"${object.postName}"`;
                deleteScreen.visible = true;
                this.aboutModal.visible = false;

                deleteScreen.bindDelete(async (shouldDelete) => {
                    if (ArtEditor.user === null) return;

                    if (shouldDelete) {
                        return Posts.deletePost(object.postId, ArtEditor.user.token)
                            .then(() => this.loadPage(this.currentIndex))
                            .catch((error) => {
                                console.log(error);
                            })
                            .finally(() => {
                                this.aboutModal.visible = !shouldDelete;
                                this.modal.visible = shouldDelete;
                            });
                    }

                    this.aboutModal.visible = !shouldDelete;
                    this.modal.visible = shouldDelete;
                });
            });
            this.aboutScreen.parentTo(this.aboutModal);

            this.spriteLoader = new RotMGSpriteLoader(this.cellsX * this.cellsY);
            this.currentSearchPage = null;
            this.currentIndex = 0
            this.totalPages = 0;
            this.isSearching = false;
            this.blanked = false;

            this.currentQuery = '';
            this.currentType = 'Any Type';
            this.currentSource = 'Community';

            this.searchButton.mouseUp.listen(() => this.query());
            this.searchBox.submit.listen(() => this.query());

            this.onSelect = new Event();

            setTimeout(() => {
                this.loadPage(0);
            }, 1000)
        }

        loadObject (object, index) {
            const cell = new SpriteCell(object);
            const indexPosition = new Vector2(index % this.cellsX, Math.floor(index / this.cellsX));
            
            const cellSize = cell.sizeAbsolute;
            
            const offsetX = (this.modal.sizeAbsolute.x - ((cellSize.x + 10) * this.cellsX)) / 2
            const offsetY = (this.cells.sizeAbsolute.y - ((cellSize.y + 10) * this.cellsY)) / 2
            
            const cellPosition = new Vector2(
                indexPosition.x * cellSize.x + 10 * indexPosition.x + offsetX,
                indexPosition.y * cellSize.y + 10 * indexPosition.y + offsetY
            );

            cell.positionAbsolute = cellPosition;
            cell.parentTo(this.cells);

            // cell.deleteButton.mouseUp.listen(() => {
            //     const deleteScreen = ArtEditor.editorScreen.deleteScreen;
            //     deleteScreen.postName.text = `"${object.postName}"`;
            //     deleteScreen.visible = true;

            //     deleteScreen.bindDelete(async () => {
            //         if (ArtEditor.user === null) return;

            //         await Posts.deletePost(object.postId, ArtEditor.user.token);
            //         await this.loadPage(this.currentIndex);
            //     });
            // });

            // cell.aboutButton.mouseUp.listen(() => {
            //     this.aboutScreen.load(object);
            //     this.aboutModal.visible = true;
            //     this.modal.visible = false
            // });

            cell.mouseUp.listen(() => {
                if (cell.absorb) return;
                if (this.sourceDropdown.isOpen()) return;
                if (this.typeDropdown.isOpen()) return;
                if (ArtEditor.editorScreen.deleteScreen.visible) return;
                
                this.aboutScreen.load(object);
                this.aboutModal.visible = true;
                this.modal.visible = false;
                this.viewingObject = object;
            });
        }

        query () {
            this.currentQuery = this.searchBox.text;
            this.currentType = this.typeDropdown.currentChoice;
            this.currentSource = this.sourceDropdown.currentChoice;
            return this.loadPage(0);
        }

        async loadPage (pageIndex) {
            if (!this.spriteLoader.isLoaded()) await this.spriteLoader.waitLoad();
            if (this.isSearching) return;

            this.isSearching = true;
            
            this.cells.clearChildren();

            this.loadingLabel.text = 'Loading...';
            this.loadingLabel.visible = true;

            const tags = this.currentQuery.split(',').filter((tag) => tag.trim());
            const type = this.currentType;
            const source = this.currentSource;

            if (source === 'Mine' && ArtEditor.user === null) {
                this.visible = false;
                ArtEditor.editorScreen.signInScreen.visible = true;
                this.isSearching = false;
                this.loadingLabel.visible = false;
                return;
            }

            let page, totalPages;

            try {
                [page, totalPages] = await Query.search(source, type, tags, pageIndex);
            } catch (error) {
                this.loadingLabel.text = 'Error loading';
                this.loadingLabel.visible = true;
                this.isSearching = false;
                this.previous.visible = false;
                this.next.visible = false;
                return;
            }

            this.previous.visible = totalPages > 1 && page.pageIndex !== 0;
            this.next.visible = totalPages > 1 && page.pageIndex !== totalPages - 1;

            if (totalPages === 0) {
                this.loadingLabel.text = 'No results found';
                this.loadingLabel.visible = true;
                // this.pageCounter.visible = false;
                this.isSearching = false;
                return;
            }
            
            this.totalPages = totalPages;

            pageIndex %= this.totalPages;

            this.currentIndex = pageIndex;
            
            
            // this.pageCounter.visible = true;
            this.loadingLabel.visible = !page.isLoaded;

            await page.load();

            if (this.currentIndex !== pageIndex) {
                return; // page was changed while loading
            }
            const pageActual = pageIndex < 0 ? pageIndex + totalPages + 1 : pageIndex + 1;
            this.pageCounter.text = `Page ${pageActual} of ${totalPages}`;

            this.loadingLabel.visible = false;

            page.objects.forEach((object, index) => {
                try {
                    this.loadObject(object, index)
                } catch (e) {
                    console.error('Error while loading object:', e);
                }
            });

            this.isSearching = false;
        }
    }
})();