import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export class LocationTrigger extends EventEmitter {
    constructor(factory) {
        super();
        // Bind event handlers to instance
        this.onHashChange = this.onHashChange.bind(this);
        this.setMaxListeners(50);
        // Initialize
        window.addEventListener('hashchange', this.onHashChange);
        factory.once('load', this.onHashChange);
    }

    //----------------------------------------------------[ API / "public" ]----

    //----------------------------------------------------[ Event emitters ]----

    onHashChange() {
        const currentHash = window.location.hash.slice(1) || '';
        this.emit(currentHash, this);
    }

    //----------------------------------------------------[ Event handlers ]----
}
