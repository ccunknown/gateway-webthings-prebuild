"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const user_1 = require("../user");
const addon_manager_1 = __importDefault(require("../../addon-manager"));
const config_1 = __importDefault(require("config"));
const Constants = __importStar(require("../../constants"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const jsonfile_1 = __importDefault(require("jsonfile"));
const path_1 = __importDefault(require("path"));
const Platform = __importStar(require("../../platform"));
const package_json_1 = __importDefault(require("../../package.json"));
const semver_1 = __importDefault(require("semver"));
const sleep_1 = __importDefault(require("../../sleep"));
const user_profile_1 = __importDefault(require("../../user-profile"));
const url_1 = require("url");
const testManifestJsonFilename = path_1.default.join(user_profile_1.default.addonsDir, 'test-adapter', 'manifest.json');
const sourceLicense = path_1.default.join(__dirname, '..', '..', '..', 'LICENSE');
const destLicense = path_1.default.join(user_profile_1.default.addonsDir, 'settings-adapter', 'LICENSE');
const testManifestJson = {
    author: 'WebThingsIO',
    description: 'An adapter for integration tests',
    gateway_specific_settings: {
        webthings: {
            exec: '{nodeLoader} {path}',
            primary_type: 'adapter',
            strict_min_version: package_json_1.default.version,
            strict_max_version: package_json_1.default.version,
            enabled: true,
        },
    },
    homepage_url: 'https://github.com/WebThingsIO',
    id: 'test-adapter',
    license: 'MPL-2.0',
    manifest_version: 1,
    name: 'Test',
    version: '0',
};
const addonParams = new url_1.URLSearchParams();
addonParams.set('arch', Platform.getArchitecture());
addonParams.set('version', package_json_1.default.version);
addonParams.set('node', `${Platform.getNodeVersion()}`);
addonParams.set('python', Platform.getPythonVersions().join(','));
addonParams.set('test', config_1.default.get('addonManager.testAddons') ? '1' : '0');
const addonUrl = `${config_1.default.get('addonManager.listUrls')[0]}?${addonParams.toString()}`;
function copyManifest(manifest) {
    // This essentially does a deep copy.
    return JSON.parse(JSON.stringify(manifest));
}
async function loadSettingsAdapterWithManifestJson(manifest) {
    // If the adapter is already loaded, then unload it.
    if (addon_manager_1.default.getAdapter('test-adapter')) {
        await addon_manager_1.default.unloadAdapter('test-adapter');
    }
    // Create the manifest.json file for the test-adapter
    jsonfile_1.default.writeFileSync(testManifestJsonFilename, manifest, { spaces: 2 });
    try {
        await addon_manager_1.default.loadAddon('test-adapter');
    }
    catch (err) {
        return err;
    }
}
describe('addons', () => {
    let jwt;
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    afterEach(async () => {
        if (fs_1.default.existsSync(destLicense)) {
            fs_1.default.unlinkSync(destLicense);
        }
    });
    it('Get the add-on list', async () => {
        try {
            await addon_manager_1.default.loadAddon('settings-adapter');
        }
        catch (_e) {
            console.error(_e);
            // pass intentionally
        }
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('description');
    });
    it('Toggle a non-existent add-on', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.ADDONS_PATH}/nonexistent-adapter`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ enabled: true });
        expect(err.status).toEqual(400);
    });
    it('Toggle an add-on', async () => {
        try {
            await addon_manager_1.default.loadAddon('settings-adapter');
        }
        catch (_e) {
            console.error(_e);
            // pass intentionally
        }
        // Toggle on
        const res1 = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.ADDONS_PATH}/settings-adapter`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ enabled: true });
        expect(res1.status).toEqual(200);
        // Get status
        const res2 = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res2.status).toEqual(200);
        let addonConfig1;
        for (const cfg of res2.body) {
            if (cfg.id == 'settings-adapter') {
                addonConfig1 = cfg;
                break;
            }
        }
        expect(addonConfig1).toHaveProperty('enabled');
        expect(addonConfig1.enabled).toBe(true);
        // wait a few seconds for the add-on to fully load before toggling again
        await (0, sleep_1.default)(3000);
        // Toggle off
        const res3 = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.ADDONS_PATH}/settings-adapter`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ enabled: false });
        expect(res3.status).toEqual(200);
        // Get status
        const res4 = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res4.status).toEqual(200);
        let addonConfig2;
        for (const cfg of res4.body) {
            if (cfg.id == 'settings-adapter') {
                addonConfig2 = cfg;
                break;
            }
        }
        expect(addonConfig2).toHaveProperty('enabled');
        expect(addonConfig2.enabled).toBe(false);
    });
    it('Fail to get license for non-existent add-on', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ADDONS_PATH}/fake-adapter/license`)
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
    it('Fail to get non-existent add-on license', async () => {
        try {
            await addon_manager_1.default.loadAddon('settings-adapter');
        }
        catch (_e) {
            console.error(_e);
            // pass intentionally
        }
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ADDONS_PATH}/settings-adapter/license`)
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
    it('Get add-on license', async () => {
        fs_1.default.copyFileSync(sourceLicense, destLicense);
        try {
            await addon_manager_1.default.loadAddon('settings-adapter');
        }
        catch (_e) {
            console.error(_e);
            // pass intentionally
        }
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ADDONS_PATH}/settings-adapter/license`)
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.text.startsWith('Mozilla Public License')).toBeTruthy();
    });
    it('Install an invalid add-on', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .post(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ id: 'nonexistent-adapter' });
        expect(err.status).toEqual(400);
    });
    it('Install an add-on with an invalid checksum', async () => {
        const res1 = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res1.status).toEqual(200);
        expect(Array.isArray(res1.body)).toBe(true);
        expect(res1.body.filter((a) => a.id === 'example-adapter').length).toEqual(0);
        const res2 = await (0, node_fetch_1.default)(addonUrl, { headers: { Accept: 'application/json' } });
        const list = await res2.json();
        expect(Array.isArray(list)).toBe(true);
        const addon = list.find((a) => a.id === 'example-adapter');
        expect(addon).toHaveProperty('id');
        expect(addon).toHaveProperty('name');
        expect(addon).toHaveProperty('description');
        expect(addon).toHaveProperty('author');
        expect(addon).toHaveProperty('homepage_url');
        expect(addon).toHaveProperty('url');
        expect(addon).toHaveProperty('version');
        expect(addon).toHaveProperty('checksum');
        const res3 = await common_1.chai
            .request(common_1.server)
            .post(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ id: addon.id, url: addon.url, checksum: 'invalid' });
        expect(res3.status).toEqual(400);
    });
    it('Install an add-on', async () => {
        const res1 = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res1.status).toEqual(200);
        expect(Array.isArray(res1.body)).toBe(true);
        expect(res1.body.filter((a) => a.id === 'example-adapter').length).toEqual(0);
        const res2 = await (0, node_fetch_1.default)(addonUrl, { headers: { Accept: 'application/json' } });
        const list = await res2.json();
        expect(Array.isArray(list)).toBe(true);
        const addon = list.find((a) => a.id === 'example-adapter');
        expect(addon).toHaveProperty('id');
        expect(addon).toHaveProperty('name');
        expect(addon).toHaveProperty('description');
        expect(addon).toHaveProperty('author');
        expect(addon).toHaveProperty('homepage_url');
        expect(addon).toHaveProperty('url');
        expect(addon).toHaveProperty('version');
        expect(addon).toHaveProperty('checksum');
        const res3 = await common_1.chai
            .request(common_1.server)
            .post(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ id: addon.id, url: addon.url, checksum: addon.checksum });
        expect(res3.status).toEqual(200);
        const res4 = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res4.status).toEqual(200);
        expect(Array.isArray(res4.body)).toBe(true);
        expect(res4.body.filter((a) => a.id === 'example-adapter').length).toEqual(1);
    });
    it('Uninstall an add-on', async () => {
        try {
            await addon_manager_1.default.loadAddon('example-adapter');
        }
        catch (_e) {
            console.error(_e);
            // pass intentionally
        }
        const res1 = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res1.status).toEqual(200);
        expect(Array.isArray(res1.body)).toBe(true);
        expect(res1.body.filter((a) => a.id === 'example-adapter').length).toEqual(1);
        const res2 = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.ADDONS_PATH}/example-adapter`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res2.status).toEqual(204);
        const res3 = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADDONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res3.status).toEqual(200);
        expect(Array.isArray(res3.body)).toBe(true);
        expect(res3.body.filter((a) => a.id === 'example-adapter').length).toEqual(0);
    });
    it('Validate valid manifest.json loads fine', async () => {
        const err = await loadSettingsAdapterWithManifestJson(testManifestJson);
        expect(err).toBeUndefined();
    });
    it('Fail manifest.json with missing author key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.author;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing description key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.description;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing gateway_specific_settings key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.gateway_specific_settings;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing webthings key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.gateway_specific_settings.webthings;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing primary_type key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete (manifest.gateway_specific_settings.webthings).primary_type;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with wrong gateway min version', async () => {
        const manifest = copyManifest(testManifestJson);
        (manifest.gateway_specific_settings.webthings).strict_min_version = semver_1.default.inc(package_json_1.default.version, 'minor');
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with wrong gateway max version', async () => {
        const manifest = copyManifest(testManifestJson);
        (manifest.gateway_specific_settings.webthings).strict_max_version = `0.${package_json_1.default.version}`;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing homepage_url key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.homepage_url;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing id key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.id;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing license key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.license;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing manifest_version key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.manifest_version;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with incorrect manifest_version key', async () => {
        const manifest = copyManifest(testManifestJson);
        manifest.manifest_version = 0;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing name key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.name;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
    it('Fail manifest.json with missing version key', async () => {
        const manifest = copyManifest(testManifestJson);
        delete manifest.version;
        expect(await loadSettingsAdapterWithManifestJson(manifest)).toBeTruthy();
    });
});
//# sourceMappingURL=addons-test.js.map