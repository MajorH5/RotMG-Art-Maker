import { Vector2 } from "../utils/vector2.js";
import { Event } from "../utils/event.js"
import { Constants } from "../utils/constants.js";

export const UIBase = (function () {
    return class UIBase {
        constructor (options) {
            this.positionAbsolute = options.position || options.positionAbsolute || new Vector2(0, 0);
            this.positionScale = options.positionScale || new Vector2(0, 0);

            this.sizeAbsolute = options.size || options.sizeAbsolute || new Vector2(0, 0);
            this.sizeScale = options.sizeScale || new Vector2(0, 0);

            this.scale = options.scale || new Vector2(1, 1);
            this.pivot = options.pivot || new Vector2(0, 0);

            this.rotation = options.rotation || 0;
            this.visible = options.visible !== undefined ? options.visible : true;
            this.transparency = options.transparency !== undefined ? options.transparency : 1;

            this.backgroundEnabled = options.backgroundEnabled || false;
            this.backgroundColor = options.backgroundColor || "black";

            this.borderSize = options.borderSize !== undefined ? options.borderSize : 0;
            this.borderColor = options.borderColor || "black";

            this.shadow = options.shadow || false;
            this.shadowColor = options.shadowColor || "black";
            this.shadowBlur = options.shadowBlur || 0;
            this.shadowOffset = options.shadowOffset || new Vector2(0, 0);
            this.clickable = options.clickable || false;
            this.clipChildren = options.clipChildren || false;

            this.scrollableX = options.scrollableX || false;
            this.scrollableY = options.scrollableY || false;
            this.isModal = options.isModal || false;
            this.absorbsAllInput = options.absorbsAllInput || false;

            this.scrollHeld = false;

            this.canvasPosition = options.canvasPosition || Vector2.zero;
            this.canvasSize = options.canvasSize || Vector2.zero;
            this.goalCanvasPosition = Vector2.zero;

            this.interpolateCanvasPosition = typeof options.interpolateCanvasPosition === 'boolean' ? options.interpolateCanvasPosition : true;

            this.borderRadius = options.borderRadius || 0;

            this.zIndex = options.zIndex || 0;
            this.lastScreenSize = Vector2.zero;

            this.playHoverSound = true;
            this.playMouseDownSound = options.playMouseDownSound !== undefined ? options.playMouseDownSound : true;

            this.parent = null;
            this.root = null;

            this.attributes = options.attributes || {};
            this.children = [];

            this.mouseDown = new Event();
            this.mouseUp = new Event();
            this.mouseEnter = new Event();
            this.mouseLeave = new Event();
            this.mouseMove = new Event();
            this.scrolled = new Event();

            this.parentChanged = new Event();

            this.preChildRender = new Event();
            this.postChildRender = new Event();
            this.onUpdate = new Event();
            this.onRender = new Event();

            this.scrolled.listen((delta) => {
                const screenSize = this.getScreenSize().y;
                if (!this.scrollableY || !this.isVisibleOnScreen(this.lastScreenSize, true) || this.canvasSize.y < screenSize.y) {
                    return;
                }

                this.goalCanvasPosition.y += delta * Constants.SCROLL_RATE;
                
                if (this.goalCanvasPosition.y > 0) {
                    this.goalCanvasPosition.y = 0;
                } else if (this.canvasSize.magnitude() > 0 && this.goalCanvasPosition.y < -this.canvasSize.y) {
                    this.goalCanvasPosition.y = -this.canvasSize.y;
                }
            });

            this.mouseDown.listen((position, mouse) => {
                // listen for scroll wheel grab
                if (!this.scrollableY || !this.isVisibleOnScreen(this.lastScreenSize, true)) {
                    return;
                }

                const size = this.getScreenSize();
                const positionOnScreen = this.getScreenPosition();

                const visibleRatio = size.y / (this.canvasSize.y + size.y);  // Ratio of visible to total content
                const scrollHeight = Math.max(size.y * visibleRatio, 10);  // Ensures a minimum size for usability
                const scrollIndicatorSize = new Vector2(10, scrollHeight);
                const scrollIndicatorPositionX = positionOnScreen.x + size.x - 10;
                const scrollBarPosition = new Vector2(size.x - 10, 0);

                let scrollRatio = -this.canvasPosition.y / this.canvasSize.y;
                let scrollIndicatorPositionY = positionOnScreen.y + scrollBarPosition.y + scrollRatio * (size.y - scrollIndicatorSize.y);


                if (position.x >= scrollIndicatorPositionX && position.x <= scrollIndicatorPositionX + scrollIndicatorSize.x &&
                    position.y >= scrollIndicatorPositionY && position.y <= scrollIndicatorPositionY + scrollIndicatorSize.y &&
                    !this.scrollHeld) {
                    this.scrollHeld = true;
                    
                    const moveHandler = (position) => {
                        let yPosition = position.y;

                        if (yPosition < positionOnScreen.y) {
                            yPosition = positionOnScreen.y;
                        } else if (yPosition > positionOnScreen.y + size.y) {
                            yPosition = positionOnScreen.y + size.y
                        }

                        const ratio = (yPosition - positionOnScreen.y) / size.y;
                        const goalCanvasY = -this.canvasSize.y * ratio;


                        if (goalCanvasY > 0) {
                            this.goalCanvasPosition.y = 0;
                        } else if (goalCanvasY < -this.canvasSize.y) {
                            this.goalCanvasPosition.y = -this.canvasSize.y;
                        } else {
                            this.goalCanvasPosition.y = goalCanvasY;
                            this.canvasPosition.y = goalCanvasY;
                        }
                    };

                    mouse.mouseMoved.listen(moveHandler);
                    mouse.mouseUp.listenOnce(() => {
                        this.scrollHeld = false;
                        mouse.mouseMoved.unlisten(moveHandler);
                    });
                }
            });
        }

        // clones this object
        clone (recurse = true) {
            // TODO: This is not a smart approach as derived classes
            // will be converted to UIBase objects. we could use this.constructor
            // but parameters vary between child classes
            const obj = new UIBase(this);

            if (recurse) {
                for (const child of this.children) {
                    const childObj = child.clone();
                    childObj.parentTo(obj);
                }
            }

            return obj;
        }

        // updates the uibase object
        update (deltaTime) {
            if (!this.visible) return;
            
            for (let i = 0; i < this.children.length; i++){
                // update each child
                const child = this.children[i];

                if (child.visible) {
                    child.update(deltaTime);
                }
            }

            // interpolate the canvas position
            if (this.interpolateCanvasPosition) {
                const diff = this.goalCanvasPosition.subtract(this.canvasPosition);
                const speed = diff.scale(Constants.SCROLL_INTERPOLATION_SPEED);

                this.canvasPosition = this.canvasPosition.add(speed);
            }

            this.onUpdate.trigger(deltaTime);
        }

        // renders the object to the given context
        // along with all of its children
        render (context, screenSize, offset) {
            if (!this.isVisibleOnScreen(screenSize, true)) return;

            let position = this.getScreenPosition(screenSize);
            const size = this.getScreenSize(screenSize);

            if (offset !== undefined) {
                position = position.add(offset);
            }

            context.save();
            context.translate(position.x, position.y);
            context.rotate(this.rotation);
            context.scale(this.scale.x, this.scale.y);

            if (this.shadow) {
                context.shadowColor = this.shadowColor;
                context.shadowBlur = this.shadowBlur;
                context.shadowOffsetX = this.shadowOffset.x;
                context.shadowOffsetY = this.shadowOffset.y;
            }

            context.globalAlpha = this.transparency;
            
            // render the object
            this.renderObject(context, screenSize);
            
            // restore the context
            context.restore();

            context.shadowColor = "black";
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            context.save();
            context.rotate(this.rotation);

            if (this.clipChildren) {
                const clippingRect = new Path2D();

                if (this.borderRadius > 0) {
                    clippingRect.roundRect(position.x, position.y, size.x, size.y, this.borderRadius);
                } else {
                    clippingRect.rect(position.x, position.y, size.x, size.y);
                }
                
                context.clip(clippingRect);
            }

            this.preChildRender.trigger(context, screenSize, this.children);
            this.renderChildren(context, screenSize);
            this.postChildRender.trigger(context, screenSize, this.children);

            context.restore();

            this.lastScreenSize = screenSize;

            this.onRender.trigger();
        }

        // renders the children of this object
        renderChildren (context, screenSize) {
            // draw the children
            const children = this.children.sort((a, b) => a.zIndex - b.zIndex);

            // translate by canvas position
            context.translate(this.canvasPosition.x, this.canvasPosition.y);

            for (let i = 0; i < children.length; i++){
                if (children[i].visible){
                    children[i].render(context, screenSize, Vector2.zero);
                }
            }

            // translate back
            context.translate(-this.canvasPosition.x, -this.canvasPosition.y);
        }

        // renders the object to the given context
        renderObject (context, screenSize) {
            const size = this.getScreenSize(screenSize);
            
            context.beginPath();
            
            if (this.backgroundEnabled) {
                if (this.borderRadius > 0) {
                    context.roundRect(0, 0, size.x, size.y, this.borderRadius);
                } else {
                    context.rect(0, 0, size.x, size.y);
                }
                
                context.fillStyle = this.backgroundColor;
                context.fill();
            }
            
            if (this.borderSize > 0){
                if (this.borderRadius > 0) {
                    context.roundRect(0, 0, size.x, size.y, this.borderRadius);
                } else {
                    context.rect(0, 0, size.x, size.y);
                }

                context.strokeStyle = this.borderColor;
                context.lineWidth = this.borderSize;
                context.stroke();
            }
            
            context.closePath();                

            // if (this.scrollableY && this.canvasSize.y*2 > size.y) {
            if (this.scrollableY) {
                this.renderScrollBar(context, screenSize);
            }
        }

        renderScrollBar (context, screenSize) {
            const size = this.getScreenSize(screenSize);
            const position = this.getScreenPosition(screenSize, true);

            const scrollBarSize = new Vector2(10, size.y);
            const visibleRatio = size.y / (this.canvasSize.y + size.y);  // Ratio of visible to total content

            const scrollHeight = Math.max(size.y * visibleRatio, 10);  // Ensures a minimum size for usability
            const scrollIndicatorSize = new Vector2(10, scrollHeight);

            const scrollBarPosition = new Vector2(size.x - 10, 0);

            let scrollRatio = -this.canvasPosition.y / this.canvasSize.y;
            let scrollIndicatorPositionY = scrollBarPosition.y + scrollRatio * (size.y - scrollIndicatorSize.y);

            const scrollIndicatorPosition = scrollBarPosition.add(new Vector2(0, scrollIndicatorPositionY));

            context.beginPath();
            context.rect(scrollBarPosition.x, scrollBarPosition.y, scrollBarSize.x, scrollBarSize.y);
            context.fillStyle = "#444444";
            context.fill();
            context.closePath();

            context.beginPath();
            context.rect(scrollIndicatorPosition.x, scrollIndicatorPosition.y, scrollIndicatorSize.x, scrollIndicatorSize.y);
            context.fillStyle = "#666666";
            context.fill();
            context.closePath();
        }

        // returns total offset from all ancestors canvas positions
        getCanvasOffset () {
            let offset = Vector2.zero;

            let parent = this.parent;

            while (parent !== null) {
                offset = offset.add(parent.canvasPosition);
                parent = parent.parent;
            }

            return offset;
        }


        // returns true if the given point is inside the object
        isPointInside (point, screenSize, useCanvasOffset = false) {
            const position = this.getScreenPosition(screenSize, useCanvasOffset);
            const size = this.getScreenSize(screenSize);
            
            
            // TODO : slightly clipped objects are still
            // kind of clickable, below fix does not work
            // if (this.parent != null && this.parent.clipChildren) {
            //     const parentPosition = this.parent ? this.parent.getScreenPosition(screenSize, useCanvasOffset) : new Vector2(0, 0);
            //     const parentSize = this.parent ? this.parent.getScreenSize(screenSize) : screenSize;

            //     // clamp position and size to parent in case
            //     // the object is clipped
            //     position.x = Math.max(position.x, parentPosition.x);
            //     position.y = Math.max(position.y, parentPosition.y);

            //     size.x = Math.min(size.x, parentSize.x - position.x);
            //     size.y = Math.min(size.y, parentSize.y - position.y);
            // }

            return point.x >= position.x && point.x <= position.x + size.x &&
                point.y >= position.y && point.y <= position.y + size.y;
        }

        // parents this object to the given object
        parentTo (object) {
            let oldParent = this.parent;
            
            if (object === null) {
                this.unparent();
            }

            if (object === this) {
                throw new Error("UIBase: Cannot parent an object to itself");
            } else if (!(object instanceof UIBase)) {
                throw new Error("UIBase: Cannot parent an object to a non-UIBase object");
            };

            let ancestor = object.parent;

            while (ancestor !== null) {
                if (ancestor === this) {
                    throw new Error("UIBase: Cannot parent an object to a child object");
                }

                ancestor = ancestor.parent;
            }

            this.parent = object;
            object.children.push(this);
            this.parentChanged.trigger(object, oldParent);
        }

        // removes the parent for this object
        unparent () {
            const parent = this.parent;

            if (parent === null) {
                return;
            };

            const index = parent.children.indexOf(this);

            if (index > -1){
                parent.children.splice(index, 1);
            }

            this.parent = null;
            this.parentChanged.trigger(null, parent);
        }

        // sets an attribute for this object
        setAttribute (name, value) {
            this.attributes[name] = value;
        }

        // returns the attribute for this object
        getAttribute (name) {
            return this.attributes[name];
        }

        // returns the ui root of this object
        getRoot () {
            return this.root;
        }

        // sets the root for this object
        setRoot (root) {
            if (this.root !== null && root !== null && this.parent === null) {
                this.root.removeObject(this);
            }

            this.root = root;

            for (let i = 0; i < this.children.length; i++) {
                this.children[i].setRoot(root);
            }
        }

        // returns true if this is a modal or is a
        // descendant of a modal
        belongsToModal () {
            let parent = this;

            while (parent !== null) {
                if (parent.isModal) {
                    return true;
                }

                parent = parent.parent;
            }

            return false;
        }

        // returns true if this object is a descendant of given
        isDescendantOf (object) {
            let parent = this.parent;

            while (parent !== null) {
                if (parent === object) {
                    return true;
                }

                parent = parent.parent;
            }

            return false;
        }

        // returns the final position of the object
        getScreenPosition (screenSize = this.lastScreenSize, useCanvasOffset = false) {
            // get abs position
            let thisPosition = this.positionAbsolute;

            if (useCanvasOffset) {
                thisPosition = thisPosition.add(this.getCanvasOffset());
            }

            // add scale position
            if (this.parent !== null) {
                // if there is a parent, use the scale applied to the parent size
                const parentSize = this.parent.getScreenSize(screenSize);
                thisPosition = thisPosition.add(parentSize.multiply(this.positionScale));
            } else {
                // if there is no parent, use the scale applied to screen size
                thisPosition = thisPosition.add(screenSize.multiply(this.positionScale));
            }

            // add pivot position
            const size = this.getScreenSize(screenSize);
            thisPosition = thisPosition.subtract(this.pivot.multiply(size));

            // add parent position
            const parentPosition = this.parent ? this.parent.getScreenPosition(screenSize) : new Vector2(0, 0);

            return parentPosition.add(thisPosition);
        }

        // returns the final size of the object
        getScreenSize (screenSize = this.lastScreenSize) {
            // get abs size
            let thisSize = this.sizeAbsolute;

            // add scale size
            if (this.parent !== null) {
                // if there is a parent, use the scale applied to the parent size
                const parentSize = this.parent.getScreenSize(screenSize);
                thisSize = thisSize.add(parentSize.multiply(this.sizeScale));
            } else {
                // if there is no parent, use the scale applied to screen size
                thisSize = thisSize.add(screenSize.multiply(this.sizeScale));
            }

            return thisSize;
        }

        getAncestors () {
            let parent = this.parent;

            if (parent === null) {
                return [];
            }

            let ancestors = [];

            while (parent !== null) {
                ancestors.push(parent);
                parent = parent.parent;
            }

            return ancestors
        }

        hasAbsoluteVisibility () {
            // if (!this.backgroundEnabled) {
            //     return false;
            // }

            // if (this.transparency === 0) {
            //     return false;
            // }

            return this.isVisibleOnScreen() || this.hasAbsoluteVisibleDescendant();
        }

        hasAbsoluteVisibleDescendant () {
            let HAVD = false;

            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];

                if (child.hasAbsoluteVisibility() || child.hasAbsoluteVisibleDescendant()) {
                    HAVD = true;
                    break;
                }
            }

            return HAVD;
        }

        // returns true if the object is visible
        // on the screen
        isVisibleOnScreen (screenSize = this.lastScreenSize, useCanvasOffset = false) {
            const visibilitySet = this.visible;

            // make sure it's rendering and has a parent
            if (!visibilitySet || (this.parent === null && this.root === null)) {
                return false;
            }

            const position = this.getScreenPosition(screenSize, useCanvasOffset);
            const size = this.getScreenSize(screenSize);

            const withinScreenSpace = position.x + size.x >= 0 && position.x <= screenSize.x &&
                position.y + size.y >= 0 && position.y <= screenSize.y;

            // make sure tis bounding rect is within the
            // borders of the screen
            if (!withinScreenSpace) {
                return false;
            }

            let parent = this.parent;

            // check if any ancestor is hidden or
            // is currently clipping off this child
            while (parent !== null) {
                if (!parent.visible) {
                    return false;
                }

                if (parent.clipChildren) {
                    const parentPosition = parent.getScreenPosition(screenSize, useCanvasOffset);
                    const parentSize = parent.getScreenSize(screenSize);

                    const withinParentSpace =
                        position.x   < parentPosition.x + parentSize.x &&
                        parentPosition.x < position.x + size.x &&
                        position.y   < parentPosition.y + parentSize.y &&
                        parentPosition.y < position.y + size.y;

                    if (!withinParentSpace) {
                        return false;
                    }
                }

                parent = parent.parent;
            }

            return true;
        }

        // clears all children under this ui Object
        clearChildren () {
            while (this.children.length > 0) {
                const child = this.children[0];
                child.unparent();
            }
        }
    }
})();