"use strict";
/**
 * PropertyProxy - Gateway side representation of a property
 *                 when using an adapter plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deferred_1 = __importDefault(require("../deferred"));
const gateway_addon_1 = require("gateway-addon");
const MessageType = gateway_addon_1.Constants.MessageType;
class PropertyProxy extends gateway_addon_1.Property {
    constructor(device, propertyName, propertyDict) {
        super(device, propertyName, propertyDict);
        this.setCachedValue(propertyDict.value);
        this.propertyChangedPromises = [];
        this.propertyDict = Object.assign({}, propertyDict);
    }
    getDevice() {
        return super.getDevice();
    }
    asDict() {
        return Object.assign({}, this.propertyDict, super.asDict());
    }
    /**
     * @method onPropertyChanged
     * @returns a promise which is resoved when the next
     * propertyChanged notification is received.
     */
    onPropertyChanged() {
        const deferredChange = new deferred_1.default();
        this.propertyChangedPromises.push(deferredChange);
        return deferredChange.getPromise();
    }
    /**
     * @method doPropertyChanged
     * Called whenever a property changed notification is received
     * from the adapter.
     */
    doPropertyChanged(propertyDict) {
        this.propertyDict = Object.assign({}, propertyDict);
        this.setCachedValue(propertyDict.value);
        if (typeof propertyDict.title === 'string') {
            this.setTitle(propertyDict.title);
        }
        if (typeof propertyDict.type === 'string') {
            this.setType(propertyDict.type);
        }
        if (typeof propertyDict['@type'] === 'string') {
            this.setAtType(propertyDict['@type']);
        }
        if (typeof propertyDict.unit === 'string') {
            this.setUnit(propertyDict.unit);
        }
        if (typeof propertyDict.description === 'string') {
            this.setDescription(propertyDict.description);
        }
        if (typeof propertyDict.minimum === 'number') {
            this.setMinimum(propertyDict.minimum);
        }
        if (typeof propertyDict.maximum === 'number') {
            this.setMaximum(propertyDict.maximum);
        }
        if (typeof propertyDict.multipleOf === 'number') {
            this.setMultipleOf(propertyDict.multipleOf);
        }
        if (Array.isArray(propertyDict.enum)) {
            this.setEnum(propertyDict.enum);
        }
        if (Array.isArray(propertyDict.forms)) {
            this.setForms(propertyDict.forms);
        }
        while (this.propertyChangedPromises.length > 0) {
            const deferredChange = this.propertyChangedPromises.pop();
            deferredChange === null || deferredChange === void 0 ? void 0 : deferredChange.resolve(propertyDict.value);
        }
    }
    /**
     * @returns a promise which resolves to the updated value.
     *
     * @note it is possible that the updated value doesn't match
     * the value passed in.
     */
    setValue(value) {
        return new Promise((resolve, reject) => {
            this.getDevice().getAdapter().sendMsg(MessageType.DEVICE_SET_PROPERTY_COMMAND, {
                deviceId: this.getDevice().getId(),
                propertyName: this.getName(),
                propertyValue: value,
            });
            // TODO: Add a timeout
            this.onPropertyChanged()
                .then((updatedValue) => {
                resolve(updatedValue);
            })
                .catch((error) => {
                console.error('PropertyProxy: Failed to setProperty', this.getName(), 'to', value, 'for device:', this.getDevice().getId());
                console.error(error);
                reject(error);
            });
        });
    }
}
exports.default = PropertyProxy;
//# sourceMappingURL=property-proxy.js.map