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
const index_1 = require("./index");
const Effect_1 = __importDefault(require("./Effect"));
/**
 * MultiEffect - The outcome of a Rule involving multiple effects
 */
class MultiEffect extends Effect_1.default {
    /**
     * @param {MultiEffectDescription} desc
     */
    constructor(desc) {
        super(desc);
        this.effects = desc.effects.map(function (effect) {
            return (0, index_1.fromDescription)(effect);
        });
    }
    /**
     * @return {EffectDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), {
            effects: this.effects.map((effect) => effect.toDescription()),
        });
    }
    /**
     * @param {State} state
     */
    setState(state) {
        for (const effect of this.effects) {
            effect.setState(state);
        }
    }
}
exports.default = MultiEffect;
//# sourceMappingURL=MultiEffect.js.map