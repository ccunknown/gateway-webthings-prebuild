"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = exports.Section = void 0;
const TIMEOUT_MS = 30000;
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
class Elements {
    constructor(browser, rootElement, selector) {
        this.browser = browser;
        this.rootElement = rootElement;
        this.selector = selector !== null && selector !== void 0 ? selector : '';
    }
    defineDisplayedProperty(name, selector) {
        // Create new method which checks if elements are displayed.
        /**
         * @method hasName
         * @return boolean
         */
        this[`has${capitalizeFirstLetter(name)}`] = async () => {
            const rootElement = this.rootElement;
            if (!rootElement) {
                const el = await this.browser.$(selector);
                return await el.isExisting();
            }
            const elements = await rootElement.$$(selector);
            if (elements.length == 0) {
                return false;
            }
            // Check that all elements are displayed which match the selector.
            for (const el of elements) {
                if (!(await el.isDisplayed())) {
                    return false;
                }
            }
            return true;
        };
    }
    // Create new method which waits for elements are displayed.
    defineWaitForProperty(name, selector, onValue) {
        /**
         * @method waitForName
         */
        this[`waitFor${capitalizeFirstLetter(name)}`] = async () => {
            const rootElement = this.rootElement;
            if (!rootElement) {
                const el = await this.browser.$(selector);
                return await el.waitForExist({ timeout: TIMEOUT_MS });
            }
            return await this.browser.waitUntil(async () => {
                const elements = await rootElement.$$(selector);
                if (typeof onValue === 'boolean') {
                    for (const el of elements) {
                        const data = await el.getProperty('on');
                        if (data === onValue) {
                            return true;
                        }
                    }
                    return false;
                }
                else {
                    return elements.length > 0;
                }
            }, { timeout: TIMEOUT_MS });
        };
    }
    // Create new method which defines an HTML element.
    defineElement(name, selector, onValue) {
        /**
         * @method name
         * @return element
         */
        this[name] = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rootElement = this.rootElement || this.browser;
            return await rootElement.$(selector);
        };
        this.defineDisplayedProperty(name, selector);
        this.defineWaitForProperty(name, selector, onValue);
    }
    // Create new method which defines multiple HTML elements.
    defineElements(name, selector, onValue) {
        /**
         * @method name
         * @return element
         */
        this[name] = async () => {
            const rootElement = this.rootElement || this.browser;
            return await rootElement.$$(selector);
        };
        this.defineDisplayedProperty(name, selector);
        this.defineWaitForProperty(name, selector, onValue);
    }
}
class Section extends Elements {
}
exports.Section = Section;
class Page extends Elements {
    constructor(browser, path) {
        super(browser);
        this.path = path;
    }
    /**
     * Define properties for section.
     * @param {String} name
     * @param {String} selector
     * @param {Class Section} section
     * @param {Boolean} onValue
     */
    defineSection(name, selector, section, onValue) {
        /**
         * @method name
         * @return Section
         */
        this[name] = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rootElement = this.rootElement || this.browser;
            const e = await rootElement.$(selector);
            return new section(this.browser, e, selector);
        };
        this.defineDisplayedProperty(name, selector);
        this.defineWaitForProperty(name, selector, onValue);
    }
    /**
     * Define properties for sections.
     * @param {String} name
     * @param {String} selector
     * @param {Class Section} section
     * @param {Boolean} onValue
     */
    defineSections(name, selector, section, onValue) {
        /**
         * @method name
         * @return Array[Section]
         */
        this[name] = async () => {
            const rootElement = this.rootElement || this.browser;
            const elements = await rootElement.$$(selector);
            return elements.map((e) => new section(this.browser, e, selector));
        };
        this.defineDisplayedProperty(name, selector);
        this.defineWaitForProperty(name, selector, onValue);
    }
    async open() {
        await this.browser.url(this.path);
    }
}
exports.Page = Page;
//# sourceMappingURL=elements.js.map