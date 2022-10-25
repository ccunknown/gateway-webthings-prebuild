"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddonDiscoverPage = exports.AddonSettingsPage = void 0;
const elements_1 = require("./elements");
class AddonSection extends elements_1.Section {
    constructor(browser, rootElement) {
        super(browser, rootElement);
        this.defineElement('removeButton', '.addon-settings-remove');
        this.defineElement('enableButton', '.addon-settings-enable');
        this.defineElement('disableButton', '.addon-settings-disable');
        this.defineElement('configButton', '.addon-settings-config');
        this.defineElement('name', '.addon-settings-name');
    }
    async getName() {
        const element = await this.name();
        return await element.getText();
    }
    async enable() {
        await this.waitForEnableButton();
        const element = await this.enableButton();
        await element.click();
    }
    async disable() {
        await this.waitForDisableButton();
        const element = await this.disableButton();
        await element.click();
    }
    async remove() {
        await this.waitForRemoveButton();
        const element = await this.removeButton();
        await element.click();
    }
}
class AddonSettingsPage extends elements_1.Page {
    constructor(browser, url) {
        super(browser, url);
        this.defineSections('addons', '.addon-item', AddonSection);
        this.defineElement('discover', '#discover-addons-button');
    }
    async findAddon(name) {
        const addons = await this.addons();
        for (const addon of addons) {
            const addonName = await addon.getName();
            console.error(addonName);
            if (addonName === name) {
                return addon;
            }
        }
        return null;
    }
    async openDiscoverAddonPage() {
        if (!(await this.hasDiscover())) {
            return null;
        }
        const discover = await this.discover();
        await discover.click();
        return new AddonDiscoverPage(this.browser, '/settings/addons/discovered');
    }
}
exports.AddonSettingsPage = AddonSettingsPage;
class DiscoveredAddonSection extends elements_1.Section {
    constructor(browser, rootElement) {
        super(browser, rootElement);
        this.defineElement('addButton', '.addon-discovery-settings-add');
        this.defineElement('added', '.addon-discovery-settings-added');
        this.defineElement('name', '.addon-settings-name');
    }
    async getName() {
        const element = await this.name();
        return await element.getText();
    }
    async add() {
        await this.waitForAddButton();
        const element = await this.addButton();
        await element.click();
    }
}
class AddonDiscoverPage extends elements_1.Page {
    constructor(browser, url) {
        super(browser, url);
        this.defineSections('addons', '.discovered-addon-item', DiscoveredAddonSection);
        this.defineElement('backButton', '#settings-back-button');
    }
    async findAddon(name) {
        const addons = await this.addons();
        for (const addon of addons) {
            const addonName = await addon.getName();
            if (addonName === name) {
                return addon;
            }
        }
        return null;
    }
    async back() {
        if (!(await this.hasBackButton())) {
            return null;
        }
        const el = await this.backButton();
        const href = await el.getAttribute('href');
        await el.click();
        return new AddonSettingsPage(this.browser, href);
    }
}
exports.AddonDiscoverPage = AddonDiscoverPage;
//# sourceMappingURL=addon-settings-pages.js.map