export class TargetChangeEvent {
    constructor(emitter, action, originalSource = null) {
        this.source = emitter;
        this.originalSource = originalSource;
        this.action = action;
        this.scroll = emitter.config.scroll.doScroll;
        this.scrollBack = emitter.config.scroll.scrollBack || false;
        this.scrollConfig = null;

        if (this.scroll) this.scrollConfig = emitter.config.scroll;
        const eventName = 'change';
        emitter.emit(eventName, this);
    }
}
