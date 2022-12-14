"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expect_utils_1 = require("../expect-utils");
const browser_common_1 = require("./browser-common");
const addon_manager_1 = __importDefault(require("../../addon-manager"));
const DEFAULT_CLICKABLE_TIMEOUT = 5000;
describe('basic browser tests', () => {
    afterEach(async () => {
        try {
            await addon_manager_1.default.uninstallAddon('virtual-things-adapter', true, false);
        }
        catch (e) {
            console.warn('Unable to cleanup virtual-thing-adapter', e);
        }
    });
    it('creates a user', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        await browser.url('/');
        const name = await browser.$('#name');
        const email = await browser.$('#email');
        const password = await browser.$('#password');
        const confirmPassword = await browser.$('#confirm-password');
        await name.waitForExist({ timeout: 5000 });
        await name.setValue('Test User');
        await email.setValue('test@example.com');
        await password.setValue('rosebud');
        await confirmPassword.setValue('rosebud');
        const createUserButton = await browser.$('#create-user-button');
        await createUserButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await createUserButton.click();
        const menuButton = await browser.$('#menu-button');
        await menuButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await (0, expect_utils_1.waitForExpect)(async () => {
            const newUrl = await browser.getUrl();
            expect(newUrl.endsWith('/things')).toBeTruthy();
        });
        // Wait for the connectivity scrim to appear, then hide it (and wait for the
        // transition to finish).
        try {
            const connectivityScrim = await browser.$('#connectivity-scrim');
            await connectivityScrim.waitForDisplayed();
            browser.execute(() => {
                document.getElementById('connectivity-scrim').classList.add('hidden');
            });
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        catch (_e) {
            // If it didn't appear, just move on.
        }
        await menuButton.click();
        const settingsMenuItem = await browser.$('#settings-menu-item');
        await settingsMenuItem.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await settingsMenuItem.click();
        // wait fadeout menu-scrim
        await browser.waitUntil(async () => {
            const menuScrim = await browser.$('#menu-scrim.hidden');
            if (!menuScrim || !menuScrim.isExisting()) {
                return false;
            }
            const width = await menuScrim.getCSSProperty('width');
            if (width && width.parsed && width.parsed.value === 0) {
                return true;
            }
            return false;
        }, { timeout: 5000 });
        const addonSettingsLink = await browser.$('#addon-settings-link');
        await addonSettingsLink.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await addonSettingsLink.click();
        const discoverAddonsButton = await browser.$('#discover-addons-button');
        await discoverAddonsButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await discoverAddonsButton.click();
        const addonInstallVirtualThingsAdapter = await browser.$('#addon-install-virtual-things-adapter');
        await addonInstallVirtualThingsAdapter.waitForClickable({ timeout: 10000 });
        await addonInstallVirtualThingsAdapter.click();
        // virtual-things-adapter is ~10MB, so it might take some time to install
        const addonDiscoverySettingsAdded = await browser.$('.addon-discovery-settings-added');
        await addonDiscoverySettingsAdded.waitForExist({ timeout: 30000 });
        const settingsBackButton = await browser.$('#settings-back-button');
        await settingsBackButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await settingsBackButton.click();
        await settingsBackButton.click();
        await menuButton.click();
        const thingsMenuItem = await browser.$('#things-menu-item');
        await thingsMenuItem.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await thingsMenuItem.click();
        // wait fadeout menu-scrim
        await browser.waitUntil(async () => {
            const menuScrim = await browser.$('#menu-scrim.hidden');
            if (!menuScrim || !menuScrim.isExisting()) {
                return false;
            }
            const width = await menuScrim.getCSSProperty('width');
            if (width && width.parsed && width.parsed.value === 0) {
                return true;
            }
            return false;
        }, { timeout: 5000 });
        const addButton = await browser.$('#add-button');
        await addButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await addButton.click();
        const newThingVirtualThings2SaveButton = await browser.$('#new-thing-virtual-things-2 > .new-thing-save-button');
        const newThingVirtualThings9SaveButton = await browser.$('#new-thing-virtual-things-9 > .new-thing-save-button');
        await newThingVirtualThings2SaveButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await newThingVirtualThings9SaveButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await newThingVirtualThings2SaveButton.click();
        await newThingVirtualThings9SaveButton.click();
        const addThingBackButton = await browser.$('#add-thing-back-button');
        await addThingBackButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await addThingBackButton.click();
        let things = null;
        await (0, expect_utils_1.waitForExpect)(async () => {
            things = await browser.$$('.thing');
            expect(things.length).toBe(2);
        });
        await things[0].waitForDisplayed({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await things[0].click();
        let link = await things[0].$('.thing-details-link');
        await link.waitForClickable({ timeout: 10000 });
        await link.click();
        let detailUrl = await browser.getUrl();
        expect(detailUrl.endsWith('/things/virtual-things-2')).toBeTruthy();
        const backButton = await browser.$('#back-button');
        await backButton.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await backButton.click();
        const webthingCustomCapability = await browser.$('webthing-custom-capability');
        webthingCustomCapability.waitForExist({ timeout: 2000 });
        things = await browser.$$('.thing');
        expect(things.length).toBe(2);
        link = await things[1].$('.thing-details-link');
        await link.waitForClickable({ timeout: DEFAULT_CLICKABLE_TIMEOUT });
        await link.click();
        detailUrl = await browser.getUrl();
        expect(detailUrl.endsWith('/things/virtual-things-9')).toBeTruthy();
    });
});
//# sourceMappingURL=load-test.js.map