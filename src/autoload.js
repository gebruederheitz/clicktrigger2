import whenDomReady from 'when-dom-ready';
import { FactoryDOMConfig } from './factory/dom-config-factory.js';
import { FactoryDataAttributeConfig } from './factory/data-attribute-factory.js';

///////////////////////////////////////////////
// Find the appropriate Factory class and    //
// initialise it                             //
///////////////////////////////////////////////

const createFactory = () => {
    if (document.gh && document.gh.clicktrigger) {
        return new FactoryDOMConfig();
    } else if (document.querySelectorAll('[data-triggertarget]').length) {
        return new FactoryDataAttributeConfig();
    }
};

export default whenDomReady().then(createFactory);
