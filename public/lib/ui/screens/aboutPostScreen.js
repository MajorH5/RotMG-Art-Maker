import { UIBase } from "../uiBase.js";
import { Vector2 } from "../../utils/vector2.js";
import { UIText } from "../uiText.js";
import { RotmgButtonBorder } from "../objects/rotmgButtonBorder.js";
import { RotMGSprite } from "../objects/rotmgSprite.js";
import { PostComment } from "../objects/postComment.js";
import { Sprite } from "../../assets/sprite.js";
import { UIImage } from "../uiImage.js";
import { CommentsManager } from "../objects/commentsManager.js";
import { Sounds } from "../../assets/sounds.js";
import { RotmgButtonDefault } from "../objects/rotmgButtonDefault.js";
import { ReportPage } from "../objects/reportPage.js";
import { Posts } from "../../api/posts.js";

export const AboutPostScreen = (function () {
    return class AboutPostScreen extends UIBase {
        constructor (options) {
            super({
                sizeScale: Vector2.one,
                zIndex: 9999,
                ...options
            });

            this.header = new UIText('About Post', {
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
            this.header.parentTo(this);
            
            
            this.backButton = new RotmgButtonBorder('Back', {
                size: new Vector2(100, 40),
                fontSize: 18,
                positionScale: new Vector2(1, 0),
                position: new Vector2(-20, 20),
                pivot: new Vector2(1, 0),
                font: 'myriadpro_bold',
                fontColor: '#ffffff',
                backgroundColor: '#578763',
                borderColor: '#ffffff',
                borderRadius: 6,
                borderSize: 1,
                shadow: true,
                shadowBlur: 5,
                textXAlignment: 'center',
                textYAlignment: 'center',
            });
            this.backIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(3*16, 3*16),
                positionScale: new Vector2(0.2, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.backIcon.parentTo(this.backButton);
            this.backButton.parentTo(this);
            
            this.sprite = new RotMGSprite(Vector2.zero, {
                // backgroundEnabled: true,
                // transparency: 0.75,
                backgroundColor: "#141414",
                shadow: true,
                shadowBlur: 5,
                positionScale: new Vector2(0.6, 0.15),
                size: new Vector2(16*7, 16*7),
                pivot: new Vector2(0.5, 0.5),
                clipChildren: true,
            });
            this.sprite.parentTo(this);

            const labelStyles = {
                textXAlignment: 'left', fontSize: 20,
                font: 'myriadpro_bold', fontColor: '#bbbbbb',
                shadow: true, shadowBlur: 5,
            };

            const contentStyles = {
                font: 'myriadpro', fontSize: 17,
                fontColor: '#bbbbbb', borderColor: '#4f4f4f',
                placeholderColor: 'gray', textShadowBlur: 5,
                // borderSize: 1,
                paddingLeft: 5,
                textXAlignment: 'left', textBaseLine: 'middle',
            };

            this.nameLabel = new UIText('Name:', {
                position: new Vector2(35, 0),
                size: new Vector2(100, 20),
                ...labelStyles
            });
            this.nameLabel.parentTo(this);

            this.nameContent = new UIText('Example Name', {
                position: new Vector2(150, 0),
                size: new Vector2(400, 20),
                ...contentStyles
            });
            this.nameContent.parentTo(this);

            this.creatorLabel = new UIText('Author:', {
                position: new Vector2(35, 0),
                size: new Vector2(100, 20),
                ...labelStyles
            });
            this.creatorLabel.parentTo(this);
            
            this.creatorContent = new UIText('Example Author', {
                position: new Vector2(150, 0),
                size: new Vector2(400, 20),
                clickable: true,
                underline: true,
                ...contentStyles
            });
            this.creatorContent.fontColor ='#578763';
            this.creatorContent.parentTo(this);

            this.typeLabel = new UIText('Type:', {
                position: new Vector2(35, 0),
                size: new Vector2(100, 20),
                ...labelStyles
            });
            this.typeLabel.parentTo(this);

            this.typeContent = new UIText('Example Type', {
                position: new Vector2(150, 0),
                size: new Vector2(400, 20),
                ...contentStyles
            });
            this.typeContent.parentTo(this);

            this.tagsLabel = new UIText('Tags:', {
                position: new Vector2(35, 0),
                size: new Vector2(200, 20),
                ...labelStyles
            });
            this.tagsLabel.parentTo(this);

            this.tagsContent = new UIText('Example Tags', {
                position: new Vector2(150, 0),
                size: new Vector2(400, 20),
                ...contentStyles
            });
            this.tagsContent.parentTo(this);

            this.postDateLabel = new UIText('Posted:', {
                position: new Vector2(35, 0),
                size: new Vector2(200, 20),
                ...labelStyles
            });
            this.postDateLabel.parentTo(this);

            this.postDateContent = new UIText('Example Date', {
                position: new Vector2(150, 0),
                size: new Vector2(400, 20),
                ...contentStyles
            });
            this.postDateContent.parentTo(this);

            this.commentsLabel = new UIText('', {
                position: new Vector2(35, 0),
                size: new Vector2(200, 20),
                ...labelStyles
            });
            this.commentsLabel.parentTo(this);

            this.commentsContainer = new CommentsManager({
                position: new Vector2(35, 0),
                size: new Vector2(-35*2, 350),
                sizeScale: new Vector2(1, 0),
            });
            this.commentsContainer.parentTo(this);
            
            const labels = [this.nameLabel, this.creatorLabel,
                this.typeLabel, this.tagsLabel,
                this.postDateLabel,
                this.commentsLabel];
            
            const contents = [this.nameContent, this.creatorContent,
                this.typeContent, this.tagsContent,
                this.postDateContent,
                this.commentsContainer
            ];
    
            const rootYPosition = 30;
            const spacing = 30;

            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];
                const content = contents[i];

                label.positionAbsolute.y = rootYPosition + spacing * (i + 1);
                content.positionAbsolute.y = rootYPosition + spacing * (i + 1);
            }

            this.loadButton = new RotmgButtonDefault('Load', {
                position: new Vector2(550, 80),
                size: new Vector2(100, 30),
            });
            this.loadButton.parentTo(this);

            this.deleteButton = new RotmgButtonDefault('Delete', {
                position: new Vector2(550, 80 + 40),
                size: new Vector2(100, 30),
            });
            this.deleteButton.setActive(false);
            this.deleteButton.parentTo(this);

            this.reportButton = new RotmgButtonDefault('Report', {
                position: new Vector2(550, 80 + 80),
                size: new Vector2(100, 30),
            });
            this.reportButton.parentTo(this);

            this.reportModal = new ReportPage('Report post', {
                size: new Vector2(400, 360),
                zIndex: 999,
                visible: false
            });
            this.reportButton.mouseUp.listen(() => {
                if (!this.reportButton.active) return;
                this.toggleAll(false);
                this.reportModal.unselectAll();
                this.reportModal.visible = true;
            });
            this.reportModal.submitted.listen((reason) => {
                if (!this.isReporting) {
                    if (ArtEditor.user !== null) {
                        this.submitReport(reason);
                    } else {
                        this.toggleAll(true);
                        this.reportModal.visible = false;
                        this.commentsContainer.createInfoPopup('You must be logged in to report posts.', '#92220a');
                    }
                }
            });
            this.reportModal.cancelButton.mouseUp.listen(() => {
                this.toggleAll(true);
                this.reportModal.visible = false;
            });
            this.reportModal.closeButton.mouseUp.listen(() => {
                this.toggleAll(true);
                this.reportModal.visible = false;
            });
            this.reportModal.parentTo(this);

            this.darken = new UIBase({
                sizeScale: Vector2.one,
                backgroundEnabled: true,
                transparency: 0.5,
                visible: false
            });
            this.darken.parentTo(this);

            this.currentFrame = 0;
            this.isLoading = false;
            this.isReporting = false;
            this.object = null;

            let interval = setInterval(() => {
                if (this.sprite.frames.length <= 1 || !this.sprite.isVisibleOnScreen()) {
                    return
                }
                
                this.sprite.setFrame(this.currentFrame);
                this.currentFrame = (this.currentFrame + 1) % 5;
            }, 200);
        }

        submitReport (reason) {
            if (this.isReporting) {
                return;
            }

            this.isReporting = true;

            Posts.reportPost(this.object.postId, reason)
                .then((response) => {
                    if (response.error) {
                        throw new Error(response.error);
                    }

                    this.commentsContainer.createInfoPopup('Your report has been submitted.', '#578763');
                })
                .catch((error) => {
                    console.error(error);
                    this.commentsContainer.createInfoPopup('There was an error submitting your report.', '#92220a');
                }).finally(() => {
                    this.toggleAll(true);
                    this.reportModal.visible = false;
                    this.isReporting = false;
                });
        }
            

        toggleAll (visible) {
            this.children.forEach(child => {
                child.visible = visible;
            });
            this.darken.visible = !visible;
        }

        loadEmpty () {
            this.sprite.visible = false;
            this.object = null;

            this.nameContent.text = '';
            this.creatorContent.text = '';
            this.tagsContent.text = '';
            this.typeContent.text = '';
            this.postDateContent.text = '';

            this.creatorContent.sizeAbsolute.x = 0;

            this.commentsContainer.infoPopups.clearChildren();
            this.commentsContainer.confirmDelete.visible = false;
            this.commentsContainer.reportModal.visible = false;
            this.commentsContainer.reportModal.unselectAll();
            this.commentsContainer.toggleAll(true);

            this.commentsContainer.infoMessage.visible = true;
            this.commentsContainer.infoMessage.text = 'No comments to display.';
            this.commentsContainer.enterContainer.visible = false;
            this.commentsContainer.submitButton.visible = false;

            this.commentsContainer.clearAllComments();


            this.commentsContainer.createInfoPopup('The selected post was not found.', '#92220a');

            this.reportButton.setActive(false);
            this.deleteButton.setActive(false);
        }

        async load (object, targetCommentID = null) {
            if (this.isLoading) {
                Sounds.playSfx(Sounds.SND_ERROR);
                return;
            }

            if (object === null) {
                this.loadEmpty();
                return;
            }

            this.isLoading = true;
            
            const frames = object.getTextureFrames();
            const textureSize = object.isLoaded ? object.getTextureRect()[1] : Vector2.zero;
            
            this.sprite.frames = frames;
            this.sprite.rootSize = textureSize;
            this.sprite.setFrame(0);
            this.currentFrame = 0;
            this.sprite.visible = true;
            this.object = object;

            this.commentsContainer.infoPopups.clearChildren();
            this.commentsContainer.confirmDelete.visible = false;
            this.commentsContainer.reportModal.visible = false;
            this.commentsContainer.reportModal.unselectAll();
            this.commentsContainer.toggleAll(true);

            this.nameContent.text = object.objectId || object.postName;
            this.creatorContent.text = object.ownerId !== null ? object.username : 'Realm of the Mad God';
            this.tagsContent.text = object.tags || "No Tags"
            this.typeContent.text = object.type || "No Type";
            this.postDateContent.text = object.createdAt ? new Date(object.createdAt).toLocaleDateString("en-US", {
                year: 'numeric', month: 'long', day: 'numeric'
            }) : "No Date";

            this.creatorContent.sizeAbsolute.x = this.creatorContent.getTextWidth() + 10;

            this.commentsContainer.clearAllComments();

            if (object.ownerId !== null) {
                this.commentsContainer.enterContainer.visible = true;
                this.commentsContainer.submitButton.visible = true;
                this.commentsContainer.infoMessage.visible = true;
                this.commentsContainer.infoMessage.text = 'Loading comments...';

                this.commentsContainer.loadComments(object, true, targetCommentID)
                    .catch((error) => {
                        console.error(error);
                        this.commentsContainer.infoMessage.text = 'Failed to load comments.';
                    }).finally(() => {
                        this.isLoading = false
                    });
                this.reportButton.setActive(true);
                this.deleteButton.setActive(ArtEditor.user?.details?.userId === object.ownerId);
            } else {
                this.commentsContainer.infoMessage.visible = true;
                this.commentsContainer.infoMessage.text = 'Comments are disabled for this post.';

                this.commentsContainer.enterContainer.visible = false;
                this.commentsContainer.submitButton.visible = false;

                this.reportButton.setActive(false);
                this.deleteButton.setActive(false);
            }
            this.isLoading = false;
        }
    }
})();
