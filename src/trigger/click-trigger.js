import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { ACTIONS_ALLOWED } from '../defaults.js';

export class ClickTrigger extends EventEmitter {
    constructor(element, config, secondary) {
        super();
        // Check if desired action is allowed
        if (ACTIONS_ALLOWED.indexOf(config.type) === -1) {
            throw 'Invalid type/action given.';
        }
        // Set properties
        this.action = config.type;
        this.element = element;
        this.classes = config.classes.trigger;
        this.isSecondary = secondary;
        // Bind event handlers to instance
        this.onGroupChange = this.onGroupChange.bind(this);
        this.onTargetChange = this.onTargetChange.bind(this);
        this.onClick = this.onClick.bind(this);
        // Initialize
        this.element.classList.add(config.classes.trigger.inactive);
        this.element.addEventListener('click', this.onClick);
    }

    //----------------------------------------------------[ API / "public" ]----

    addTarget(target) {
        this.target = target;
        target.on('change', this.onTargetChange);
    }

    addGroup(group) {
        group.on('change', this.onGroupChange);
    }

    getElement() {
        return this.element;
    }

    //----------------------------------------------------[ Event emitters ]----
    //----------------------------------------------------[ (Hybrid) ]----------

    onClick() {
        this.emit(this.action);
    }

    //----------------------------------------------------[ Event handlers ]----

    onGroupChange(currentlyOpenElement) {
        if (
            currentlyOpenElement === null ||
            currentlyOpenElement == this.target
        ) {
            this.classes.contrast.forEach((className) => {
                this.element.classList.remove(className);
            });
        } else if (currentlyOpenElement != this.target) {
            this.classes.contrast.forEach((className) => {
                this.element.classList.add(className);
            });
        }
    }

    onTargetChange(event) {
        const isShowEvent = event.action == 'show';
        const classToAdd = isShowEvent
            ? this.classes.active
            : this.classes.inactive;
        const classToRemove = isShowEvent
            ? this.classes.inactive
            : this.classes.active;
        classToAdd.forEach((className) => {
            this.element.classList.add(className);
        });
        classToRemove.forEach((className) => {
            this.element.classList.remove(className);
        });
    }
}
