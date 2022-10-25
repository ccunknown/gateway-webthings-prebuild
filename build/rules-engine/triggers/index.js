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
exports.fromDescription = exports.triggers = void 0;
const BooleanTrigger_1 = __importDefault(require("./BooleanTrigger"));
const EqualityTrigger_1 = __importDefault(require("./EqualityTrigger"));
const EventTrigger_1 = __importDefault(require("./EventTrigger"));
const LevelTrigger_1 = __importDefault(require("./LevelTrigger"));
const MultiTrigger_1 = __importDefault(require("./MultiTrigger"));
const PropertyTrigger_1 = __importDefault(require("./PropertyTrigger"));
const TimeTrigger_1 = __importDefault(require("./TimeTrigger"));
const Trigger_1 = __importDefault(require("./Trigger"));
exports.triggers = {
    BooleanTrigger: BooleanTrigger_1.default,
    EqualityTrigger: EqualityTrigger_1.default,
    EventTrigger: EventTrigger_1.default,
    LevelTrigger: LevelTrigger_1.default,
    MultiTrigger: MultiTrigger_1.default,
    PropertyTrigger: PropertyTrigger_1.default,
    TimeTrigger: TimeTrigger_1.default,
    Trigger: Trigger_1.default,
};
/**
 * Produce an trigger from a serialized trigger description. Throws if `desc`
 * is invalid
 * @param {TriggerDescription} desc
 * @return {Trigger}
 */
function fromDescription(desc) {
    const TriggerClass = exports.triggers[desc.type];
    if (!TriggerClass) {
        throw new Error(`Unsupported or invalid trigger type:${desc.type}`);
    }
    return new TriggerClass(desc);
}
exports.fromDescription = fromDescription;
//# sourceMappingURL=index.js.map