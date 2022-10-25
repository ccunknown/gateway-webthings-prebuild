/// <reference types="webdriverio/async" />
import { Page, Section } from './elements';
declare class AddonSection extends Section {
    constructor(browser: WebdriverIO.Browser, rootElement: WebdriverIO.Element);
    getName(): Promise<string>;
    enable(): Promise<void>;
    disable(): Promise<void>;
    remove(): Promise<void>;
}
export declare class AddonSettingsPage extends Page {
    constructor(browser: WebdriverIO.Browser, url: string);
    findAddon(name: string): Promise<AddonSection | null>;
    openDiscoverAddonPage(): Promise<AddonDiscoverPage | null>;
}
export declare class AddonDiscoverPage extends Page {
    constructor(browser: WebdriverIO.Browser, url: string);
    findAddon(name: string): Promise<Element | null>;
    back(): Promise<AddonSettingsPage | null>;
}
export {};
//# sourceMappingURL=addon-settings-pages.d.ts.map