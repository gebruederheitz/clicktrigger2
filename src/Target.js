import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import $ from 'jquery';

import { TargetChangeEvent } from './TargetChangeEvent';

import { ClickTrigger } from './trigger/click-trigger.js';
import { LocationTrigger } from './trigger/location-trigger.js';

export class Target extends EventEmitter {
    constructor(element, config, trigger) {
        super();

        this.isOpen = false;

        this.config = config; // @TODO
        this.element = element;
        this.classes = config.classes.target;
        this.slug = config.slug;
        this.primaryTrigger = null;
        this.group = null;
        this.method = config.method;

        this.onGroupChange = this.onGroupChange.bind(this);
        this.onHideTriggered = this.onHideTriggered.bind(this);
        this.onShowTriggered = this.onShowTriggered.bind(this);
        this.onToggleTriggered = this.onToggleTriggered.bind(this);

        if (trigger) this.addTrigger(trigger);
        this.element.ghClickTrigger = this;
    }

    //----------------------------------------------------[ API / "public" ]----

    addTrigger(trigger) {
        if (!(trigger instanceof ClickTrigger)) throw 'Invalid trigger';
        trigger
            .on('toggle', this.onToggleTriggered)
            .on('hide', this.onHideTriggered)
            .on('show', this.onShowTriggered);
        // Have the Trigger subscribe to our events
        trigger.addTarget(this);
        if (!this.primaryTrigger && !trigger.isSecondary) {
            this.primaryTrigger = trigger;
        }
        // this.emit('trigger.added', trigger);
    }

    addLocationTrigger(trigger) {
        if (!(trigger instanceof LocationTrigger)) throw 'Invalid trigger';
        trigger.on(this.slug, this.onShowTriggered);
    }

    getElement() {
        return this.element;
    }

    getGroup() {
        return this.group;
    }

    getPrimaryTriggerElement() {
        return this.primaryTrigger ? this.primaryTrigger.getElement() : null;
    }

    registerGroup(group) {
        this.group = group;
        group.on('change', this.onGroupChange);
    }

    //-----------------------------------------------------[ Utility ]----------

    hide() {
        if (this.method === 'jQuery') {
            $(this.element).slideUp();
        } else {
            this.classes.visible.forEach((className) => {
                this.element.classList.remove(className);
            });
            this.classes.hidden.forEach((className) => {
                this.element.classList.add(className);
            });
        }
    }

    show() {
        if (this.method === 'jQuery') {
            $(this.element).slideDown();
        } else {
            this.classes.hidden.forEach((className) => {
                this.element.classList.remove(className);
            });
            this.classes.visible.forEach((className) => {
                this.element.classList.add(className);
            });
        }
    }

    //----------------------------------------------------[ Event emitters ]----
    //----------------------------------------------------[ Event handlers ]----

    onGroupChange(currentlyOpenElement) {
        if (this.isOpen && currentlyOpenElement !== this) {
            this.onHideTriggered();
        }
    }

    onHideTriggered() {
        if (!this.isOpen) return;
        this.isOpen = false;
        new TargetChangeEvent(this, 'hide');
        this.hide();
    }

    onShowTriggered() {
        if (this.isOpen) return;
        this.isOpen = true;
        new TargetChangeEvent(this, 'show');
        this.show();
    }

    onToggleTriggered() {
        const event = this.isOpen ? 'hide' : 'show';
        this.isOpen = !this.isOpen;
        new TargetChangeEvent(this, event);
        this[event]();
    }
}
