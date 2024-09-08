import { UIBase } from "../uiBase.js";
import { Vector2 } from "../../utils/vector2.js";
import { UIText } from "../uiText.js";
import { PostComment } from "./postComment.js";
import { UITextBox } from "../uiTextBox.js";
import { Constants } from "../../utils/constants.js";
import { RotmgButtonBorder } from "./rotmgButtonBorder.js";
import { UIImage } from "../uiImage.js";
import { Sprite } from "../../assets/sprite.js";
import { Comments } from "../../api/comments.js";
import { DeleteScreen } from "../screens/deleteScreen.js";
import { Event } from "../../utils/event.js";
import { ReportPage } from "./reportPage.js";

export const CommentsManager = (function () {
    return class CommentsManager extends UIBase {
        constructor (options) {
            super({
                backgroundEnabled: true,
                backgroundColor: '#252525',
                ...options
            });

            this.infoMessage = new UIText('No comments have been posted.', {
                position: new Vector2(0, 0),
                size: new Vector2(0, 0),
                sizeScale: new Vector2(1, 1),
                paddingTop: 20,
                textXAlignment: 'center',
                textYAlignment: 'top',
                fontSize: 16,
                font: 'myriadpro',
                fontColor: '#ffffff',
                textTransparency: 0.5,
                shadow: true,
                shadowBlur: 5,
            });
            this.infoMessage.parentTo(this);

            this.commentsContainer = new UIBase({
                sizeScale: new Vector2(1, 1),
            });
            this.commentsContainer.clipChildren = true;
            this.commentsContainer.scrollableY = true;
            this.commentsContainer.parentTo(this);

            this.enterContainer = new UIBase({
                position: new Vector2(10, 50),
                positionScale: new Vector2(0, 1),
                pivot: new Vector2(0, 1),
                size: new Vector2(0, 40),
                sizeScale: new Vector2(0.9, 0),
                backgroundEnabled: true,
                backgroundColor: '#333333',
                shadow: true,
                shadowBlur: 5,
                borderSize: 1,
                borderColor: '#333333',
                borderRadius: 6,
            });
            
            this.textEnter = new UITextBox("Log in or Register to post comments", {
                sizeScale: new Vector2(1, 1),
                font: 'myriadpro',
                fontSize: 16,
                fontColor: '#ffffff',
                textXAlignment: 'left',
                textYAlignment: 'top',
                paddingLeft: 10,
                paddingRight: 10,
            });
            this.textDisabled = new UIBase({
                sizeScale: Vector2.one,
                backgroundEnabled: true,
                backgroundColor: '#000000',
                transparency: 0.5,
                visible: false
            });
            this.textDisabled.parentTo(this.textEnter);
            this.textEnter.maxInputLength = Constants.MAX_COMMENT_LENGTH;
            this.textEnter.parentTo(this.enterContainer);

            this.maxTextLength = new UIText(`0/${Constants.MAX_COMMENT_LENGTH}`, {
                position: new Vector2(-5, -5),
                positionScale: new Vector2(1, 1),
                size: new Vector2(80, 20),
                pivot: new Vector2(1, 1),
                fontSize: 12,
                textXAlignment: 'right',
                font: 'myriadpro',
                fontColor: '#ffffff',
                textTransparency: 0.25,
                zIndex: 999
            });
            this.maxTextLength.parentTo(this.enterContainer);

            this.textEnter.onInput.listen(() => {
                const textHeight = this.textEnter.getTextHeight();
                this.enterContainer.sizeAbsolute.y = Math.max(40, textHeight);
                
                this.maxTextLength.text = `${this.textEnter.text.length}/${Constants.MAX_COMMENT_LENGTH}`;
            });
            this.textEnter.submit.listen(() => this.postComment());

            this.enterContainer.parentTo(this);

            this.submitButton = new RotmgButtonBorder('', {
                position: new Vector2(-5, 50),
                positionScale: new Vector2(1, 1),
                pivot: new Vector2(1, 1),
                size: new Vector2(40, 40),
                fontSize: 13,
                paddingLeft: 0,
                textXAlignment: 'center',
                borderSize: 1,
                borderColor: '#666666',
                backgroundEnabled: true,
                backgroundColor: '#333333',
                borderRadius: 5,
            });
            this.submitIcon = new UIImage(Sprite.IMG_ICONS, {
                imageRectSize: new Vector2(16, 16),
                imageRectOffset: new Vector2(4*16, 3*16),
                positionScale: new Vector2(0.5, 0.5),
                pivot: new Vector2(0.5, 0.5),
                size: new Vector2(16, 16),
            });
            this.submitIcon.parentTo(this.submitButton);
            this.submitButton.mouseUp.listen(() => {
                if (!this.submitButton.isDisabled) {
                    this.postComment();
                }
            });
            this.submitDarken = new UIBase({
                sizeScale: Vector2.one,
                backgroundEnabled: true,
                backgroundColor: '#000000',
                transparency: 0.5
            });
            this.submitDarken.parentTo(this.submitButton);
            this.submitButton.parentTo(this);

            this.loadMoreComments = new UIText('Load more comments', {
                position: new Vector2(0, -15),
                positionScale: new Vector2(0.5, 1),
                size: new Vector2(200, 20),
                sizeScale: new Vector2(0, 0),
                pivot: new Vector2(0.5, 1),
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
            this.loadMoreComments.mouseUp.listen(() => {
                this.loadComments(this.currentObject, false);
            });
            this.loadMoreComments.parentTo(this.commentsContainer);

            this.replyingTo = new RotmgButtonBorder('Cancel reply', {
                position: new Vector2(0, 9),
                pivot: new Vector2(0.5, 0),
                positionScale: new Vector2(0.5, 1),
                size: new Vector2(300, 30),
                backgroundEnabled: true,
                backgroundColor: '#17455c',
                font: 'myriadpro',
                fontSize: 16,
                fontColor: '#ffffff',
                borderRadius: 5,
                textXAlignment: 'center',
                borderSize: 3,
                borderColor: '#222222',
                visible: false
            });
            this.replyingTo.mouseDown.listen(() => this.exitReplyState());
            this.replyingTo.parentTo(this.enterContainer);

            this.darken = new UIBase({
                sizeScale: Vector2.one,
                backgroundEnabled: true,
                backgroundColor: '#000000',
                transparency: 0.5,
                visible: false
            });
            this.darken.parentTo(this);

            this.confirmDelete = new DeleteScreen({
                pivot: new Vector2(0.5, 0.5),
                sizeScale: new Vector2(0.5, 0.5),
                positionScale: new Vector2(0.5, 0.5),
            });
            this.confirmDelete.header.text = 'Delete comment';
            this.confirmDelete.infoLabel.text = 'Are you sure you want to delete this comment?';
            this.confirmDelete.delete.mouseUp.listen(() => this.deleteChoice.trigger(true));
            this.confirmDelete.cancel.mouseUp.listen(() => this.deleteChoice.trigger(false));
            this.confirmDelete.parentTo(this);

            this.reportModal = new ReportPage('Report comment', {
                size: new Vector2(400, 320)
            });
            this.reportModal.cancelButton.mouseUp.listen(() => {
                this.reportingComment = null;
                this.toggleAll(true);
            });
            this.reportModal.closeButton.mouseUp.listen(() => {
                this.reportingComment = null;
                this.toggleAll(true);
            });
            this.reportModal.submitted.listen((reason) => {
                if (!this.isReporting) {
                    if (ArtEditor.user !== null) {
                        this.submitReport(reason);
                    } else {
                        this.reportModal.visible = false;
                        this.toggleAll(true);
                        this.createInfoPopup('You must be logged in to report comments.', '#92220a');
                    }
                }
            });
            this.reportModal.parentTo(this);
            this.toggleAll(false);

            this.infoPopups = new UIBase({
                sizeScale: Vector2.one,
            });
            this.infoPopups.parentTo(this);

            this.comments = [];
            this.currentObject = null;
            this.isPostingComment = false;
            this.targetReply = null;
            this.isReporting = false;
            this.reportingComment = null;
            this.currentTotalComments = 0;
            this.localComments = 0;
            this.deleteChoice = new Event();
        }

        updateSpacing (maintainScroll = false) {
            let y = 10;
            for (let i = 0; i < this.comments.length; i++) {
                const comment = this.comments[i];
                comment.positionAbsolute.y = y;
                y += comment.sizeAbsolute.y + 10;
            }
            if (this.comments.length > 0) {
                this.commentsContainer.canvasSize.y = Math.max(y + 100 - this.sizeAbsolute.y, 1);
            } else {
                this.commentsContainer.canvasSize.y = 1;
            }

            this.loadMoreComments.positionAbsolute.y = y + 25 - this.sizeAbsolute.y;

            if (!maintainScroll) {
                this.commentsContainer.canvasPosition.y = 0;
                this.commentsContainer.goalCanvasPosition.y = 0;
            }
        }

        addComment (comment, maintainScroll = false, insertAtTop = false) {
            const existing = this.comments.findIndex((c) => c.comment.id === comment.id);

            if (existing !== -1) {
                return;
            }

            const postComment = new PostComment(comment, this.currentObject, {});
            if (insertAtTop) {
                this.comments.unshift(postComment);
            } else {
                this.comments.push(postComment);
            }
            this.infoMessage.visible = false;
            postComment.parentTo(this.commentsContainer);
            this.bindToComment(postComment);
            this.updateSpacing(maintainScroll);
            return postComment;
        }

        removeComment (comment, maintainScroll = false) {
            if (this.targetReply === comment) {
                this.exitReplyState();
            }
            this.comments = this.comments.filter(c => c !== comment);
            comment.unparent();
            if (this.comments.length === 0) {
                this.infoMessage.text = 'No comments have been posted.';
                this.infoMessage.visible = true;
            }
            this.updateSpacing(maintainScroll);
        }

        async submitReport (reason) {
            if (this.reportingComment !== null && !this.isReporting) {
                this.isReporting = true;
                
                Comments.reportComment(this.reportingComment.comment.id, reason, ArtEditor.user.token).then((result) => {
                    if (result.error) {
                        throw result.error;
                    }

                    this.createInfoPopup('Your report has been submitted.', '#578763');
                }).catch((error) => {
                    console.error(error);
                    this.createInfoPopup(typeof error === 'string' ? error : 'There was an error submitting your report.', '#92700a');
                    
                }).finally(() => {
                    this.isReporting = false;
                    this.reportModal.visible = false;
                    this.toggleAll(true);
                });
            } else {
                this.reportModal.visible = false;
                this.toggleAll(true);
                this.createInfoPopup('There was an error submitting your report.', '#92220a');
            }
        }

        clearAllComments () {
            this.exitReplyState();
            this.localComments = 0;
            this.deleteChoice.trigger(false);
            this.comments.forEach((comment) => comment.unparent());
            this.comments = [];
            this.infoMessage.visible = true;
            this.loadMoreComments.visible = false;
            this.updateSpacing();
        }

        async loadReplies (postComment, offset = 0) {
            let replies;

            if (ArtEditor.user !== null) {
                replies = await Comments.getReplies(postComment.comment.id, offset, ArtEditor.user.token);
            } else {
                replies = await Comments.getReplies(postComment.comment.id, offset);
            }

            if (replies.error) {
                console.error(replies.error);
                return;
            }

            replies = replies.map((reply) => {
                const replyComment = new PostComment(reply, postComment.post, {
                    position: new Vector2(0, 10),
                    positionScale: new Vector2(1, 0),
                    pivot: new Vector2(1, 0),
                });
                this.bindToComment(replyComment);
                return replyComment;
            });

            postComment.addReplyComments(replies); 
        }

        bindToComment (comment) {
            comment.expanded.listen(async () => {
                if (comment.replies.length === 0) {
                    await this.loadReplies(comment);
                }

                this.updateSpacing(true);
            });
            comment.collapsed.listen(() => this.updateSpacing(true));
            comment.deleteRequested.listen(async () => {
                if (comment.isDeleting) return;

                this.confirmDelete.visible = true;
                this.toggleAll(false);

                comment.isDeleting = true;

                const shouldDelete = await new Promise((resolve) => {
                    this.deleteChoice.listen((shouldDelete) => resolve(shouldDelete));
                });

                if (shouldDelete && ArtEditor.user !== null) {
                    const result = await Comments.deleteComment(comment.comment.id, ArtEditor.user.token);
                    
                    if (result.error) {
                        console.error(result.error);
                    } else {
                        comment.commentLabel.text = '[deleted]';
                        comment.commentLabel.textTransparency = 0.5;
                        comment.comment.text = '[deleted]';
                        comment.deleteButton.visible = false;
                        comment.computeSizing();
                        this.updateSpacing(true);
                    }
                }
                
                this.confirmDelete.visible = false;
                this.toggleAll(true);
                
                comment.isDeleting = false; 
            });
            comment.reported.listen(() => {
                this.toggleAll(false);
                this.reportModal.unselectAll();
                this.reportModal.visible = true;
                this.reportingComment = comment;
            });
            comment.initiateReply.listen(() => this.enterReplyState(comment));
            comment.moreRepliesRequested.listen(async () => {
                await this.loadReplies(comment, comment.replies.length - comment.localReplies);
                this.updateSpacing(true);
            });
            comment.interactionChanged.listen(() => {
                if (ArtEditor.user === null) {
                    this.createInfoPopup('Log in or Register to interact with comments', '#92220a');
                    return;
                } else if (!ArtEditor.user.details.verified) {
                    this.createInfoPopup('You must verify your email to interact with comments', '#92700a');
                    return;
                }
            });
        }

        toggleAll (toggled) {
            this.commentsContainer.visible = toggled;
            this.submitButton.visible = toggled;
            this.textEnter.visible = toggled
            this.enterContainer.visible = toggled;
            this.darken.visible = !toggled;
        }

        enterReplyState (comment) {
            if (ArtEditor.user === null) {
                this.createInfoPopup('Log in or Register to post comments', '#92220a');
                return;
            }

            if (this.targetReply !== null) {
                this.exitReplyState();
            }

            this.targetReply = comment;
            this.textEnter.placeholder = this.getPlaceHolder();
            comment.primaryContainer.backgroundColor = '#17455c'
            this.enterContainer.backgroundColor = '#17455c'
            this.textEnter.cursorPosition = 0;
            this.textEnter.focus();
            this.replyingTo.visible = true;
        }

        exitReplyState () {
            if (this.targetReply !== null) {
                this.targetReply.primaryContainer.backgroundColor = '#363636';
            }
            this.targetReply = null;
            this.textEnter.placeholder = this.getPlaceHolder();
            this.textEnter.cursorPosition = 0;
            this.enterContainer.backgroundColor = '#333333';
            this.textEnter.blur();
            this.replyingTo.visible = false;
        }

        getPlaceHolder () {
            if (ArtEditor.user !== null) {
                if (this.targetReply !== null) {
                    return `Replying to ${this.targetReply.comment.poster_username}`;
                } else {
                    return 'Add a comment...';
                }
            }

            return 'Log in or Register to post comments';
        }

        createInfoPopup (text, color) {
            const MAX_POPUPS = 3;

            if (this.infoPopups.children.length > MAX_POPUPS) {
                this.infoPopups.children[0].unparent();
            }

            const textPopup = new UIText(text, {
                position: new Vector2(0, 10),
                positionScale: new Vector2(0.5, 0),
                pivot: new Vector2(0.5, 0),
                sizeScale: new Vector2(0.8, 0),
                size: new Vector2(0, 40),
                textXAlignment: 'center',
                textYAlignment: 'center',
                fontSize: 16,
                font: 'myriadpro',
                fontColor: 'white',
                shadow: true,
                shadowBlur: 5,
                borderRadius: 5,
                borderSize: 1,
                borderColor: 'white',
                backgroundEnabled: true,
                backgroundColor: color
            });

            const close = new RotmgButtonBorder('X', {
                size: new Vector2(24, 24),
                positionScale: new Vector2(1, 0.5),
                pivot: new Vector2(1, 0.5),
                position: new Vector2(-10, 0),
                fontSize: 13,
                paddingLeft: 0,
                textXAlignment: 'center',
                borderSize: 1,
                borderColor: 'white',
                borderRadius: 5,
                clipChildren: true
            });
            close.mouseUp.listen(() => textPopup.unparent());
            close.parentTo(textPopup);
            
            const fadeTime = 1000;
            const startFade = 2000;
            let elapsed = 0;

            textPopup.onUpdate.listen((delta) => {
                elapsed += delta;

                if (elapsed > startFade) {
                    if ((elapsed - startFade) >= fadeTime) {
                        textPopup.unparent();
                    } else {
                        const transparency = 1 - ((elapsed - startFade) / fadeTime)

                        textPopup.transparency = transparency;
                        textPopup.textTransparency = transparency;
                        close.transparency = transparency;
                        close.textTransparency = transparency;
                    }
                }
            });

            textPopup.parentTo(this.infoPopups);
        }

        async postComment () {
            // this.createInfoPopup('There was an error posting your comment.', '#92220a');
            const content = this.textEnter.text.trim();

            if (content.length === 0) {
                return;
            }

            if (ArtEditor.user === null) {
                // TODO: login screen should appear
                return;
            } else if (!ArtEditor.user.details.verified) {
                this.createInfoPopup('You must verify your email to post comments.', '#92700a');
                return;
            }

            this.isPostingComment = true;

            this.submitDarken.visible = true;
            this.submitButton.setDisabled(true);
            
            let promise;

            if (this.targetReply === null) {
                promise = Comments.postComment(this.currentObject.postId, content, ArtEditor.user.token);
            } else {
                promise = Comments.replyComment(this.targetReply.comment.id, content, ArtEditor.user.token);
            }

            promise.then((result) => {
                if (result.error) {
                    this.createInfoPopup(result.error, '#92700a');
                    return;
                }
                
                this.textEnter.text = '';
                this.enterContainer.sizeAbsolute.y = 40;
                this.maxTextLength.text = `0/${Constants.MAX_COMMENT_LENGTH}`;

                if (this.targetReply === null) {
                    this.addComment(result, false, true);
                } else {
                    const rootCommentIndex = this.comments.findIndex((comment) => comment.comment.thread_id === result.thread_id);

                    if (rootCommentIndex !== -1) {
                        const rootComment = this.comments[rootCommentIndex];

                        const replyComment = new PostComment(result, this.currentObject, {
                            position: new Vector2(0, 10),
                            positionScale: new Vector2(1, 0),
                            pivot: new Vector2(1, 0),
                        });
                        this.bindToComment(replyComment);
                        
                        // rootComment.comment.replies += 1;
                        rootComment.localReplies += 1;
                        
                        rootComment.addReplyComments([replyComment], true);
                        
                        if (!rootComment.commentsExpanded) {
                            rootComment.expandReplies();
                        }
                    } else {
                        console.error('could not find root comment');
                    }
                    this.updateSpacing(true);
                }

                if (this.targetReply !== null) {
                    this.exitReplyState();
                }
            }).catch((error) => {
                console.error(error);
                this.createInfoPopup('There was an error posting your comment.', '#92220a');
            }).finally(() => {
                this.isPostingComment = false;
                this.submitDarken.visible = false;
                this.submitButton.setDisabled(false);

            });
        }

        async loadComments (object, clear = true, targetCommentID = null) {
            this.deleteChoice.trigger(false);
            this.exitReplyState();

            this.currentObject = object;

            if (clear) {
                this.clearAllComments();
                this.textEnter.text = '';
                this.enterContainer.sizeAbsolute.y = 40;
            }

            if (targetCommentID !== null) {
                const comment = await Comments.getComment(targetCommentID, ArtEditor.user?.token);

                if (comment.error) {
                    console.error(comment.error);
                    return;
                }

                const postComment = this.addComment(comment, clear);

                this.enterReplyState(postComment);
                this.localComments += 1
            }

            let result = await Comments.getComments(object.postId, this.comments.length, ArtEditor.user ? ArtEditor.user.token : null);

            if (result.error) {
                console.error(result.error);
                return;
            }

            if (result.comments.length > 0) {
                for (let i = 0; i < result.comments.length; i++) {
                    this.addComment(result.comments[i], !clear);
                }
            } else {
                this.infoMessage.text = 'No comments have been posted.';
            }
            
            this.currentTotalComments = result.total;

            const remainingComments = Math.max(this.currentTotalComments - this.comments.length, 0);

            if (remainingComments > 0 && remainingComments !== this.localComments) {
                // this.loadMoreComments.text = `${this.currentTotalComments - this.comments.length} more comment${this.currentTotalComments - this.comments.length > 1 ? 's' : ''}`;
                this.loadMoreComments.visible = true;
            } else {
                this.loadMoreComments.visible = false;
            }
        }
    }
})();