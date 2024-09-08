import { UIText } from "../uiText.js";
import { UIBase } from "../uiBase.js";
import { Vector2 } from "../../utils/vector2.js";
import { RotmgButtonBorder } from "./rotmgButtonBorder.js";
import { Sprite } from "../../assets/sprite.js";
import { UIImage } from "../uiImage.js";
import { Event } from "../../utils/event.js";
import { Comments } from "../../api/comments.js";
import { Utils } from "../../utils/utils.js";

export const PostComment = (function () {
    return class PostComment extends UIBase {
        constructor (comment, post, options) {
            super({
                sizeScale: new Vector2(0.96, 0),
                size: new Vector2(0, 0),
                positionScale: new Vector2(0.5, 0),
                pivot: new Vector2(0.5, 0),
                position: new Vector2(0, 20),

                ...options
            });

            this.primaryContainer = new UIBase({
                sizeScale: new Vector2(1, 0),
                backgroundColor: '#363636',
                backgroundEnabled: true,

                shadow: true,
                shadowBlur: 5,

                borderSize: 1,
                borderColor: '#ffffff',
                borderRadius: 6,
            });
            this.primaryContainer.parentTo(this);

            const isMyComment = window.ArtEditor !== undefined &&
                ArtEditor.user !== null &&
                ArtEditor.user.details.userId === comment.user_id;

            this.comment = comment;
            this.post = post;

            this.authorLabel = new UIText(comment.poster_username, {
                position: new Vector2(10, 10),
                size: new Vector2(0, 20),
                sizeScale: new Vector2(0, 0),
                textXAlignment: 'left',
                textWraps: false,
                fontSize: 14,
                clickable: true,
                font: 'myriadpro_bold',
                fontColor: '#578763',
                underline: true,
                shadow: true,
                shadowBlur: 5,
            });
            this.authorLabel.sizeAbsolute.x = this.authorLabel.getTextWidth();
            this.authorLabel.parentTo(this.primaryContainer);

            this.commentLabel = new UIText(comment.text, {
                position: new Vector2(10, 40),
                sizeScale: new Vector2(0.96, 0),
                textXAlignment: 'left',
                fontSize: 14,
                font: 'myriadpro',
                textYAlignment: 'top',
                fontColor: '#d9d9d9',
                textTransparency: comment.deleted === 1 ? 0.5 : 1,
            });
            this.commentLabel.parentTo(this.primaryContainer);;

            const buttonStyles = {
                size: new Vector2(24, 24),
                fontSize: 13,
                paddingLeft: 0,
                textXAlignment: 'center',
                borderSize: 1,
                borderColor: '#666666',
                borderRadius: 5,
            }

            this.reportButton = new RotmgButtonBorder('', {
                position: new Vector2(-10, 10),
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                ...buttonStyles
            });
            this.reportButton.mouseUp.listen(() => this.reported.trigger());
            this.reportIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(3*16, 0),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.reportIcon.parentTo(this.reportButton);
            this.reportButton.parentTo(this.primaryContainer);

            this.deleteButton = new RotmgButtonBorder('', {
                position: new Vector2(-40, 10),
                positionScale: new Vector2(1, 0),
                pivot: new Vector2(1, 0),
                visible: isMyComment && comment.deleted === 0,
                ...buttonStyles
            });
            this.deleteIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(4*16, 1*16),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.deleteButton.mouseUp.listen(() => this.delete());
            this.deleteIcon.parentTo(this.deleteButton);
            this.deleteButton.parentTo(this.primaryContainer);

            this.likeButton = new RotmgButtonBorder('', {
                position: new Vector2(10, -15),
                positionScale: new Vector2(0, 1),
                pivot: new Vector2(0, 1),
                backgroundEnabled: comment.likeStatus === 'like',
                backgroundColor: '#4CAF50',
                ...buttonStyles
            });
            this.likeButton.mouseUp.listen(() => this.likeClicked());
            this.likeIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(3*16, 1*16),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.likeIcon.parentTo(this.likeButton);
            this.likeButton.parentTo(this.primaryContainer);

            this.likes = new UIText(String(comment.likes), {
                position: new Vector2(10, 0),
                positionScale: new Vector2(1, 0.5),
                pivot: new Vector2(0, 0.5),
                size: new Vector2(0, 0),
                sizeScale: new Vector2(0, 1),
                textXAlignment: 'left',
                textWraps: false,
                fontSize: 14,
                font: 'myriadpro',
                fontColor: '#578763',
            });
            this.likes.sizeAbsolute.x = this.likes.getTextWidth();
            this.likes.parentTo(this.likeButton);

            this.dislikeButton = new RotmgButtonBorder('', {
                position: new Vector2(10, 0),
                positionScale: new Vector2(1, 0),
                backgroundColor: '#F44336',
                backgroundEnabled: comment.likeStatus === 'dislike',
                ...buttonStyles
            });
            this.dislikeButton.mouseUp.listen(() => this.dislikeClicked());
            this.dislikeIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(3*16, 2*16),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.dislikeIcon.parentTo(this.dislikeButton);
            this.dislikeButton.parentTo(this.likes);

            this.dislikes = new UIText(String(comment.dislikes), {
                position: new Vector2(10, 0),
                positionScale: new Vector2(1, 0.5),
                pivot: new Vector2(0, 0.5),
                size: new Vector2(0, 0),
                sizeScale: new Vector2(0, 1),
                textXAlignment: 'left',
                textWraps: false,
                fontSize: 14,
                font: 'myriadpro',
                fontColor: '#E57373',
            });
            this.dislikes.sizeAbsolute.x = this.dislikes.getTextWidth();
            this.dislikes.parentTo(this.dislikeButton);

            this.expandButton = new RotmgButtonBorder(`${comment.replies} replies`, {
                position: new Vector2(10, 0),
                positionScale: new Vector2(1, 0),
                visible: comment.replies > 0 && comment.parent_comment_id === null,
                ...buttonStyles
            });
            this.expandButton.paddingLeft = 10;
            this.expandButton.sizeAbsolute = new Vector2(this.expandButton.getTextWidth() + 50, 24);

            this.expandIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(4*16, 0),
                positionScale: new Vector2(0.2, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.expandIcon.parentTo(this.expandButton);
            this.expandButton.mouseUp.listen(() => {
                if (this.commentsExpanded) {
                    this.collapseReplies();
                } else {
                    this.expandReplies();
                }
            });
            this.expandButton.parentTo(this.dislikes);

            this.replyButton = new RotmgButtonBorder('Reply', {
                position: new Vector2(-10, -10),
                pivot: new Vector2(1, 1),
                positionScale: new Vector2(1,1),
                ...buttonStyles
            });
            this.replyButton.paddingLeft = 10;
            this.replyButton.sizeAbsolute = new Vector2(80, 24);

            this.replyIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(4*16, 2*16),
                positionScale: new Vector2(0.2, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.replyIcon.parentTo(this.replyButton);
            this.replyButton.mouseUp.listen(() => this.initiateReply.trigger());
            this.replyButton.parentTo(this.primaryContainer);

            this.replyContainer = new UIBase({
                sizeScale: new Vector2(1, 0),
                visible: false,
            });
            this.replyContainer.parentTo(this);

            this.replyLine = new UIBase({
                position: new Vector2(10, 0),
                sizeScale: new Vector2(0, 1),
                sizeAbsolute: new Vector2(2, 0),
                backgroundEnabled: true,
                backgroundColor: "#ffffff",
                transparency: 0.25
            });
            this.replyLine.parentTo(this.replyContainer);

            this.loadMoreReplies = new UIText('1 more reply', {
                position: new Vector2(0, 5),
                positionScale: new Vector2(0.5, 1),
                size: new Vector2(100, 20),
                sizeScale: new Vector2(0, 0),
                pivot: new Vector2(0.5, 0),
                textXAlignment: 'center',
                textYAlignment: 'center',
                fontSize: 14,
                font: 'myriadpro',
                fontColor: '#578763',
                shadow: true,
                clickable: true,
                shadowBlur: 5,
                underline: true,
                visible: false
            });
            this.loadMoreReplies.mouseUp.listen(() => this.moreRepliesRequested.trigger());
            this.loadMoreReplies.parentTo(this.replyContainer);

            this.postDate = new UIText(Utils.formatTime(this.comment.created_at), {
                position: new Vector2(0, -6),
                positionScale: new Vector2(0, 1),
                size: new Vector2(0, 20),
                sizeScale: new Vector2(1, 0),
                pivot: new Vector2(0, 1),
                backgroudnEnabled: true,
                textXAlignment: 'center',
                paddingLeft: 300,
                textWraps: false,
                fontSize: 12,
                font: 'myriadpro',
                fontColor: '#ffffff',
                textTransparency: 0.25
            });
            this.postDate.parentTo(this.primaryContainer);

            this.replies = [];
            this.commentsExpanded = false;
            this.likeStatus = comment.likeStatus
            this.isInteracting = false;
            this.isDeleting = false;

            this.parentChanged.listen(() => this.computeSizing());

            this.localReplies = 0;

            this.updatePostTags();

            this.expanded = new Event();
            this.collapsed = new Event();
            this.reported = new Event();
            this.deleteRequested = new Event();
            this.interactionChanged = new Event();
            this.initiateReply = new Event();
            this.moreRepliesRequested = new Event();
        }

        computeSizing () {
            this.commentLabel.sizeAbsolute.y = this.commentLabel.getTextHeight();
            this.replyContainer.positionAbsolute.y = this.commentLabel.sizeAbsolute.y + 90;
            this.sizeAbsolute.y = this.commentLabel.sizeAbsolute.y + 90;
            this.primaryContainer.sizeAbsolute.y = this.commentLabel.sizeAbsolute.y + 90;
        }

        updatePostTags () {
            if (this.comment.parent_comment_id !== null && this.comment.parent_username !== null) {
                this.replyTag = new UIText(` —  Replying to ${this.comment.parent_username}`, {
                    positionScale: new Vector2(1, 0),
                    position: new Vector2(10, 0),
                    size: new Vector2(0, 0),
                    sizeScale: new Vector2(0, 1),
                    textXAlignment: 'left',
                    textWraps: false,
                    fontSize: 14,
                    font: 'myriadpro',
                    fontColor: '#578763',
                    shadow: true,
                    shadowBlur: 5,
                });
                this.replyTag.sizeAbsolute.x = this.replyTag.getTextWidth();
                this.replyTag.parentTo(this.authorLabel);
            }
            if (this.comment.user_id === this.post.ownerId) {
                this.authorTag = new UIText(' •  Author', {
                    positionScale: new Vector2(1, 0),
                    position: new Vector2(20, 0),
                    size: new Vector2(0, 0),
                    sizeScale: new Vector2(0, 1),
                    textXAlignment: 'left',
                    textWraps: false,
                    fontSize: 14,
                    font: 'myriadpro',
                    fontColor: '#4A90E2',
                    shadow: true,
                    shadowBlur: 5,
                });
                this.authorTag.sizeAbsolute.x = this.authorTag.getTextWidth();
                this.authorTag.parentTo(this.replyTag || this.authorLabel);
            }

            if (this.comment.poster_isAdmin === 1) {
                this.adminTag = new UIText(' •  Admin', {
                    positionScale: new Vector2(1, 0),
                    position: new Vector2(16, 0),
                    size: new Vector2(0, 0),
                    sizeScale: new Vector2(0, 1),
                    textXAlignment: 'left',
                    textWraps: false,
                    fontSize: 14,
                    font: 'myriadpro',
                    fontColor: '#FFD700',
                    shadow: true,
                    shadowBlur: 5,
                });
                this.adminTag.sizeAbsolute.x = this.adminTag.getTextWidth();
                this.adminTag.parentTo(this.authorTag || this.replyTag || this.authorLabel);
            }

            if (ArtEditor.user !== null && ArtEditor.user.details.userId === this.comment.user_id) {
                this.opTag = new UIText(' —  You', {
                    positionScale: new Vector2(1, 0),
                    position: new Vector2(16, 0),
                    size: new Vector2(0, 0),
                    sizeScale: new Vector2(0, 1),
                    textXAlignment: 'left',
                    textWraps: false,
                    fontSize: 14,
                    font: 'myriadpro',
                    fontColor: '#E0FFFF ',
                    textTransparency: 0.45
                });
                this.opTag.sizeAbsolute.x = this.opTag.getTextWidth();
                this.opTag.parentTo(this.adminTag || this.authorTag  || this.replyTag || this.authorLabel);
            }

        }

        async delete () {
            if (this.isDeleting) {
                return;
            }

            this.deleteRequested.trigger();
        }

        async updateInteraction () {
            const status = this.likeStatus;
            
            this.isInteracting = true;

            if (ArtEditor.user !== null && ArtEditor.user.details.verified) {
                const result = await Comments.updateLikeStatus(this.comment.id, ArtEditor.user.token, status);

                if (result.error) {
                    console.error(result.error);
                } else {
                    if (this.comment.likeStatus === 'like') {
                        this.comment.likes -= 1;
                    } else if (this.comment.likeStatus === 'dislike') {
                        this.comment.dislikes -= 1;
                    }

                    if (status === 'like') {
                        this.comment.likes += 1;
                        this.comment.likeStatus = 'like';
                        this.likeButton.backgroundEnabled = true;
                        this.dislikeButton.backgroundEnabled = false;
                    } else if (status === 'dislike') {
                        this.comment.dislikes += 1;
                        this.comment.likeStatus = 'dislike';
                        this.dislikeButton.backgroundEnabled = true;
                        this.likeButton.backgroundEnabled = false;
                    } else {
                        this.comment.likeStatus = 'none';
                        this.likeButton.backgroundEnabled = false;
                        this.dislikeButton.backgroundEnabled = false;
                    }

                    this.likes.text = String(this.comment.likes);
                    this.dislikes.text = String(this.comment.dislikes);
                }
            }
            
            this.likeButton.transparency = 1;
            this.likeIcon.transparency = 1;
            this.dislikeButton.transparency = 1;
            this.dislikeIcon.transparency = 1;
            this.isInteracting = false;

            this.interactionChanged.trigger(status);
        }

        likeClicked () {
            if (this.isInteracting) {
                return;
            }

            this.likeStatus = this.likeStatus === 'like' ? 'none' : 'like';

            this.likeButton.transparency = 0.3;
            this.likeIcon.transparency = 0.3;

            this.updateInteraction();
        }

        dislikeClicked () {
            if (this.isInteracting) {
                return;
            }

            this.likeStatus = this.likeStatus === 'dislike' ? 'none' : 'dislike';

            this.dislikeButton.transparency = 0.3;
            this.dislikeIcon.transparency = 0.3;

            this.updateInteraction();
        }

        async expandReplies () {
            if (this.commentsExpanded) {
                return;
            }

            this.expandIcon.flippedVertical = true;
            this.commentsExpanded = true;

            this.replyContainer.visible = true;
            this.sizeAbsolute.y = this.commentLabel.sizeAbsolute.y + 120 + this.replyContainer.sizeAbsolute.y;

            this.expanded.trigger();
        }
        

        collapseReplies () {
            this.expandIcon.flippedVertical = false;
            this.commentsExpanded = false;
            
            this.replies.forEach(reply => reply.unparent());
            this.replies = [];
            this.replyContainer.sizeAbsolute.y = 0;
            
            this.replyContainer.visible = false;
            this.sizeAbsolute.y = this.commentLabel.sizeAbsolute.y + 90;

            this.collapsed.trigger();
        }

        updateReplySpacing () {
            let y = 10;
            for (let i = 0; i < this.replies.length; i++) {
                const reply = this.replies[i];
                reply.positionAbsolute.y = y;
                y += reply.sizeAbsolute.y + 10;
            }
        }

        addReplyComments (replies, insertAtTop = false) {
            for (let i = 0; i < replies.length; i++) {
                const reply = replies[i];

                const existing = this.replies.find(r => r.comment.id === reply.comment.id);

                if (existing) {
                    continue;
                }
                
                reply.parentTo(this.replyContainer);
                if (insertAtTop) {
                    this.replies.unshift(reply);
                } else {
                    this.replies.push(reply);
                }
                this.replyContainer.sizeAbsolute.y += reply.sizeAbsolute.y + 10;
            }

            if (this.commentsExpanded) {
                this.sizeAbsolute.y = this.commentLabel.sizeAbsolute.y + 120 + this.replyContainer.sizeAbsolute.y;
            }
            
            this.expandButton.text = `${this.comment.replies + this.localReplies} replies`;
            this.expandButton.sizeAbsolute.x = this.expandButton.getTextWidth() + 50;
            this.expandButton.visible = this.comment.replies > 0;

            const remainingReplies = Math.max(this.comment.replies - (this.replies.length - this.localReplies), 0);

            // this.loadMoreReplies.text = `${remainingReplies} more repl${remainingReplies === 1 ? 'y' : 'ies'}`;
            this.loadMoreReplies.text = 'Load more replies';

            if (remainingReplies > 0 && remainingReplies !== this.localReplies) {
                this.loadMoreReplies.sizeAbsolute.x = this.loadMoreReplies.getTextWidth() + 50;
                this.loadMoreReplies.visible = true;
            } else {
                this.loadMoreReplies.visible = false;
            }

            this.updateReplySpacing();
        }
    }
})();