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
const Events = __importStar(require("../Events"));
const PropertyTrigger_1 = __importDefault(require("./PropertyTrigger"));
/**
 * A Trigger which activates when a boolean property is
 * equal to a given value, `onValue`
 */
class BooleanTrigger extends PropertyTrigger_1.default {
    /**
     * @param {TriggerDescription} desc
     */
    constructor(desc) {
        super(desc);
        (0, assert_1.default)(this.property.getType() === 'boolean');
        (0, assert_1.default)(typeof desc.onValue === 'boolean');
        this.onValue = desc.onValue;
    }
    /**
     * @return {TriggerDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), { onValue: this.onValue });
    }
    /**
     * @param {boolean} propValue
     * @return {State}
     */
    onValueChanged(propValue) {
        if (propValue === this.onValue) {
            this.emit(Events.STATE_CHANGED, { on: true, value: propValue });
        }
        else {
            this.emit(Events.STATE_CHANGED, { on: false, value: propValue });
        }
    }
}
exports.default = BooleanTrigger;
//# sourceMappingURL=BooleanTrigger.js.map