"use strict";
/**
 * DeviceProxy - Gateway side representation of a device when using
 *               an adapter plugin.
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
const Constants = __importStar(require("../constants"));
const gateway_addon_1 = require("gateway-addon");
const deferred_1 = __importDefault(require("../deferred"));
const actions_1 = __importDefault(require("../models/actions"));
const event_1 = __importDefault(require("../models/event"));
const events_1 = __importDefault(require("../models/events"));
const property_proxy_1 = __importDefault(require("./property-proxy"));
const MessageType = gateway_addon_1.Constants.MessageType;
class DeviceProxy extends gateway_addon_1.Device {
    constructor(adapter, deviceDict) {
        var _a, _b, _c, _d;
        super(adapter, deviceDict.id);
        this.setTitle((_a = deviceDict.title) !== null && _a !== void 0 ? _a : '');
        this['@context'] = deviceDict['@context'] || 'https://webthings.io/schemas';
        this['@type'] = deviceDict['@type'] || [];
        this.setDescription((_b = deviceDict.description) !== null && _b !== void 0 ? _b : '');
        this.links = deviceDict.links || [];
        this.baseHref = deviceDict.baseHref || null;
        if (deviceDict.pin) {
            this.pinRequired = (_c = deviceDict.pin.required) !== null && _c !== void 0 ? _c : false;
            this.pinPattern = (_d = deviceDict.pin.pattern) !== null && _d !== void 0 ? _d : null;
        }
        else {
            this.pinRequired = false;
            this.pinPattern = null;
        }
        this.credentialsRequired =
            !!deviceDict.credentialsRequired;
        for (const propertyName in deviceDict.properties) {
            const propertyDict = deviceDict.properties[propertyName];
            const propertyProxy = new property_proxy_1.default(this, propertyName, propertyDict);
            this.addProperty(propertyProxy);
        }
        // Copy over any extra device fields which might be useful for debugging.
        this.deviceDict = {};
        for (const field in deviceDict) {
            if ([
                'id',
                'title',
                'description',
                'properties',
                'actions',
                'events',
                '@type',
                '@context',
                'links',
            ].includes(field)) {
                continue;
            }
            this.deviceDict[field] = deviceDict[field];
        }
        if (deviceDict.actions) {
            for (const actionName in deviceDict.actions) {
                const dict = deviceDict.actions[actionName];
                this.addAction(actionName, dict);
            }
        }
        if (deviceDict.events) {
            for (const eventName in deviceDict.events) {
                const dict = deviceDict.events[eventName];
                this.addEvent(eventName, dict);
            }
        }
    }
    getAdapter() {
        return super.getAdapter();
    }
    asDict() {
        return Object.assign({}, this.deviceDict, super.asDict());
    }
    /**
     * @method requestAction
     */
    requestAction(actionId, actionName, input) {
        return new Promise((resolve, reject) => {
            // TODO: fix after updating gateway-addon
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!this.actions.has(actionName)) {
                reject(`Action "${actionName}" not found`);
                return;
            }
            console.log('DeviceProxy: requestAction:', actionName, 'for:', this.getId());
            const deferredSet = new deferred_1.default();
            deferredSet
                .getPromise()
                .then(() => {
                resolve();
            })
                .catch(() => {
                reject();
            });
            this.getAdapter().sendMsg(MessageType.DEVICE_REQUEST_ACTION_REQUEST, {
                deviceId: this.getId(),
                actionName,
                actionId,
                input,
            }, deferredSet);
        });
    }
    /**
     * @method removeAction
     */
    removeAction(actionId, actionName) {
        return new Promise((resolve, reject) => {
            // TODO: fix after updating gateway-addon
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!this.actions.has(actionName)) {
                reject(`Action "${actionName}" not found`);
                return;
            }
            console.log('DeviceProxy: removeAction:', actionName, 'for:', this.getId());
            const deferredSet = new deferred_1.default();
            deferredSet
                .getPromise()
                .then(() => {
                resolve();
            })
                .catch(() => {
                reject();
            });
            this.getAdapter().sendMsg(MessageType.DEVICE_REMOVE_ACTION_REQUEST, {
                deviceId: this.getId(),
                actionName,
                actionId,
            }, deferredSet);
        });
    }
    notifyPropertyChanged(property) {
        this.getAdapter().getManager().emit(Constants.PROPERTY_CHANGED, property);
    }
    actionNotify(action) {
        const a = action;
        const internalAction = actions_1.default.get(a.id);
        if (internalAction) {
            internalAction.update(a);
        }
        this.getAdapter().getManager().emit(Constants.ACTION_STATUS, a);
    }
    eventNotify(event) {
        const e = event;
        events_1.default.add(new event_1.default(e.name, e.data, this.getId(), e.timestamp));
        this.getAdapter().getManager().emit(Constants.EVENT, e);
    }
    connectedNotify(connected) {
        this.getAdapter().getManager().emit(Constants.CONNECTED, { device: this, connected });
    }
}
exports.default = DeviceProxy;
//# sourceMappingURL=device-proxy.js.map