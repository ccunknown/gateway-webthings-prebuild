"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPage = void 0;
const elements_1 = require("./elements");
const addon_settings_pages_1 = require("./addon-settings-pages");
class SettingSection extends elements_1.Section {
    constructor(browser, rootElement) {
        super(browser, rootElement);
        this.defineElement('link', 'a');
    }
    async openSettingsPage() {
        const el = this.rootElement;
        const href = await el.getAttribute('href');
        const id = await el.getAttribute('id');
        await el.waitForClickable();
        await el.click();
        switch (id) {
            case 'addon-settings-link':
                return new addon_settings_pages_1.AddonSettingsPage(this.browser, href);
            default:
                return null;
        }
    }
}
class SettingsPage extends elements_1.Page {
    constructor(browser) {
        super(browser, '/settings');
        this.defineSection('addon', '#addon-settings-link', SettingSection);
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
exports.SettingsPage = SettingsPage;
//# sourceMappingURL=settings-page.js.map