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
const index_1 = require("./index");
const assert_1 = __importDefault(require("assert"));
const Events = __importStar(require("../Events"));
const Trigger_1 = __importDefault(require("./Trigger"));
const DEBUG = false || process.env.NODE_ENV === 'test';
const ops = {
    AND: 'AND',
    OR: 'OR',
};
/**
 * A Trigger which activates only when a set of triggers are activated
 */
class MultiTrigger extends Trigger_1.default {
    /**
     * @param {TriggerDescription} desc
     */
    constructor(desc) {
        super(desc);
        (0, assert_1.default)(desc.op in ops);
        this.op = desc.op;
        if (DEBUG) {
            this.id = Math.floor(Math.random() * 1000);
        }
        this.triggers = desc.triggers.map((trigger) => {
            return (0, index_1.fromDescription)(trigger);
        });
        this.states = new Array(this.triggers.length);
        for (let i = 0; i < this.states.length; i++) {
            this.states[i] = false;
        }
        this.state = false;
    }
    /**
     * @return {TriggerDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), {
            op: this.op,
            triggers: this.triggers.map((trigger) => trigger.toDescription()),
        });
    }
    async start() {
        const starts = this.triggers.map((trigger, triggerIndex) => {
            trigger.on(Events.STATE_CHANGED, this.onStateChanged.bind(this, triggerIndex));
            return trigger.start();
        });
        await Promise.all(starts);
    }
    stop() {
        this.triggers.forEach((trigger) => {
            trigger.removeAllListeners(Events.STATE_CHANGED);
            trigger.stop();
        });
    }
    onStateChanged(triggerIndex, state) {
        this.states[triggerIndex] = state.on;
        let value = this.states[0];
        for (let i = 1; i < this.states.length; i++) {
            if (this.op === ops.AND) {
                value = value && this.states[i];
            }
            else if (this.op === ops.OR) {
                value = value || this.states[i];
            }
        }
        if (DEBUG) {
            console.debug(`MultiTrigger(${this.id}).onStateChanged(${triggerIndex}, ${state}) -> ${this.states}`);
        }
        if (value !== this.state) {
            this.state = value;
            this.emit(Events.STATE_CHANGED, { on: this.state });
        }
    }
}
exports.default = MultiTrigger;
//# sourceMappingURL=MultiTrigger.js.map