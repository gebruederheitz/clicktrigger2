import _startsWith from 'lodash-es/startsWith.js';

import { Factory } from './abstract-factory.js';
import { Config } from '../Config.js';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { LocationTrigger } from '../trigger/location-trigger.js';
import { Target } from '../Target.js';
import { ClickTrigger } from '../trigger/click-trigger.js';

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
}
