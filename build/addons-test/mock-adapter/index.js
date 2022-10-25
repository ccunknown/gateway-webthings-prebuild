"use strict";
/**
 * mock-adapter.ts - Mock Adapter.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAdapter = void 0;
const gateway_addon_1 = require("gateway-addon");
const express_1 = __importDefault(require("express"));
const manifest_json_1 = __importDefault(require("./manifest.json"));
class MockProperty extends gateway_addon_1.Property {
    constructor(device, name, propertyDescription) {
        var _a;
        super(device, name, propertyDescription);
        if (propertyDescription.unit) {
            this.setUnit(propertyDescription.unit);
        }
        if (propertyDescription.description) {
            this.setDescription(propertyDescription.description);
        }
        this.setCachedValue((_a = propertyDescription.value) !== null && _a !== void 0 ? _a : null);
        this.getDevice().notifyPropertyChanged(this);
    }
    /**
     * @method setValue
     * @returns a promise which resolves to the updated value.
     *
     * @note it is possible that the updated value doesn't match
     * the value passed in.
     */
    setValue(value) {
        return new Promise((resolve, reject) => {
            if (/^rejectProperty/.test(this.getName())) {
                reject('Read-only property');
                return;
            }
            super
                .setValue(value)
                .then((updatedValue) => {
                resolve(updatedValue);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
class MockDevice extends gateway_addon_1.Device {
    constructor(adapter, id, deviceDescription) {
        super(adapter, id);
        this.setTitle(deviceDescription.title);
        this.setTypes(deviceDescription['@type']);
        this.setDescription(deviceDescription.description);
        this.setBaseHref(`http://127.0.0.1:${adapter.getPort()}`);
        for (const propertyName in deviceDescription.properties) {
            const propertyDescription = deviceDescription.properties[propertyName];
            const property = new MockProperty(this, propertyName, propertyDescription);
            this.addProperty(property);
        }
        for (const actionName in deviceDescription.actions) {
            this.addAction(actionName, deviceDescription.actions[actionName]);
        }
        for (const eventName in deviceDescription.events) {
            this.addEvent(eventName, deviceDescription.events[eventName]);
        }
    }
    requestAction(actionId, actionName, input) {
        if (actionName === 'rejectRequest') {
            return Promise.reject();
        }
        return super.requestAction(actionId, actionName, input);
    }
    removeAction(actionId, actionName) {
        if (actionName === 'rejectRemove') {
            return Promise.reject();
        }
        return super.removeAction(actionId, actionName);
    }
    performAction(action) {
        return new Promise((resolve, _reject) => {
            action.start();
            action.finish();
            resolve();
        });
    }
}
class MockAdapter extends gateway_addon_1.Adapter {
    constructor(addonManager, packageName) {
        super(addonManager, packageName, packageName);
        addonManager.addAdapter(this);
        this.pairDeviceId = null;
        this.pairDeviceDescription = null;
        this.port = 12345;
        this.app = (0, express_1.default)();
        this.app.all('/*', (req, rsp) => {
            rsp.send(`${req.method} ${req.path}`);
        });
        this.server = this.app.listen(this.port);
    }
    /**
     * For cleanup between tests. Returns a promise which resolves
     * when all of the state has been cleared.
     */
    clearState() {
        this.actions = {};
        return Promise.all(Object.keys(this.getDevices()).map((deviceId) => {
            return this.removeDevice(deviceId);
        }));
    }
    /**
     * Add a MockDevice to the MockAdapter
     *
     * @param {String} deviceId ID of the device to add.
     * @return {Promise} which resolves to the device added.
     */
    addDevice(deviceId, deviceDescription) {
        return new Promise((resolve, reject) => {
            if (deviceId in this.getDevices()) {
                reject(`Device: ${deviceId} already exists.`);
            }
            else {
                const device = new MockDevice(this, deviceId, deviceDescription);
                this.handleDeviceAdded(device);
                resolve(device);
            }
        });
    }
    /**
     * Remove a MockDevice from the MockAdapter.
     *
     * @param {String} deviceId ID of the device to remove.
     * @return {Promise} which resolves to the device removed.
     */
    removeDevice(deviceId) {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(deviceId);
            if (device) {
                this.handleDeviceRemoved(device);
                resolve(device);
            }
            else {
                reject(`Device: ${deviceId} not found.`);
            }
        });
    }
    pairDevice(deviceId, deviceDescription) {
        this.pairDeviceId = deviceId;
        this.pairDeviceDescription = deviceDescription;
    }
    unpairDevice(_deviceId) {
        // pass
    }
    startPairing(_timeoutSeconds) {
        console.log('MockAdapter:', this.getName(), 'id', this.getId(), 'pairing started');
        if (this.pairDeviceId) {
            const deviceId = this.pairDeviceId;
            const deviceDescription = this.pairDeviceDescription;
            this.pairDeviceId = null;
            this.pairDeviceDescription = null;
            this.addDevice(deviceId, deviceDescription)
                .then(() => {
                console.log('MockAdapter: device:', deviceId, 'was paired.');
            })
                .catch((err) => {
                console.error('MockAdapter: unpairing', deviceId, 'failed');
                console.error(err);
            });
        }
    }
    cancelPairing() {
        console.log('MockAdapter:', this.getName(), 'id', this.getId(), 'pairing cancelled');
    }
    removeThing(device) {
        console.log('MockAdapter:', this.getName(), 'id', this.getId(), 'removeThing(', device.getId(), ') started');
        this.removeDevice(device.getId())
            .then(() => {
            console.log('MockAdapter: device:', device.getId(), 'was unpaired.');
        })
            .catch((err) => {
            console.error('MockAdapter: unpairing', device.getId(), 'failed');
            console.error(err);
        });
    }
    cancelRemoveThing(device) {
        console.log('MockAdapter:', this.getName(), 'id', this.getId(), 'cancelRemoveThing(', device.getId(), ')');
    }
    setPin(_deviceId, pin) {
        return new Promise((resolve, reject) => {
            if (pin === '1234') {
                resolve();
            }
            else {
                reject();
            }
        });
    }
    setCredentials(_deviceId, username, password) {
        return new Promise((resolve, reject) => {
            if (username === 'test-user' && password === 'Password-1234!') {
                resolve();
            }
            else {
                reject();
            }
        });
    }
    unload() {
        this.server.close();
        return super.unload();
    }
    getPort() {
        return this.port;
    }
}
exports.MockAdapter = MockAdapter;
function loadMockAdapter(addonManager) {
    new MockAdapter(addonManager, manifest_json_1.default.id);
}
exports.default = loadMockAdapter;
//# sourceMappingURL=index.js.map