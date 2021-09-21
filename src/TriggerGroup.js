import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { DomRecordKeeper, DomShuffler } from './DomShuffler';

class TriggerGroup extends EventEmitter {
    constructor(name) {
        super();

        this.name = name || '';
        this.currentlyOpenElement = null;
        this.setMaxListeners(56);
        this.domRecordKeeper = new DomRecordKeeper();

        this.handleTargetChange = this.handleTargetChange.bind(this);
    }

    registerTarget(target) {
        // Make sure the target gets a chance to subscribe to us
        target.registerGroup(this);
        // Subscribe to the target's change events
        target.on('change', this.handleTargetChange);
    }

    registerForRepositioning(target, trigger) {
        new DomShuffler(target, this.domRecordKeeper);
        if (target.primaryTrigger) {
            this.domRecordKeeper.addTriggerElement(trigger.getElement());
        }
    }

    handleTargetChange(event) {
        const { action, originalSource } = event;
        if (action == 'show' && originalSource != this.currentlyOpenElement) {
            this.currentlyOpenElement = originalSource;
            this.emitChangeEvent();
        }
        if (action == 'hide' && originalSource == this.currentlyOpenElement) {
            this.currentlyOpenElement = null;
            this.emitChangeEvent();
        }
    }

    emitChangeEvent() {
        this.emit('change', this.currentlyOpenElement);
    }
}

export default TriggerGroup;
