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
const Events = __importStar(require("../Events"));
const Property_1 = __importDefault(require("../Property"));
const Trigger_1 = __importDefault(require("./Trigger"));
/**
 * An abstract class for triggers whose input is a single property
 */
class PropertyTrigger extends Trigger_1.default {
    constructor(desc) {
        super(desc);
        this.property = new Property_1.default(desc.property);
        this._onValueChanged = this.onValueChanged.bind(this);
    }
    /**
     * @return {TriggerDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), { property: this.property.toDescription() });
    }
    async start() {
        this.property.on(Events.VALUE_CHANGED, this._onValueChanged);
        await this.property.start();
    }
    onValueChanged(_value) {
        // to be overridden
    }
    stop() {
        this.property.removeListener(Events.VALUE_CHANGED, this._onValueChanged);
        this.property.stop();
    }
}
exports.default = PropertyTrigger;
//# sourceMappingURL=PropertyTrigger.js.map