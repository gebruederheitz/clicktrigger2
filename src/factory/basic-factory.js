import { Config } from '../Config.js';
import { FactoryDOMConfig } from './dom-config-factory.js';

export class BasicFactory extends FactoryDOMConfig {
    constructor(userConfig) {
        super();
        this.userConfig = userConfig;
    }

    getGlobalConfig() {
        this.baseConfig = new Config().mergeWith(this.userConfig);
    }
}
