import _startsWith from 'lodash-es/startsWith.js';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { Factory } from './abstract-factory.js';
import { LocationTrigger } from '../trigger/location-trigger.js';
import { ClickTrigger } from '../trigger/click-trigger.js';
import { Target } from '../Target.js';
import { Config } from '../Config.js';

/**
 *   LEGACY Factory that reads the configuration from a set of data-attributes
 *   (like in version 1)
 *
 *   @extends    Factory
 */
export class FactoryDataAttributeConfig extends Factory {
    getGlobalConfig() {
        const confElementList = document.querySelectorAll(
            '[data-triggerglobals]'
        );
        const confElementArray = Array.from(confElementList);
        confElementArray.forEach((element) => {
            const conf = this.parseDatasetToConfig(element.dataset);
            this.baseConfig = conf;
        });
    }

    getElements() {
        this.elements = Array.from(
            document.querySelectorAll('[data-triggertarget]')
        );
    }

    init() {
        const loadEvent = new EventEmitter();
        const locationTrigger = new LocationTrigger(loadEvent);
        if (this.baseConfig.scroll.doScroll) {
            this.getScroller(this.baseConfig.scroll.buffer);
        }
        // Iterate over all elements
        this.elements.forEach((element) => {
            try {
                // Parse the element's config, i.e. where it overrides the global config
                const elementConfig = this.parseDatasetToConfig(
                    element.dataset,
                    element
                );
                // CLICK TRIGGER
                const isSecondaryTrigger = !!element.dataset.triggersecondary;
                const trigger = new ClickTrigger(
                    element,
                    elementConfig,
                    isSecondaryTrigger
                );
                // TARGET
                const targetElement = elementConfig.target;
                const target =
                    (targetElement.ghClickTrigger &&
                        targetElement.ghClickTrigger.addTrigger(trigger)) ||
                    new Target(targetElement, elementConfig, trigger);
                // SCROLLING
                // ----@NB needs to be added before group, so the event listeners are
                // ----attached in the right order
                if (elementConfig.scroll.doScroll) {
                    this.getScroller().addTarget(target);
                }
                // GROUP
                if (elementConfig.groupName) {
                    const group = this.getGroup(elementConfig.groupName);
                    if (group) {
                        group.registerTarget(target);
                        trigger.addGroup(group);
                        if (!isSecondaryTrigger && elementConfig.reposition) {
                            group.registerForRepositioning(target, trigger);
                        }
                    }
                }
                // LOCATION TRIGGER (URL/HASH)
                if (locationTrigger) target.addLocationTrigger(locationTrigger);
            } catch (e) {
                return false;
            }
        });
        loadEvent.emit('load');
    }

    getBooleanFromString(string) {
        if (typeof string == 'undefined') return undefined;
        try {
            return JSON.parse(string);
        } catch (e) {
            return !!string;
        }
    }

    getTarget(selectorString, element) {
        if (selectorString === 'self') {
            return element;
        } else if (_startsWith(selectorString, 'relative::')) {
            const parts = selectorString.split('::');
            parts.shift(); // remove the 'relative' prefix
            let result = element;
            parts.forEach((part) => {
                if (part === 'parent') {
                    result = result.parentElement;
                } else {
                    result = result.querySelector(part);
                }
            });
            return result;
        } else {
            return document.querySelector(selectorString);
        }
    }

    parseClasses(string) {
        return (string && string.split(',').map((e) => e.trim())) || undefined;
    }

    parseDatasetToConfig(data, trigger) {
        const newConfig = new Config(this.baseConfig);
        if (data.triggertype == 'toggleClass') {
            // special legacy case
            newConfig.set.type('toggle');
            newConfig.set.method('classes');
        } else {
            newConfig.set.type(data.triggertype);
        }
        const doScroll = this.getBooleanFromString(data.triggerscroll);
        newConfig.set.scroll({
            doScroll: doScroll,
            buffer: data.triggerscroll,
        });
        newConfig.setScrollBack(data.triggernoscrollback);
        newConfig.set.classes({
            trigger: {
                active: this.parseClasses(data.triggeractive),
                contrast: this.parseClasses(data.triggerinactive),
            },
        });
        newConfig.set.groupName(data.triggergroup);
        newConfig.set.slug(data.triggerslug);
        const target = this.getTarget(data.triggertarget, trigger);
        newConfig.set.target(target);
        if (data.triggerreposition) {
            const reposition = this.getBooleanFromString(
                data.triggerreposition
            );
            newConfig.setAlways.reposition(reposition);
        }
        newConfig.set.method(data.triggermethod);
        return newConfig;
    }
}
