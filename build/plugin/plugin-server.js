"use strict";
/**
 * @module PluginServer
 *
 * Takes care of the gateway side of adapter plugins. There is
 * only a single instance of the PluginServer for the entire gateway.
 * There will be an AdapterProxy instance for each adapter plugin.
 */
/**
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
const config_1 = __importDefault(require("config"));
const events_1 = require("events");
const gateway_addon_1 = require("gateway-addon");
const Settings = __importStar(require("../models/settings"));
const user_profile_1 = __importDefault(require("../user-profile"));
const package_json_1 = __importDefault(require("../package.json"));
const plugin_1 = __importDefault(require("./plugin"));
const MessageType = gateway_addon_1.Constants.MessageType;
class PluginServer extends events_1.EventEmitter {
    constructor(addonManager, { verbose } = {}) {
        super();
        this.manager = addonManager;
        this.verbose = verbose;
        this.plugins = new Map();
        this.ipcSocket = new gateway_addon_1.IpcSocket(true, config_1.default.get('ports.ipc'), this.onMsg.bind(this), 'IpcSocket(plugin-server)', { verbose: this.verbose });
    }
    getAddonManager() {
        return this.manager;
    }
    /**
     * @method onMsg
     *
     * Called when the plugin server receives an adapter manager IPC message
     * from a plugin. This particular IPC channel is only used to register
     * plugins. Each plugin will get its own IPC channel once its registered.
     */
    onMsg(msg, ws) {
        this.verbose && console.log('PluginServer: Rcvd:', msg);
        if (msg.messageType === MessageType.PLUGIN_REGISTER_REQUEST) {
            const plugin = this.registerPlugin(msg.data.pluginId);
            plugin.setWebSocket(ws);
            let language = 'en-US';
            const units = {
                temperature: 'degree celsius',
            };
            Settings.getSetting('localization.language')
                .then((lang) => {
                if (lang) {
                    language = lang;
                }
                return Settings.getSetting('localization.units.temperature');
            })
                .then((temp) => {
                if (temp) {
                    units.temperature = temp;
                }
                return Promise.resolve();
            })
                .catch(() => {
                return Promise.resolve();
            })
                .then(() => {
                ws.send(JSON.stringify({
                    messageType: MessageType.PLUGIN_REGISTER_RESPONSE,
                    data: {
                        pluginId: msg.data.pluginId,
                        gatewayVersion: package_json_1.default.version,
                        userProfile: {
                            addonsDir: user_profile_1.default.addonsDir,
                            baseDir: user_profile_1.default.baseDir,
                            configDir: user_profile_1.default.configDir,
                            dataDir: user_profile_1.default.dataDir,
                            mediaDir: user_profile_1.default.mediaDir,
                            logDir: user_profile_1.default.logDir,
                            gatewayDir: user_profile_1.default.gatewayDir,
                        },
                        preferences: {
                            language,
                            units,
                        },
                    },
                }));
            });
        }
        else if (msg.data.pluginId) {
            const plugin = this.getPlugin(msg.data.pluginId);
            if (plugin) {
                plugin.onMsg(msg);
            }
        }
    }
    /**
     * @method getPlugin
     *
     * Returns a previously loaded plugin instance.
     */
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    /**
     * @method loadPlugin
     *
     * Loads a plugin by launching a separate process.
     */
    loadPlugin(pluginPath, id, exec) {
        const plugin = this.registerPlugin(id);
        plugin.setExec(exec);
        plugin.setExecPath(pluginPath);
        return plugin.start();
    }
    /**
     * @method registerPlugin
     *
     * Called when the plugin server receives a register plugin message
     * via IPC.
     */
    registerPlugin(pluginId) {
        let plugin = this.plugins.get(pluginId);
        if (plugin) {
            // This is a plugin that we already know about.
        }
        else {
            // We haven't seen this plugin before.
            plugin = new plugin_1.default(pluginId, this.manager, this);
            this.plugins.set(pluginId, plugin);
        }
        return plugin;
    }
    /**
     * @method unregisterPlugin
     *
     * Called when the plugin sends a plugin-unloaded message.
     */
    unregisterPlugin(pluginId) {
        this.plugins.delete(pluginId);
    }
    shutdown() {
        this.ipcSocket.close();
    }
}
exports.default = PluginServer;
//# sourceMappingURL=plugin-server.js.map