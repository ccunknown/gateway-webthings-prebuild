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
exports.fromDescription = exports.effects = void 0;
const Effect_1 = __importDefault(require("./Effect"));
const ActionEffect_1 = __importDefault(require("./ActionEffect"));
const MultiEffect_1 = __importDefault(require("./MultiEffect"));
const NotificationEffect_1 = __importDefault(require("./NotificationEffect"));
const NotifierOutletEffect_1 = __importDefault(require("./NotifierOutletEffect"));
const SetEffect_1 = __importDefault(require("./SetEffect"));
const PulseEffect_1 = __importDefault(require("./PulseEffect"));
exports.effects = {
    Effect: Effect_1.default,
    ActionEffect: ActionEffect_1.default,
    MultiEffect: MultiEffect_1.default,
    NotificationEffect: NotificationEffect_1.default,
    NotifierOutletEffect: NotifierOutletEffect_1.default,
    SetEffect: SetEffect_1.default,
    PulseEffect: PulseEffect_1.default,
};
/**
 * Produce an effect from a serialized effect description. Throws if `desc` is
 * invalid
 * @param {EffectDescription} desc
 * @return {Effect}
 */
function fromDescription(desc) {
    const EffectClass = exports.effects[desc.type];
    if (!EffectClass) {
        throw new Error(`Unsupported or invalid effect type:${desc.type}`);
    }
    return new EffectClass(desc);
}
exports.fromDescription = fromDescription;
//# sourceMappingURL=index.js.map