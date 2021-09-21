import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import _startsWith from 'lodash-es/startsWith';

import Config from './Config';
import { ClickTrigger, LocationTrigger } from './triggers';
import Scroller from './Scroller';
import Target from './Target';
import TriggerGroup from './TriggerGroup';

class Factory {
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
} // class Factory

export class FactoryDOMConfig extends Factory {
    getGlobalConfig() {
        this.baseConfig = new Config().mergeWith(document.gh.clicktrigger);
    }

    getElements() {
        this.elements = this.baseConfig.elements;
    }

    init() {
        const loadEvent = new EventEmitter();
        const locationTrigger = new LocationTrigger(loadEvent);
        if (this.baseConfig.scroll.doScroll) {
            this.getScroller(this.baseConfig.scroll.buffer);
        }
        this.elements.forEach((conf) => {
            let group = null;
            const { triggers, target, slug, groupName, reposition } = conf;
            const elementConfig = new Config(this.baseConfig);
            elementConfig.set.slug(slug);
            elementConfig.set.groupName(groupName);
            elementConfig.setAlways.reposition(reposition);
            /* TARGET --------------------------------------------------------*/
            const targetElement = this.getElementFromSelector(target);
            let targetObject;
            try {
                targetObject = new Target(targetElement, elementConfig);
            } catch (e) {
                return false;
            }
            /* SCROLLING -------------------------------------------------------
             *  ----@NB needs to be added before group, so the event listeners
             *  ---- are attached in the right order                          */
            if (elementConfig.scroll.doScroll) {
                this.getScroller(this.baseConfig.scroll.buffer).addTarget(
                    targetObject
                );
            }
            /* GROUP ---------------------------------------------------------*/
            if (elementConfig.groupName) {
                group = this.getGroup(elementConfig.groupName);
                if (group) group.registerTarget(targetObject);
            }
            /* CLICKTRIGGERS -------------------------------------------------*/
            triggers.forEach((confObj) => {
                const { element, type, secondary } = confObj;
                const triggerElement = this.getElementFromSelector(element);
                const triggerConfig = new Config(elementConfig);
                triggerConfig.set.type(type);
                let trigger = null;
                try {
                    trigger = new ClickTrigger(
                        triggerElement,
                        triggerConfig,
                        !!secondary
                    );
                } catch (e) {
                    return false;
                }
                targetObject.addTrigger(trigger);
                /* GROUP FOR TRIGGERS ----------------------------------------*/
                if (group) trigger.addGroup(group);
                /* REPOSITIONING ---------------------------------------------*/
                if (!secondary && elementConfig.reposition) {
                    group.registerForRepositioning(targetObject, trigger);
                }
            });
            /* LOCATION TRIGGER ----------------------------------------------*/
            if (locationTrigger)
                targetObject.addLocationTrigger(locationTrigger);
        });
        loadEvent.emit('load');
    }

    getElementFromSelector(selector) {
        let parentLevel = 0;
        while (
            (selector.startsWith && selector.startsWith('$parent::')) ||
            _startsWith(selector, '$parent::')
        ) {
            selector = selector.slice(9);
            parentLevel++;
        }
        let element = document.querySelector(selector);
        let counter = 0;
        while (counter < parentLevel) {
            element = element.parentElement;
            counter++;
        }
        return element;
    }
} // class FactoryDOMConfig

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
        if (selectorString == 'self') {
            return element;
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
} // class FactoryDataAttributeConfig
