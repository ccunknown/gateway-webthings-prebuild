"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const PropertyEffect_1 = __importDefault(require("./PropertyEffect"));
/**
 * An Effect which permanently sets the target property to
 * a value when triggered
 */
class SetEffect extends PropertyEffect_1.default {
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc) {
        super(desc);
        this.on = false;
        this.value = desc.value;
        if (typeof this.value === 'number') {
            (0, assert_1.default)(this.property.getType() === 'number' || this.property.getType() === 'integer', 'setpoint and property must be compatible types');
        }
        else {
            (0, assert_1.default)(typeof this.value === this.property.getType(), 'setpoint and property must be same type');
        }
    }
    /**
     * @return {EffectDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), { value: this.value });
    }
    /**
     * @return {State}
     */
    setState(state) {
        if (!this.on && state.on) {
            this.on = true;
            return this.property.set(this.value);
        }
        if (this.on && !state.on) {
            this.on = false;
            return Promise.resolve(null);
        }
        return Promise.resolve(null);
    }
}
exports.default = SetEffect;
//# sourceMappingURL=SetEffect.js.map