class TargetChangeEvent {
    constructor(emitter, action) {
        this.originalSource = emitter;
        this.action = action;
        this.scroll = emitter.config.scroll.doScroll;
        if (this.scroll) this.scrollBuffer = emitter.config.scroll.buffer;
        this.scrollBack = emitter.config.scroll.scrollBack || false;
        const eventName = 'change';
        emitter.emit(eventName, this);
    }
}

export default TargetChangeEvent;
