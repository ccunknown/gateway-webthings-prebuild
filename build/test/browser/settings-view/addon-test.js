"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const browser_common_1 = require("../browser-common");
const test_utils_1 = require("../test-utils");
const settings_page_1 = require("../page-object/settings-page");
const expect_utils_1 = require("../../expect-utils");
const addon_manager_1 = __importDefault(require("../../../addon-manager"));
const sleep_1 = __importDefault(require("../../../sleep"));
afterEach(async () => {
    await addon_manager_1.default.uninstallAddon('virtual-things-adapter', true, false);
});
describe('Addon', () => {
    it('should be able to install the virtual-things-adapter', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        // give the browser a few seconds to finish loading everything before moving on
        await (0, sleep_1.default)(5000);
        const settingsPage = new settings_page_1.SettingsPage(browser);
        await settingsPage.open();
        await settingsPage.wait();
        const addonSettings = await settingsPage.addon();
        const addonSettingsPage1 = await addonSettings.openSettingsPage();
        const addon1 = await addonSettingsPage1.findAddon('Virtual Things');
        expect(addon1).toBeNull();
        const discoverAddonPage = await addonSettingsPage1.openDiscoverAddonPage();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const addon2 = await discoverAddonPage.findAddon('Virtual Things');
            expect(addon2).not.toBeNull();
        }, 10000);
        const addon3 = await discoverAddonPage.findAddon('Virtual Things');
        await addon3.add();
        await browser.waitUntil(async () => {
            const addon4 = await discoverAddonPage.findAddon('Virtual Things');
            if (!addon4) {
                return false;
            }
            return await addon4.hasAdded();
        }, { timeout: 30000 });
        const addonSettingsPage2 = await discoverAddonPage.back();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const addon5 = await addonSettingsPage2.findAddon('Virtual Things');
            expect(addon5).not.toBeNull();
            expect(await addon5.hasDisableButton()).toBeTruthy();
            expect(await addon5.hasRemoveButton()).toBeTruthy();
        });
        const addons = await (0, test_utils_1.getAddons)();
        expect(addons.has('virtual-things-adapter')).toBeTruthy();
    });
});
//# sourceMappingURL=addon-test.js.map