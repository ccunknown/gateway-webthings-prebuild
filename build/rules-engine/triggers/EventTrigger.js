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
const Trigger_1 = __importDefault(require("./Trigger"));
const things_1 = __importDefault(require("../../models/things"));
/**
 * A trigger activated when an event occurs
 */
class EventTrigger extends Trigger_1.default {
    constructor(desc) {
        super(desc);
        (0, assert_1.default)(desc.thing);
        this.thing = desc.thing;
        this.event = desc.event;
        this.stopped = true;
        this._onEvent = this.onEvent.bind(this);
    }
    /**
     * @return {TriggerDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), {
            thing: this.thing,
            event: this.event,
        });
    }
    async start() {
        this.stopped = false;
        const thing = await things_1.default.getThing(this.thing);
        if (this.stopped) {
            return;
        }
        thing.addEventSubscription(this._onEvent);
    }
    onEvent(event) {
        if (this.event !== event.getName()) {
            return;
        }
        this.emit(Events.STATE_CHANGED, { on: true, value: Date.now() });
        this.emit(Events.STATE_CHANGED, { on: false, value: Date.now() });
    }
    stop() {
        this.stopped = true;
        things_1.default.getThing(this.thing).then((thing) => {
            thing.removeEventSubscription(this._onEvent);
        });
    }
}
exports.default = EventTrigger;
//# sourceMappingURL=EventTrigger.js.map