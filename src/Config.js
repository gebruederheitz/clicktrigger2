import _merge from 'lodash-es/merge';
import { v4 as uuid } from 'uuid';

import { DEFAULT_CLASSES } from './defaults';

class Config {
    constructor(base) {
        this.type = 'toggle';
        this.slug = uuid();
        this.groupName = '';
        this.target = '';
        this.method = 'jQuery';
        this.classes = DEFAULT_CLASSES;
        this.scroll = {
            doScroll: false,
            buffer: '',
            scrollBack: true,
            breakpoints: null,
        };
        this.reposition = false;
        if (base && base instanceof Config) {
            _merge(this, base);
        }
        this.set = this.initSetMagic(this);
        this.setAlways = this.initSetMagic(this, 'setValueAlways');
    }

    initSetMagic(thisVal, setFunction) {
        setFunction = setFunction || 'setValue';
        const out = {};
        for (let prop in thisVal) {
            // eslint-disable-next-line no-prototype-builtins
            if (!thisVal.hasOwnProperty(prop)) continue;
            out[prop] = thisVal[setFunction].bind(thisVal, prop);
        }
        return out;
    }

    clone() {
        return _merge({}, this);
    }

    mergeWith(confObj) {
        return _merge(this, confObj);
    }

    setValue(key, value) {
        if (!value) return;
        this.setValueAlways(key, value);
    }

    // Use for values that could be null, false or "falsy"
    setValueAlways(key, value) {
        if (typeof value == 'undefined') return;
        if (typeof this[key] == 'object') {
            _merge(this[key], value);
        } else if (typeof this[key] != 'undefined') {
            this[key] = value;
        }
    }

    setScrollBack(value) {
        if (typeof value == 'undefined') return;
        try {
            // Converts bool string to a Boolean, leaves Booleans intact
            const boolVal = JSON.parse(value);
            // scrollback is set negatively via the "notscrollback" option – so we need to reverse that value
            this.scroll.scrollBack = !boolVal;
        } catch (e) {
            return;
        }
    }
}

export default Config;
