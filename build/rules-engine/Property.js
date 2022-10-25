"use strict";
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
const assert_1 = __importDefault(require("assert"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
const Constants = __importStar(require("../constants"));
const things_1 = __importDefault(require("../models/things"));
const events_1 = require("events");
const Events = __importStar(require("./Events"));
/**
 * Utility to support operations on Thing's properties
 */
class Property extends events_1.EventEmitter {
    /**
     * Create a Property from a descriptor returned by the WoT API
     * @param {PropertyDescription} desc
     */
    constructor(desc) {
        super();
        (0, assert_1.default)(desc.type);
        (0, assert_1.default)(desc.thing);
        (0, assert_1.default)(desc.id);
        this.type = desc.type;
        this.thing = desc.thing;
        this.id = desc.id;
        if (desc.unit) {
            this.unit = desc.unit;
        }
        if (desc.description) {
            this.description = desc.description;
        }
        this.onPropertyChanged = this.onPropertyChanged.bind(this);
        this.onThingAdded = this.onThingAdded.bind(this);
    }
    getType() {
        return this.type;
    }
    /**
     * @return {PropertyDescription}
     */
    toDescription() {
        const desc = {
            type: this.type,
            thing: this.thing,
            id: this.id,
        };
        if (this.unit) {
            desc.unit = this.unit;
        }
        if (this.description) {
            desc.description = this.description;
        }
        return desc;
    }
    /**
     * @return {Promise} resolves to property's value or undefined if not found
     */
    async get() {
        try {
            return await things_1.default.getThingProperty(this.thing, this.id);
        }
        catch (e) {
            console.warn('Rule get failed', e);
        }
        return null;
    }
    /**
     * @param {Any} value
     * @return {Promise} resolves when set is done
     */
    set(value) {
        return things_1.default.setThingProperty(this.thing, this.id, value)
            .catch((e) => {
            console.warn('Rule set failed, retrying once', e);
            return things_1.default.setThingProperty(this.thing, this.id, value);
        })
            .catch((e) => {
            console.warn('Rule set failed completely', e);
            return null;
        });
    }
    async start() {
        addon_manager_1.default.on(Constants.PROPERTY_CHANGED, this.onPropertyChanged);
        try {
            await this.getInitialValue();
        }
        catch (_e) {
            addon_manager_1.default.on(Constants.THING_ADDED, this.onThingAdded);
        }
    }
    async getInitialValue() {
        const initialValue = await this.get();
        if (typeof initialValue === 'undefined') {
            throw new Error('Did not get a real value');
        }
        this.emit(Events.VALUE_CHANGED, initialValue);
    }
    /**
     * Listener for AddonManager's THING_ADDED event
     * @param {String} thing - thing id
     */
    onThingAdded(thing) {
        if (thing.id !== this.thing) {
            return;
        }
        this.getInitialValue().catch((e) => {
            console.warn('Rule property unable to get initial value:', e.message);
        });
    }
    onPropertyChanged(property) {
        if (property.getDevice().getId() !== this.thing) {
            return;
        }
        if (property.getName() !== this.id) {
            return;
        }
        property.getValue().then((value) => this.emit(Events.VALUE_CHANGED, value));
    }
    stop() {
        addon_manager_1.default.removeListener(Constants.PROPERTY_CHANGED, this.onPropertyChanged);
        addon_manager_1.default.removeListener(Constants.THING_ADDED, this.onThingAdded);
    }
}
exports.default = Property;
//# sourceMappingURL=Property.js.map