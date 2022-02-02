import { Config } from '../Config.js';
import { TriggerGroup } from '../TriggerGroup.js';
import { Scroller } from '../Scroller.js';

export class Factory {
    constructor() {
        // Initialize properties
        this.baseConfig = new Config();
        this.elements = [];
        this.groups = {};
        this.scoller = {};
        // Get the global configuration if present and update the config
        this.getGlobalConfig();
        // Get the trigger elements and parse individual configs (if any)
        this.getElements();
        this.init();
    }

    getGroup(groupid) {
        if (!this.groups[groupid]) {
            try {
                this.groups[groupid] = new TriggerGroup(groupid);
            } catch (e) {
                this.groups[groupid] = null;
            }
        }
        return this.groups[groupid];
    }

    getScroller(defaultBuffer) {
        if (!this.scroller) {
            this.scroller = new Scroller(defaultBuffer);
        }
        return this.scroller;
    }
}
