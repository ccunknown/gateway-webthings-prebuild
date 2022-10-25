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
 * An Effect which temporarily sets the target property to
 * a value before restoring its original value
 */
class PulseEffect extends PropertyEffect_1.default {
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc) {
        super(desc);
        this.value = desc.value;
        if (typeof this.value === 'number') {
            (0, assert_1.default)(this.property.getType() === 'number' || this.property.getType() === 'integer', 'setpoint and property must be compatible types');
        }
        else {
            (0, assert_1.default)(typeof this.value === this.property.getType(), 'setpoint and property must be same type');
        }
        this.on = false;
        this.oldValue = null;
    }
    /**
     * @return {EffectDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), { value: this.value });
    }
    /**
     * @param {State} state
     */
    setState(state) {
        if (state.on) {
            // If we're already active, just perform the effect again
            if (this.on) {
                return this.property.set(this.value);
            }
            // Activate the effect and save our current state to revert to upon
            // deactivation
            this.property.get().then((value) => {
                this.oldValue = value;
                // Always set to the opposite (always toggle)
                if (typeof value === 'boolean') {
                    this.oldValue = !this.value;
                }
                this.on = true;
                return this.property.set(this.value);
            });
        }
        else if (this.on) {
            // Revert to our original value if we pulsed to a new value
            this.on = false;
            if (this.oldValue !== null) {
                return this.property.set(this.oldValue);
            }
        }
        return Promise.resolve(null);
    }
}
exports.default = PulseEffect;
//# sourceMappingURL=PulseEffect.js.map