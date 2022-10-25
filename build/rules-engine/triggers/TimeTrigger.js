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
const Trigger_1 = __importDefault(require("./Trigger"));
/**
 * An abstract class for triggers whose input is a single property
 */
class TimeTrigger extends Trigger_1.default {
    constructor(desc) {
        super(desc);
        this.time = desc.time;
        this.localized = !!desc.localized;
        this.timeout = null;
        this._sendOn = this.sendOn.bind(this);
        this._sendOff = this.sendOff.bind(this);
    }
    /**
     * @return {TriggerDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), { time: this.time, localized: this.localized });
    }
    async start() {
        this.scheduleNext();
    }
    scheduleNext() {
        const parts = this.time.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        // Time is specified in local time
        const nextTime = new Date();
        nextTime.setHours(hours, minutes, 0, 0);
        if (nextTime.getTime() < Date.now()) {
            // NB: this will wrap properly into the next month/year
            nextTime.setDate(nextTime.getDate() + 1);
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this._sendOn, nextTime.getTime() - Date.now());
    }
    sendOn() {
        this.emit(Events.STATE_CHANGED, { on: true, value: Date.now() });
        this.timeout = setTimeout(this._sendOff, 60 * 1000);
    }
    sendOff() {
        this.emit(Events.STATE_CHANGED, { on: false, value: Date.now() });
        this.scheduleNext();
    }
    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}
exports.default = TimeTrigger;
//# sourceMappingURL=TimeTrigger.js.map