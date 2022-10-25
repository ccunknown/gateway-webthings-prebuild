/// <reference types="webdriverio/async" />
declare class Elements {
    protected browser: WebdriverIO.Browser;
    protected rootElement?: WebdriverIO.Element;
    protected selector: string;
    [name: string]: any;
    constructor(browser: WebdriverIO.Browser, rootElement?: WebdriverIO.Element, selector?: string);
    defineDisplayedProperty(name: string, selector: string): void;
    defineWaitForProperty(name: string, selector: string, onValue?: boolean): void;
    defineElement(name: string, selector: string, onValue?: boolean): void;
    defineElements(name: string, selector: string, onValue?: boolean): void;
}
export declare class Section extends Elements {
}
export declare class Page extends Elements {
    protected path: string;
    constructor(browser: WebdriverIO.Browser, path: string);
    /**
     * Define properties for section.
     * @param {String} name
     * @param {String} selector
     * @param {Class Section} section
     * @param {Boolean} onValue
     */
    defineSection(name: string, selector: string, section: typeof Section, onValue?: boolean): void;
    /**
     * Define properties for sections.
     * @param {String} name
     * @param {String} selector
     * @param {Class Section} section
     * @param {Boolean} onValue
     */
    defineSections(name: string, selector: string, section: typeof Section, onValue?: boolean): void;
    open(): Promise<void>;
}
export {};
//# sourceMappingURL=elements.d.ts.map