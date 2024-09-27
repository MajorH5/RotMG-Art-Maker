import { Vector2 } from "../utils/vector2.js";
import { Sounds } from "../assets/sounds.js";
import { UITextBox } from "./uiTextBox.js";
import { Mouse } from "./mouse.js";
import { Constants } from "../utils/constants.js";
import { UIBase } from "./uiBase.js";

export const UIManager = (function () {
    return class UIManager {
        // creates a new uimanager object
        constructor (canvas, setMouseCursor = false) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");
            this.objects = [];
            this.mouses = [];
            this.setMouseCursor = setMouseCursor;

            // holds mouse states for each ui object
            // to know when to trigger mouse events
            this.mouseState = {
                mouseHolding: new Map(),
                mouseInside: new Map()
            };
            this.mouses.push(new Mouse(canvas));

            document.addEventListener('touchstart', (event) => {
                const changedTouched = event.changedTouches;

                for (let i = 0; i < changedTouched.length; i++) {
                    const touch = changedTouched[i];
                    const mouse = new Mouse(canvas, touch);

                    this.mouses.push(mouse);
                    
                    // useless?
                    mouse.mouseDown.trigger(mouse.position, mouse);
                }
            });

            document.addEventListener('touchend', (event) => {
                const changedTouched = event.changedTouches;

                for (let i = 0; i < changedTouched.length; i++) {
                    const touch = changedTouched[i];
                    const mouse = this.mouses.find(mouse => mouse.identifier === touch.identifier);

                    if (mouse !== undefined) {
                        mouse.mouseUp.trigger(mouse.position, mouse); 

                        const held = Array.from(mouse.heldObjects.keys());
                        const inside = Array.from(mouse.insideObjects.keys());

                        for (let i = 0; i < held.length; i++) {
                            const object = held[i];

                            object.mouseUp.trigger(mouse.position, mouse);
                        }

                        for (let i = 0; i < inside.length; i++) {
                            const object = inside[i];

                            object.mouseLeave.trigger(mouse.position, mouse);
                        }

                        this.mouses.splice(this.mouses.indexOf(mouse), 1);
                    }
                }

                Sounds.resumeAudioContext();

                canvas.blur();
            });

            canvas.addEventListener('focus', () => {                
                if (UITextBox.current !== null) {
                    document.getElementById('mobile-inputs').focus();
                } else {
                    document.getElementById('mobile-inputs').blur();
                }
            });

            canvas.addEventListener('wheel', (event) => {
                const direction = Math.sign(event.wheelDeltaY);
                const [mouse] = this.mouses;
                
                mouse.setScroll(direction);

                const held = Array.from(mouse.insideObjects.keys());

                if (held.some((object) => object.scrollableX || object.scrollableY || object.scrollable)) {
                    event.preventDefault();
                }
            });

            document.addEventListener('keydown', (event) => {
                if (UITextBox.current !== null && !Constants.MOBILE_ENVIRONMENT) {
                    UITextBox.current.handleKeyInput(event);
                }
            });

            this.mouses.forEach((mouse) => {
                mouse.mouseDown.listen((position) => {
                    const screenSize = new Vector2(this.canvas.width, this.canvas.height);
                    let hitObjects = [];
            
                    // Recursive function to gather all objects including children
                    const gatherObjects = (objectList, parentZIndex = 0) => {
                        for (let i = 0; i < objectList.length; i++) {
                            const object = objectList[i];
            
                            if (!object.visible) {
                                continue;
                            }
            
                            // Calculate effective zIndex (parentZIndex + object's own zIndex)
                            const effectiveZIndex = parentZIndex + object.zIndex;
            
                            const mouseIsInside = object.isPointInside(position, screenSize, true);
            
                            if (mouseIsInside) {
                                // Store the object along with its effective zIndex
                                hitObjects.push({ object, effectiveZIndex });
            
                                // Recursively gather children with the updated zIndex
                                if (object.children && object.children.length > 0) {
                                    gatherObjects(object.children, effectiveZIndex + 1);
                                }
                            }
                        }
                    };
            
                    // Start by gathering top-level objects (this.objects)
                    gatherObjects(this.objects);
            
                    // Sort by effective zIndex (higher zIndex comes first)
                    hitObjects = hitObjects.filter((object) => {
                        if (object.clickable) return true;
                        if (object instanceof UIBase && !object.backgroundEnabled) return false;
                        if (object instanceof UIBase && object.backgroundEnabled && object.transparency <= 0) return false;
        
                        return true;
                    })
                    hitObjects.sort((a, b) => b.effectiveZIndex - a.effectiveZIndex);
            
                    // Trigger mouseDown on the top-most object
                    if (hitObjects.length > 0) {
                        // hitObjects[0].object.mouseDown.trigger(position, mouse);
                    }
                });
            });
            
            
            // hitObjects = hitObjects.filter((object) => {
            //     if (object.clickable) return true;
            //     if (object instanceof UIBase && !object.backgroundEnabled) return false;
            //     if (object instanceof UIBase && object.backgroundEnabled && object.transparency <= 0) return false;

            //     return true;
            // })
        }

        // updates the ui manager and all ui objects
        update (deltaTime) {
            let cursor = "default";

            for (let i = 0; i < this.objects.length; i++){
                const object = this.objects[i];

                if (!object.visible) {
                    continue;
                }
                
                object.update(deltaTime);

                for (let i = 0; i < this.mouses.length; i++) {
                    const mouse = this.mouses[i];
                    const isPointer = this.updateMouseEvents(object, mouse);

                    if (isPointer) cursor = "pointer";
                }
            }
            
            for (let i = 0; i < this.mouses.length; i++) {
                const mouse = this.mouses[i];

                mouse.update();
            }

            this.setCursor(cursor);
        }

        // renders all the ui objects within
        // within this manager
        render (scale) {
            const screenSize = new Vector2(this.canvas.width, this.canvas.height);
            const objects = this.objects.sort((a, b) => a.zIndex - b.zIndex);

            for (let i = 0; i < objects.length; i++){
                const object = objects[i];

                if (object.visible) {
                    object.render(this.context, screenSize, scale);
                }
            }
        }

        // updates all mouse events for the
        // given object
        updateMouseEvents (object, mouse) {
            const screenSize = new Vector2(this.canvas.width, this.canvas.height);
            
            const mousePosition = mouse.position;
            const mouseDown = mouse.down;
            
            const mouseIsInside = object.isPointInside(mousePosition, screenSize, true);
            const mouseWasMoved = !mouse.lastPosition.equals(mousePosition);

            const mouseScroll = mouse.getScroll();

            let isOverClickable = false;

            if (mouseIsInside) {
                const visibleOnScreen = object.isVisibleOnScreen(screenSize, true);

                if (object.clickable && visibleOnScreen) isOverClickable = ArtEditor.isModalOpen() ? object.belongsToModal() : true;

                if (mouseDown && !mouse.lastDown && !mouse.isHolding(object) && visibleOnScreen) {
                    // fire mouse down event
                    mouse.hold(object);
                    object.mouseDown.trigger(mousePosition, mouse);

                    if (UITextBox.current !== null && object !== UITextBox.current && !mouse.isHolding(UITextBox.current)) {
                        UITextBox.current.blur();
                    }
                }

                
                if (!mouse.isInside(object) && visibleOnScreen) {
                    // fire mouse enter event
                    mouse.enter(object);
                    object.mouseEnter.trigger(mousePosition, mouse);
                }

                if (mouseWasMoved && visibleOnScreen) {
                    // fire mouse move event
                    object.mouseMove.trigger(mousePosition, mouse);
                }

                if (mouseScroll !== 0) {
                    object.scrolled.trigger(mouseScroll);
                }
            } else {
                if (mouse.isInside(object)) {
                    // fire mouse leave event
                    object.mouseLeave.trigger(mousePosition, mouse);
                    mouse.exit(object);
                }
            }

            if (!mouseDown && mouse.isHolding(object)) {
                // fire mouse up event
                if (mouseIsInside) {
                    object.mouseUp.trigger(mousePosition, mouse);

                    if (object.clickable && object.playMouseDownSound) {
                        Sounds.playSfx(Sounds.SND_BUTTON_CLICK);
                    }
                }
                this.releaseMouseHolding(object);    
            }

            for (let i = 0; i < object.children.length; i++){
                const child = object.children[i];
                let clickable = this.updateMouseEvents(child, mouse);

                if (clickable) isOverClickable = true;
            }

            return isOverClickable;
        }

        getHits (mouse, objects) {
            let hits = [];

            for (let i = 0; i < objects.length; i++) {      
                const object = objects[i];
                const isValidTarget = object.isPointInside(mouse.position, new Vector2(this.canvas.width, this.canvas.height), true);
                
                if (isValidTarget) {
                    hits.push(objects[i]);
                }
            }

            return hits;
        }

        getMouseCurrent (mouse) {
            let hit = null;
            let toSearch = this.objects;

            while (toSearch.length > 0) {
                const hits = this.getHits(mouse, toSearch);
                const priorityIndex = hits
                    .sort((a, z) => z.zIndex - a.zIndex)
                    .findIndex((object) => object.hasAbsoluteVisibility());

                if (priorityIndex !== -1) {
                    const priority = hits[priorityIndex];
                    toSearch = priority.children;
                    hit = priority;
                } else {
                    toSearch = []
                }
            }

            return [hit, ...hit.getAncestors()];
        }
        
        // sets the current cursor
        setCursor (cursor) {
            if (!this.setMouseCursor) {
                return;
            }
            
            this.canvas.style.cursor = cursor;
        }

        // adds the given object to the ui manager
        addObject (object) {
            this.objects.push(object);
            object.setRoot(this);
        }

        // removes the given object from the ui manager
        removeObject (object) {
            const index = this.objects.indexOf(object);

            if (index > -1){
                this.objects.splice(index, 1);
            }

            this.releaseMouseHolding(object, true);
            this.releaseMouseInside(object, true);

            object.setRoot(null);
        }

        // clears all objects from the ui manager
        clearObjects () {
            this.objects = [];
        }

        // releases the mouse holding state
        // for the given object
        releaseMouseHolding (object, releaseChildren) {
            this.mouses.forEach((mouse) => {
                mouse.release(object);

                if (releaseChildren) {
                    for (let i = 0; i < object.children.length; i++) {
                        this.releaseMouseHolding(object.children[i]);
                    }
                }
            });
        }

        // releases the mouse inside state
        // for the given object
        releaseMouseInside (object, releaseChildren) {
            this.mouses.forEach((mouse) => {
                mouse.exit(object);

                if (releaseChildren) {
                    for (let i = 0; i < object.children.length; i++) {
                        this.releaseMouseHolding(object.children[i]);
                    }
                }
            });
        }
    }
})();