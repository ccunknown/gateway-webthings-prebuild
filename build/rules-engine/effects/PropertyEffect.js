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
const Property_1 = __importDefault(require("../Property"));
const Effect_1 = __importDefault(require("./Effect"));
/**
 * PropertyEffect - The outcome of a Rule involving a property
 */
class PropertyEffect extends Effect_1.default {
    /**
     * Create an Effect based on a wire-format description with a property
     * @param {PropertyEffectDescription} desc
     */
    constructor(desc) {
        super(desc);
        this.property = new Property_1.default(desc.property);
    }
    /**
     * @return {EffectDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), {
            property: this.property.toDescription(),
        });
    }
}
exports.default = PropertyEffect;
//# sourceMappingURL=PropertyEffect.js.map