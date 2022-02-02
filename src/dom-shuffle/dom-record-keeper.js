import _debounce from 'lodash-es/debounce.js';

export class DomRecordKeeper {
    constructor() {
        this.rowLength = 0;
        this.didUpdate = false;
        this.triggers = [];
        this.onTargetTriggerAdded = this.onTargetTriggerAdded.bind(this);
        this.onResizeDebounced = _debounce(this.onResize, 100).bind(this);
        window.addEventListener('resize', this.onResizeDebounced);
    }

    onResize() {
        this.didUpdate = false;
    }

    onTargetTriggerAdded(target, trigger) {
        if (trigger.isSecondary) {
            target.once('trigger.added', this.onTargetTriggerAdded);
        } else {
            this.addTriggerElement(trigger.getElement());
        }
    }

    addTriggerElement(triggerElement) {
        this.triggers.push(triggerElement);
    }

    getRowLength() {
        if (this.didUpdate) return this.rowLength;
        return false;
    }

    getTriggerElements() {
        return this.triggers;
    }

    setRowLength(length) {
        this.rowLength = length;
        this.didUpdate = true;
    }
}
