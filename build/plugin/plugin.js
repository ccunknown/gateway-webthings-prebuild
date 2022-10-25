"use strict";
/**
 * @module Plugin
 *
 * Object created for each plugin that the gateway talks to.
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
const adapter_proxy_1 = __importDefault(require("./adapter-proxy"));
const api_handler_proxy_1 = __importDefault(require("./api-handler-proxy"));
const Constants = __importStar(require("../constants"));
const device_proxy_1 = __importDefault(require("./device-proxy"));
const string_format_1 = __importDefault(require("string-format"));
const notifier_proxy_1 = __importDefault(require("./notifier-proxy"));
const outlet_proxy_1 = __importDefault(require("./outlet-proxy"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const Settings = __importStar(require("../models/settings"));
const child_process_1 = require("child_process");
const things_1 = __importDefault(require("../models/things"));
const user_profile_1 = __importDefault(require("../user-profile"));
const gateway_addon_1 = require("gateway-addon");
const MessageType = gateway_addon_1.Constants.MessageType;
const DEBUG = false;
class Plugin {
    constructor(pluginId, addonManager, pluginServer, forceEnable = false) {
        this.pluginId = pluginId;
        this.addonManager = addonManager;
        this.pluginServer = pluginServer;
        this.forceEnable = forceEnable;
        this.adapters = new Map();
        this.notifiers = new Map();
        this.apiHandlers = new Map();
        this.exec = '';
        this.execPath = '.';
        // Make this a nested object such that if the Plugin object is reused,
        // i.e. the plugin is disabled and quickly re-enabled, the gateway process
        // can maintain a proper reference to the process object.
        this.process = { p: null };
        this.restart = true;
        this.restartDelay = 0;
        this.lastRestart = 0;
        this.pendingRestart = null;
        this.unloadCompletedPromise = null;
        this.nextId = 0;
        this.requestActionPromises = new Map();
        this.removeActionPromises = new Map();
        this.setPinPromises = new Map();
        this.setCredentialsPromises = new Map();
        this.notifyPromises = new Map();
        this.apiRequestPromises = new Map();
        this.unloding = false;
        this.logPrefix = pluginId;
    }
    getProcess() {
        return this.process;
    }
    getStartPromise() {
        return this.startPromise;
    }
    setExec(exec) {
        this.exec = exec;
    }
    setExecPath(execPath) {
        this.execPath = execPath;
    }
    setRestart(restart) {
        this.restart = restart;
    }
    setWebSocket(ws) {
        this.ws = ws;
    }
    asDict() {
        let pid = 'not running';
        if (this.process.p) {
            pid = this.process.p.pid;
        }
        return {
            pluginId: this.pluginId,
            adapters: Array.from(this.adapters.values()).map((adapter) => {
                return adapter.asDict();
            }),
            notifiers: Array.from(this.notifiers.values()).map((notifier) => {
                return notifier.asDict();
            }),
            exec: this.exec,
            pid,
        };
    }
    onMsg(msg) {
        DEBUG && console.log('Plugin: Rcvd Msg', msg);
        // The first switch manages action method resolved or rejected messages.
        switch (msg.messageType) {
            case MessageType.DEVICE_REQUEST_ACTION_RESPONSE: {
                const actionId = msg.data.actionId;
                const deferred = this.requestActionPromises.get(actionId);
                if (typeof actionId === 'undefined' || typeof deferred === 'undefined') {
                    console.error('Plugin:', this.pluginId, 'Unrecognized action id:', actionId, 'Ignoring msg:', msg);
                    return;
                }
                if (msg.data.success) {
                    deferred.resolve();
                }
                else {
                    deferred.reject();
                }
                this.requestActionPromises.delete(actionId);
                return;
            }
            case MessageType.DEVICE_REMOVE_ACTION_RESPONSE: {
                const messageId = msg.data.messageId;
                const deferred = this.removeActionPromises.get(messageId);
                if (typeof messageId === 'undefined' || typeof deferred === 'undefined') {
                    console.error('Plugin:', this.pluginId, 'Unrecognized message id:', messageId, 'Ignoring msg:', msg);
                    return;
                }
                if (msg.data.success) {
                    deferred.resolve();
                }
                else {
                    deferred.reject();
                }
                this.removeActionPromises.delete(messageId);
                return;
            }
            case MessageType.OUTLET_NOTIFY_RESPONSE: {
                const messageId = msg.data.messageId;
                const deferred = this.notifyPromises.get(messageId);
                if (typeof messageId === 'undefined' || typeof deferred === 'undefined') {
                    console.error('Plugin:', this.pluginId, 'Unrecognized message id:', messageId, 'Ignoring msg:', msg);
                    return;
                }
                if (msg.data.success) {
                    deferred.resolve();
                }
                else {
                    deferred.reject();
                }
                this.notifyPromises.delete(messageId);
                return;
            }
            case MessageType.DEVICE_SET_PIN_RESPONSE: {
                const data = msg.data;
                const messageId = data.messageId;
                const deferred = this.setPinPromises.get(messageId);
                if (typeof messageId === 'undefined' || typeof deferred === 'undefined') {
                    console.error('Plugin:', this.pluginId, 'Unrecognized message id:', messageId, 'Ignoring msg:', msg);
                    return;
                }
                const adapter = this.adapters.get(data.adapterId);
                if (adapter && data.success && data.device) {
                    const deviceId = data.device.id;
                    const device = new device_proxy_1.default(adapter, data.device);
                    adapter.getDevices()[deviceId] = device;
                    adapter.getManager().getDevices()[deviceId] = device;
                    deferred.resolve(msg.data.device);
                }
                else {
                    deferred.reject();
                }
                this.setPinPromises.delete(messageId);
                return;
            }
            case MessageType.DEVICE_SET_CREDENTIALS_RESPONSE: {
                const data = msg.data;
                const messageId = data.messageId;
                const deferred = this.setCredentialsPromises.get(messageId);
                if (typeof messageId === 'undefined' || typeof deferred === 'undefined') {
                    console.error('Plugin:', this.pluginId, 'Unrecognized message id:', messageId, 'Ignoring msg:', msg);
                    return;
                }
                const adapter = this.adapters.get(data.adapterId);
                if (adapter && data.device && data.success) {
                    const deviceId = data.device.id;
                    const device = new device_proxy_1.default(adapter, data.device);
                    adapter.getDevices()[deviceId] = device;
                    adapter.getManager().getDevices()[deviceId] = device;
                    deferred.resolve(msg.data.device);
                }
                else {
                    deferred.reject();
                }
                this.setCredentialsPromises.delete(messageId);
                return;
            }
            case MessageType.API_HANDLER_API_RESPONSE: {
                const data = msg.data;
                const messageId = data.messageId;
                const deferred = this.apiRequestPromises.get(messageId);
                if (typeof messageId === 'undefined' || typeof deferred === 'undefined') {
                    console.error('Plugin:', this.pluginId, 'Unrecognized message id:', messageId, 'Ignoring msg:', msg);
                    return;
                }
                deferred.resolve(data.response);
                this.apiRequestPromises.delete(messageId);
                return;
            }
        }
        // The second switch manages plugin level messages.
        switch (msg.messageType) {
            case MessageType.ADAPTER_ADDED_NOTIFICATION: {
                const data = msg.data;
                if (this.unloding) {
                    console.warn('Adapter', data.adapterId, 'added during unloading');
                    return;
                }
                const adapter = new adapter_proxy_1.default(this.addonManager, data.adapterId, data.name, data.packageName, this);
                this.adapters.set(data.adapterId, adapter);
                this.addonManager.addAdapter(adapter);
                // Tell the adapter about all saved things
                const send = (thing) => {
                    adapter.sendMsg(MessageType.DEVICE_SAVED_NOTIFICATION, {
                        deviceId: thing.getId(),
                        device: thing.getDescription(),
                    });
                };
                adapter.getEventHandlers()[Constants.THING_ADDED] = send;
                things_1.default.getThings().then((things) => {
                    things.forEach(send);
                });
                things_1.default.on(Constants.THING_ADDED, send);
                return;
            }
            case MessageType.NOTIFIER_ADDED_NOTIFICATION: {
                const data = msg.data;
                const notifier = new notifier_proxy_1.default(this.addonManager, data.notifierId, data.name, data.packageName, this);
                this.notifiers.set(data.notifierId, notifier);
                this.addonManager.addNotifier(notifier);
                return;
            }
            case MessageType.API_HANDLER_ADDED_NOTIFICATION: {
                const data = msg.data;
                const apiHandler = new api_handler_proxy_1.default(this.addonManager, data.packageName, this);
                this.apiHandlers.set(data.packageName, apiHandler);
                this.addonManager.addAPIHandler(apiHandler);
                return;
            }
            case MessageType.API_HANDLER_UNLOAD_RESPONSE: {
                const data = msg.data;
                const packageName = data.packageName;
                const handler = this.apiHandlers.get(packageName);
                if (!handler) {
                    console.error('Plugin:', this.pluginId, 'Unrecognized API handler:', packageName, 'Ignoring msg:', msg);
                    return;
                }
                this.apiHandlers.delete(packageName);
                if (this.adapters.size === 0 && this.notifiers.size === 0 && this.apiHandlers.size === 0) {
                    // We've unloaded everything for the plugin, now unload the plugin.
                    this.unload();
                    this.unloadCompletedPromise = handler.unloadCompletedPromise;
                    handler.unloadCompletedPromise = null;
                }
                else if (handler.unloadCompletedPromise) {
                    handler.unloadCompletedPromise.resolve();
                    handler.unloadCompletedPromise = null;
                }
                return;
            }
            case MessageType.PLUGIN_UNLOAD_RESPONSE:
                this.shutdown();
                this.pluginServer.unregisterPlugin(msg.data.pluginId);
                if (this.unloadCompletedPromise) {
                    this.unloadCompletedPromise.resolve();
                    this.unloadCompletedPromise = null;
                }
                return;
            case MessageType.PLUGIN_ERROR_NOTIFICATION:
                this.pluginServer.emit('log', {
                    severity: Constants.LogSeverity.ERROR,
                    message: msg.data.message,
                });
                return;
        }
        // The next switch deals with adapter level messages
        const adapterId = msg.data.adapterId;
        const adapter = this.adapters.get(adapterId);
        if (adapterId && !adapter) {
            console.error('Plugin:', this.pluginId, 'Unrecognized adapter:', adapterId, 'Ignoring msg:', msg);
            return;
        }
        const notifierId = msg.data.notifierId;
        const notifier = this.notifiers.get(notifierId);
        if (notifierId && !notifier) {
            console.error('Plugin:', this.pluginId, 'Unrecognized notifier:', notifierId, 'Ignoring msg:', msg);
            return;
        }
        let device;
        let outlet;
        let property;
        let deferredMock;
        switch (msg.messageType) {
            case MessageType.ADAPTER_UNLOAD_RESPONSE: {
                const handler = adapter.getEventHandlers()[Constants.THING_ADDED];
                if (handler) {
                    things_1.default.removeListener(Constants.THING_ADDED, handler);
                }
                this.adapters.delete(adapterId);
                if (this.adapters.size === 0 && this.notifiers.size === 0 && this.apiHandlers.size === 0) {
                    // We've unloaded everything for the plugin, now unload the plugin.
                    // We may need to reevaluate this, and only auto-unload
                    // the plugin for the MockAdapter. For plugins which
                    // support hot-swappable dongles (like zwave/zigbee) it makes
                    // sense to have a plugin loaded with no adapters present.
                    this.unload();
                    this.unloadCompletedPromise = adapter.unloadCompletedPromise;
                    adapter.unloadCompletedPromise = null;
                }
                else if (adapter.unloadCompletedPromise) {
                    adapter.unloadCompletedPromise.resolve();
                    adapter.unloadCompletedPromise = null;
                }
                break;
            }
            case MessageType.NOTIFIER_UNLOAD_RESPONSE:
                this.notifiers.delete(notifierId);
                if (this.adapters.size === 0 && this.notifiers.size === 0 && this.apiHandlers.size === 0) {
                    // We've unloaded everything for the plugin, now unload the plugin.
                    this.unload();
                    this.unloadCompletedPromise = notifier.unloadCompletedPromise;
                    notifier.unloadCompletedPromise = null;
                }
                else if (notifier.unloadCompletedPromise) {
                    notifier.unloadCompletedPromise.resolve();
                    notifier.unloadCompletedPromise = null;
                }
                break;
            case MessageType.DEVICE_ADDED_NOTIFICATION: {
                const data = msg.data;
                device = new device_proxy_1.default(adapter, data.device);
                adapter.handleDeviceAdded(device);
                break;
            }
            case MessageType.ADAPTER_REMOVE_DEVICE_RESPONSE: {
                const data = msg.data;
                device = adapter.getDevice(data.deviceId);
                if (device) {
                    adapter.handleDeviceRemoved(device);
                }
                break;
            }
            case MessageType.OUTLET_ADDED_NOTIFICATION: {
                const data = msg.data;
                outlet = new outlet_proxy_1.default(notifier, data.outlet);
                notifier.handleOutletAdded(outlet);
                break;
            }
            case MessageType.OUTLET_REMOVED_NOTIFICATION: {
                const data = msg.data;
                outlet = notifier.getOutlet(data.outletId);
                if (outlet) {
                    notifier.handleOutletRemoved(outlet);
                }
                break;
            }
            case MessageType.DEVICE_PROPERTY_CHANGED_NOTIFICATION: {
                const data = msg.data;
                device = adapter.getDevice(data.deviceId);
                if (device && data.property.name) {
                    property = device.findProperty(data.property.name);
                    if (property) {
                        property.doPropertyChanged(data.property);
                        device.notifyPropertyChanged(property);
                    }
                }
                break;
            }
            case MessageType.DEVICE_ACTION_STATUS_NOTIFICATION: {
                const data = msg.data;
                device = adapter.getDevice(data.deviceId);
                if (device) {
                    // This is some inappropriate casting, but is necessary to work with the gateway-addon
                    // bindings.
                    device.actionNotify(data.action);
                }
                break;
            }
            case MessageType.DEVICE_EVENT_NOTIFICATION: {
                const data = msg.data;
                device = adapter.getDevice(data.deviceId);
                if (device) {
                    // This is some inappropriate casting, but is necessary to work with the gateway-addon
                    // bindings.
                    device.eventNotify(data.event);
                }
                break;
            }
            case MessageType.DEVICE_CONNECTED_STATE_NOTIFICATION: {
                const data = msg.data;
                device = adapter.getDevice(data.deviceId);
                if (device) {
                    device.connectedNotify(data.connected);
                }
                break;
            }
            case MessageType.ADAPTER_PAIRING_PROMPT_NOTIFICATION: {
                const data = msg.data;
                let message = `${adapter.getName()}: `;
                if (data.deviceId) {
                    device = adapter.getDevice(data.deviceId);
                    message += `(${device.getTitle()}): `;
                }
                message += data.prompt;
                const log = {
                    severity: Constants.LogSeverity.PROMPT,
                    message,
                };
                if (msg.data.hasOwnProperty('url')) {
                    log.url = data.url;
                }
                this.pluginServer.emit('log', log);
                return;
            }
            case MessageType.ADAPTER_UNPAIRING_PROMPT_NOTIFICATION: {
                const data = msg.data;
                let message = `${adapter.getName()}`;
                if (data.deviceId) {
                    device = adapter.getDevice(data.deviceId);
                    message += ` (${device.getTitle()})`;
                }
                message += `: ${data.prompt}`;
                const log = {
                    severity: Constants.LogSeverity.PROMPT,
                    message,
                };
                if (msg.data.hasOwnProperty('url')) {
                    log.url = data.url;
                }
                this.pluginServer.emit('log', log);
                return;
            }
            case MessageType.MOCK_ADAPTER_CLEAR_STATE_RESPONSE:
                deferredMock = adapter.deferredMock;
                if (!deferredMock) {
                    console.error('mockAdapterStateCleared: No deferredMock');
                }
                else {
                    adapter.deferredMock = null;
                    deferredMock.resolve();
                }
                break;
            case MessageType.MOCK_ADAPTER_ADD_DEVICE_RESPONSE:
            case MessageType.MOCK_ADAPTER_REMOVE_DEVICE_RESPONSE:
                deferredMock = adapter.deferredMock;
                if (!deferredMock) {
                    console.error('mockDeviceAddedRemoved: No deferredMock');
                }
                else if (msg.data.success) {
                    device = deferredMock.device;
                    adapter.deferredMock = null;
                    deferredMock.device = null;
                    deferredMock.resolve(device);
                }
                else {
                    adapter.deferredMock = null;
                    deferredMock.reject(msg.data.error);
                }
                break;
            default:
                console.error('Plugin: unrecognized msg:', msg);
                break;
        }
    }
    /**
     * Generate an ID for a message.
     *
     * @returns {integer} An id.
     */
    generateMsgId() {
        return ++this.nextId;
    }
    sendMsg(methodType, data, deferred) {
        var _a;
        data.pluginId = this.pluginId;
        // Methods which could fail should await result.
        if (typeof deferred !== 'undefined') {
            switch (methodType) {
                case MessageType.DEVICE_REQUEST_ACTION_REQUEST: {
                    this.requestActionPromises.set(data.actionId, deferred);
                    break;
                }
                case MessageType.DEVICE_REMOVE_ACTION_REQUEST: {
                    // removeAction needs ID which is per message, because it
                    // can be called while waiting rejected or resolved.
                    data.messageId = this.generateMsgId();
                    this.removeActionPromises.set(data.messageId, deferred);
                    break;
                }
                case MessageType.OUTLET_NOTIFY_REQUEST: {
                    data.messageId = this.generateMsgId();
                    this.notifyPromises.set(data.messageId, deferred);
                    break;
                }
                case MessageType.DEVICE_SET_PIN_REQUEST: {
                    // removeAction needs ID which is per message, because it
                    // can be called while waiting rejected or resolved.
                    data.messageId = this.generateMsgId();
                    this.setPinPromises.set(data.messageId, deferred);
                    break;
                }
                case MessageType.DEVICE_SET_CREDENTIALS_REQUEST: {
                    // removeAction needs ID which is per message, because it
                    // can be called while waiting rejected or resolved.
                    data.messageId = this.generateMsgId();
                    this.setCredentialsPromises.set(data.messageId, deferred);
                    break;
                }
                case MessageType.API_HANDLER_API_REQUEST: {
                    data.messageId = this.generateMsgId();
                    this.apiRequestPromises.set(data.messageId, deferred);
                    break;
                }
                default:
                    break;
            }
        }
        const msg = {
            messageType: methodType,
            data: data,
        };
        DEBUG && console.log('Plugin: sendMsg:', msg);
        return (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(msg));
    }
    /**
     * Does cleanup required to allow the test suite to complete cleanly.
     */
    shutdown() {
        if (this.pendingRestart) {
            clearTimeout(this.pendingRestart);
        }
        this.restart = false;
        this.requestActionPromises.forEach((promise, key) => {
            promise.reject();
            this.requestActionPromises.delete(key);
        });
        this.removeActionPromises.forEach((promise, key) => {
            promise.reject();
            this.removeActionPromises.delete(key);
        });
        this.setPinPromises.forEach((promise, key) => {
            promise.reject();
            this.setPinPromises.delete(key);
        });
        this.setCredentialsPromises.forEach((promise, key) => {
            promise.reject();
            this.setCredentialsPromises.delete(key);
        });
        this.notifyPromises.forEach((promise, key) => {
            promise.reject();
            this.notifyPromises.delete(key);
        });
        this.apiRequestPromises.forEach((promise, key) => {
            promise.reject();
            this.apiRequestPromises.delete(key);
        });
    }
    start() {
        const key = `addons.${this.pluginId}`;
        this.startPromise = Settings.getSetting(key).then((savedSettings) => {
            if (!this.forceEnable &&
                (!savedSettings || !savedSettings.enabled)) {
                console.error(`Plugin ${this.pluginId} not enabled, so not starting.`);
                this.restart = false;
                this.process.p = null;
                return;
            }
            const execArgs = {
                nodeLoader: `node ${path_1.default.join(user_profile_1.default.gatewayDir, 'build', 'addon-loader.js')}`,
                name: this.pluginId,
                path: this.execPath,
            };
            const execCmd = (0, string_format_1.default)(this.exec, execArgs);
            DEBUG && console.log('  Launching:', execCmd);
            // If we need embedded spaces, then consider changing to use the npm
            // module called splitargs
            this.restart = true;
            const args = execCmd.split(' ');
            this.process.p = (0, child_process_1.spawn)(args[0], args.slice(1), {
                env: Object.assign(process.env, {
                    WEBTHINGS_HOME: user_profile_1.default.baseDir,
                    NODE_PATH: path_1.default.join(user_profile_1.default.gatewayDir, 'node_modules'),
                }),
            });
            this.process.p.on('error', (err) => {
                // We failed to spawn the process. This most likely means that the
                // exec string is malformed somehow. Report the error but don't try
                // restarting.
                this.restart = false;
                console.error('Failed to start plugin', this.pluginId);
                console.error('Command:', this.exec);
                console.error(err);
            });
            this.stdoutReadline = readline_1.default.createInterface({
                input: this.process.p.stdout,
            });
            this.stdoutReadline.on('line', (line) => {
                console.log(`${this.logPrefix}: ${line}`);
            });
            this.stderrReadline = readline_1.default.createInterface({
                input: this.process.p.stderr,
            });
            this.stderrReadline.on('line', (line) => {
                console.error(`${this.logPrefix}: ${line}`);
            });
            this.process.p.on('exit', (code) => {
                if (this.restart) {
                    if (code == gateway_addon_1.Constants.DONT_RESTART_EXIT_CODE) {
                        console.log('Plugin:', this.pluginId, 'died, code =', code, 'NOT restarting...');
                        this.restart = false;
                        this.process.p = null;
                    }
                    else {
                        if (this.pendingRestart) {
                            return;
                        }
                        if (this.restartDelay < 30 * 1000) {
                            this.restartDelay += 1000;
                        }
                        if (this.lastRestart + 60 * 1000 < Date.now()) {
                            this.restartDelay = 0;
                        }
                        if (this.restartDelay > 30000) {
                            // If we've restarted 30 times in a row, this is probably just
                            // not going to work, so bail out.
                            console.log(`Giving up on restarting plugin ${this.pluginId}`);
                            this.restart = false;
                            this.process.p = null;
                            return;
                        }
                        console.log('Plugin:', this.pluginId, 'died, code =', code, 'restarting after', this.restartDelay);
                        const doRestart = () => {
                            if (this.restart) {
                                this.lastRestart = Date.now();
                                this.pendingRestart = null;
                                this.start();
                            }
                            else {
                                this.process.p = null;
                            }
                        };
                        if (this.restartDelay > 0) {
                            this.pendingRestart = setTimeout(doRestart, this.restartDelay);
                        }
                        else {
                            // Restart immediately so that test code can access
                            // process.p
                            doRestart();
                        }
                    }
                }
                else {
                    this.process.p = null;
                }
            });
        });
        return this.startPromise;
    }
    unload() {
        console.log('Unloading plugin', this.pluginId);
        this.restart = false;
        this.unloding = true;
        this.sendMsg(MessageType.PLUGIN_UNLOAD_REQUEST, {});
    }
    unloadComponents() {
        const adapters = Array.from(this.adapters.values());
        const notifiers = Array.from(this.notifiers.values());
        const apiHandlers = Array.from(this.apiHandlers.values());
        const unloadPromises = [];
        for (const adapter of this.adapters.values()) {
            console.log('Unloading', adapter.getName());
            this.addonManager.removeAdapter(adapter.getId());
            for (const device of Object.values(adapter.getDevices())) {
                this.addonManager.handleDeviceRemoved(device);
            }
            unloadPromises.push(adapter.unload());
        }
        for (const notifier of this.notifiers.values()) {
            console.log('Unloading', notifier.getName());
            this.addonManager.removeNotifier(notifier.getId());
            unloadPromises.push(notifier.unload());
            for (const device of Object.values(notifier.getOutlets())) {
                this.addonManager.handleOutletRemoved(device);
            }
        }
        for (const [id, apiHandler] of this.apiHandlers.entries()) {
            console.log('Unloading APIHandler');
            this.addonManager.removeApiHandler(id);
            unloadPromises.push(apiHandler.unload());
        }
        if (adapters.length === 0 && notifiers.length === 0 && apiHandlers.length === 0) {
            // If there are no adapters, notifiers, or API handlers, manually unload
            // the plugin, otherwise it will just restart. Note that if the addon is
            // disabled, then there might not be a plugin either.
            this.unload();
        }
        return Promise.all(unloadPromises).then();
    }
    kill() {
        var _a;
        if (this.process) {
            console.log(`Killing ${this.pluginId} plugin.`);
            (_a = this.process.p) === null || _a === void 0 ? void 0 : _a.kill();
        }
    }
}
exports.default = Plugin;
//# sourceMappingURL=plugin.js.map