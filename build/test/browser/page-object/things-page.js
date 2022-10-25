"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThingsPage = void 0;
const elements_1 = require("./elements");
const thing_detail_page_1 = require("./thing-detail-page");
class ThingSection extends elements_1.Section {
    constructor(browser, rootElement) {
        super(browser, rootElement);
        this.defineElement('title', '.thing-title');
        this.defineElement('detailLink', '.thing-details-link');
        this.defineElement('clickable', [
            'webthing-light-capability',
            'webthing-multi-level-switch-capability',
            'webthing-on-off-switch-capability',
            'webthing-smart-plug-capability',
        ].join(','));
    }
    async click() {
        await this.waitClickable();
        const clickable = await this.clickable();
        await clickable.click();
    }
    async waitClickable() {
        await this.browser.waitUntil(async () => {
            const menuScrim = await this.browser.$('#menu-scrim.hidden');
            if (!menuScrim || !menuScrim.isExisting()) {
                return false;
            }
            const width = await menuScrim.getCSSProperty('width');
            if (width && width.parsed && width.parsed.value === 0) {
                return true;
            }
            return false;
        }, { timeout: 5000 });
    }
    async thingTitle() {
        const title = await this.title();
        return await title.getText();
    }
    async thingLevelDisplayed() {
        return await this.browser.execute(`(function () {
      const selector = [
        'webthing-light-capability',
        'webthing-multi-level-sensor-capability',
        'webthing-multi-level-switch-capability',
        'webthing-humidity-sensor-capability',
      ].join(',');
      const container = document.querySelector(selector);
      const label = container.shadowRoot.querySelector('#label,#contents');
      return label.innerText;
    })()`);
    }
    async thingPowerDisplayed() {
        return await this.browser.execute(`(function () {
      const container = document.querySelector('webthing-smart-plug-capability');
      const label = container.shadowRoot.querySelector('#label');
      return label.innerText;
    })()`);
    }
    async thingColorDisplayed() {
        // Function represented as string since otherwise mangling breaks it
        const fill = await this.browser.execute(`(function () {
      const container = document.querySelector('webthing-light-capability');
      const icon = container.shadowRoot.querySelector('#icon');
      return icon.style.fill;
    })()`);
        const rgb = `${fill}`.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
        const colorStyle = `#${Number(rgb[1]).toString(16)}${Number(rgb[2]).toString(16)}${Number(rgb[3]).toString(16)}`;
        return colorStyle;
    }
    async openDetailPage() {
        await this.waitClickable();
        const hasLink = await this.hasDetailLink();
        if (!hasLink) {
            return null;
        }
        const el = this.rootElement;
        const href = await el.getAttribute('href');
        const detailLink = await this.detailLink();
        await detailLink.click();
        return new thing_detail_page_1.ThingDetailPage(this.browser, href);
    }
}
class ThingsPage extends elements_1.Page {
    constructor(browser) {
        super(browser, '/things');
        this.defineSections('things', '.thing', ThingSection);
        this.defineSections('onThings', [
            'webthing-binary-sensor-capability',
            'webthing-light-capability',
            'webthing-multi-level-switch-capability',
            'webthing-on-off-switch-capability',
            'webthing-smart-plug-capability',
        ].join(','), ThingSection, true);
        this.defineSections('offThings', [
            'webthing-binary-sensor-capability',
            'webthing-light-capability',
            'webthing-multi-level-switch-capability',
            'webthing-on-off-switch-capability',
            'webthing-smart-plug-capability',
        ].join(','), ThingSection, false);
    }
    async wait() {
        await this.browser.waitUntil(async () => {
            const menuScrim = await this.browser.$('#menu-scrim.hidden');
            if (!menuScrim || !menuScrim.isExisting()) {
                return false;
            }
            const width = await menuScrim.getCSSProperty('width');
            if (width && width.parsed && width.parsed.value === 0) {
                return true;
            }
            return false;
        }, { timeout: 5000 });
    }
}
exports.ThingsPage = ThingsPage;
//# sourceMappingURL=things-page.js.map