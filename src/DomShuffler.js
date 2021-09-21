import _debounce from 'lodash-es/debounce';

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

export class DomShuffler {
    constructor(target, recordKeeper) {
        this.target = target;
        this.recordKeeper = recordKeeper;
        this.didResize = true;
        this.onTargetChange = this.onTargetChange.bind(this);
        this.onResizeDebounced = _debounce(this.onResize, 120).bind(this);
        window.addEventListener('resize', this.onResizeDebounced);
        target.on('change', this.onTargetChange);
    }

    onResize() {
        this.didResize = true;
    }

    onTargetChange(event) {
        if (!this.didResize || event.action !== 'show') return; //noop
        this.repositionTarget();
    }

    repositionTarget() {
        const trigger = this.target.getPrimaryTriggerElement();
        const newPosition = this.determineDynamicTargetPosition(trigger);
        if (newPosition) {
            this.didResize = false;
            const container = trigger.parentElement;
            const targetElement = this.target.getElement();
            if (newPosition === 'append') {
                container.appendChild(targetElement);
            } else {
                container.insertBefore(targetElement, newPosition);
            }
        }
    }

    determineDynamicTargetPosition(trigger) {
        const triggersInContainer = this.recordKeeper.getTriggerElements();
        const triggerCount = triggersInContainer.length;
        const triggerIndex = triggersInContainer.indexOf(trigger);
        const triggersInRow = this.getRowLength(trigger, triggerCount);
        let insertionIndex = this.getNearestInsertionIndex(
            triggersInRow,
            triggerIndex,
            triggerCount
        );
        // native DOM supports 'before'-style inserts only, so use the next element
        ++insertionIndex;
        // special case: the last trigger element
        if (insertionIndex >= triggerCount) {
            return 'append';
        }
        return triggersInContainer[insertionIndex];
    }

    getMaxWidth(element) {
        return (
            (window.getComputedStyle(element) &&
                window.getComputedStyle(element).maxWidth &&
                parseInt(window.getComputedStyle(element).maxWidth, 10)) ||
            null
        );
    }

    getNearestInsertionIndex(rowLength, itemIndex, count) {
        const maxIndex = --count;
        const initialInsertionIndex = rowLength - 1;
        if (itemIndex <= initialInsertionIndex) return initialInsertionIndex;
        const variator = Math.floor(itemIndex / rowLength);
        const insertionIndex = initialInsertionIndex + variator * rowLength;
        if (insertionIndex >= maxIndex) return maxIndex;
        return insertionIndex;
    }

    // this is assuming all triggers in a row have the same horizontal dimensions
    getRowLength(trigger, triggerCount) {
        let rowLength;
        const fromRecords = this.recordKeeper.getRowLength();
        if (fromRecords !== false) return fromRecords;
        const width = trigger.offsetWidth;
        const maxwidth = this.getMaxWidth(trigger);
        if (typeof width != 'number' || !width) return false;
        const containerWidth =
            parseInt(
                window.getComputedStyle(trigger.parentElement).width,
                10
            ) || window.innerWidth;
        if (
            maxwidth &&
            width == maxwidth &&
            width * triggerCount < containerWidth
        ) {
            rowLength = triggerCount;
        } else {
            rowLength = Math.floor(containerWidth / width);
        }
        this.recordKeeper.setRowLength(rowLength);
        return rowLength;
    }
}

export default DomShuffler;
