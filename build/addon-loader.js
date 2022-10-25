"use strict";
/*
 * Add-on Loader app.
 *
 * This app will load an add-on as a standalone process.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
const addon_utils_1 = require("./addon-utils");
const config_1 = __importDefault(require("config"));
const node_getopt_1 = __importDefault(require("node-getopt"));
const gateway_addon_1 = require("gateway-addon");
const db_1 = __importDefault(require("./db"));
const Settings = __importStar(require("./models/settings"));
const sleep_1 = __importDefault(require("./sleep"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
// Open the database.
if (process.env.NODE_ENV !== 'test') {
    // In test mode, we have a flag set to remove the database when it's opened.
    // Therefore, we need to manually load settings and such, rather than using
    // the normal db functions, in order to prevent removing the already open
    // database.
    db_1.default.open();
}
async function loadAddon(addonPath, verbose) {
    const packageName = path_1.default.basename(addonPath);
    // Get any saved settings for this add-on.
    const key = `addons.${packageName}`;
    const configKey = `addons.config.${packageName}`;
    let obj;
    let savedConfig = null;
    if (process.env.NODE_ENV === 'test') {
        [obj, savedConfig] = (0, addon_utils_1.loadManifest)(addonPath.split('/').pop());
    }
    else {
        obj = await Settings.getSetting(key);
    }
    const moziot = {
        exec: obj.exec,
    };
    if (obj.schema) {
        moziot.schema = obj.schema;
    }
    if (process.env.NODE_ENV !== 'test') {
        savedConfig = await Settings.getSetting(configKey);
    }
    if (savedConfig) {
        moziot.config = savedConfig;
    }
    else {
        moziot.config = {};
    }
    const newSettings = {
        get name() {
            console.warn('The `manifest` object is deprecated and will be removed soon.', 'Instead of using `manifest.name`,', 'please read the `id` field from your manifest.json instead.');
            return obj.id;
        },
        get display_name() {
            console.warn('The `manifest` object is deprecated and will be removed soon.', 'Instead of using `manifest.display_name`,', 'please read the `name` field from your manifest.json instead.');
            return obj.name;
        },
        get moziot() {
            console.warn('The `manifest` object is deprecated and will be removed soon.', 'Instead of using `manifest.moziot`,', 'please read the user configuration with the `Database` class instead.');
            return moziot;
        },
    };
    const pluginClient = new gateway_addon_1.PluginClient(packageName, { verbose });
    return pluginClient
        .register(config_1.default.get('ports.ipc'))
        .catch((e) => {
        throw new Error(`Failed to register add-on ${packageName} with gateway: ${e}`);
    })
        .then((addonManagerProxy) => {
        if (!(addonManagerProxy instanceof gateway_addon_1.AddonManagerProxy)) {
            console.error(`Failed to load add-on ${packageName}`);
            process.exit(gateway_addon_1.Constants.DONT_RESTART_EXIT_CODE);
        }
        console.log(`Loading add-on ${packageName} from ${addonPath}`);
        try {
            // we try to link to a global gateway-addon module, because in some
            // cases, NODE_PATH seems to not work
            const modulePath = path_1.default.join(addonPath, 'node_modules', 'gateway-addon');
            if (!fs_1.default.existsSync(modulePath) && process.env.NODE_ENV !== 'test') {
                const link = (0, child_process_1.spawnSync)('npm', ['link', 'gateway-addon'], {
                    cwd: addonPath,
                });
                if (link.error) {
                    console.log(`Failed to npm-link the gateway-addon package: ${link.error}`);
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            let addonLoader = require(addonPath);
            if (addonLoader.hasOwnProperty('default')) {
                addonLoader = addonLoader.default;
            }
            addonLoader(addonManagerProxy, newSettings, (packageName, err) => {
                console.error(`Failed to start add-on ${packageName}:`, err);
                fail(addonManagerProxy, `Failed to start add-on ${obj.name}: ${err}`);
            });
            pluginClient.on('unloaded', () => {
                (0, sleep_1.default)(500).then(() => process.exit(0));
            });
        }
        catch (e) {
            console.error(e);
            const message = `Failed to start add-on ${obj.name}: ${e
                .toString()
                .replace(/^Error:\s+/, '')}`;
            fail(addonManagerProxy, message);
        }
    });
}
async function fail(addonManagerProxy, message) {
    addonManagerProxy.sendError(message);
    await (0, sleep_1.default)(200);
    addonManagerProxy.unloadPlugin();
    await (0, sleep_1.default)(200);
    process.exit(gateway_addon_1.Constants.DONT_RESTART_EXIT_CODE);
}
// Get some decent error messages for unhandled rejections. This is
// often just errors in the code.
process.on('unhandledRejection', (reason) => {
    console.log('Unhandled Rejection');
    console.error(reason);
});
// Command line arguments
const getopt = new node_getopt_1.default([
    ['h', 'help', 'Display help'],
    ['v', 'verbose', 'Show verbose output'],
]);
const opt = getopt.parseSystem();
if (opt.options.verbose) {
    console.log(opt);
}
if (opt.options.help) {
    getopt.showHelp();
    process.exit(gateway_addon_1.Constants.DONT_RESTART_EXIT_CODE);
}
if (opt.argv.length != 1) {
    console.error('Expecting a single package to load');
    process.exit(gateway_addon_1.Constants.DONT_RESTART_EXIT_CODE);
}
const addonPath = opt.argv[0];
loadAddon(addonPath, !!opt.options.verbose).catch((err) => {
    console.error(err);
    process.exit(gateway_addon_1.Constants.DONT_RESTART_EXIT_CODE);
});
//# sourceMappingURL=addon-loader.js.map