import whenDomReady from 'when-dom-ready';
import { FactoryDOMConfig, FactoryDataAttributeConfig } from './Factory';

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
