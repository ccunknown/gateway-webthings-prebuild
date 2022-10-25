"use strict";
/**
 * Action Model.
 *
 * Manages Action data model and business logic.
 *
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
const actions_1 = __importDefault(require("./actions"));
const Constants = __importStar(require("../constants"));
const events_1 = require("events");
const gateway_addon_1 = require("gateway-addon");
class Action extends events_1.EventEmitter {
    /**
     * Create a new Action
     * @param {String} name
     * @param {Object} input
     * @param {Thing?} thing
     */
    constructor(name, input, thing) {
        super();
        this.id = actions_1.default.generateId();
        this.name = name;
        this.input = input || {};
        if (thing) {
            this.href = `${thing.getHref()}${Constants.ACTIONS_PATH}/${name}/${this.id}`;
            this.thingId = thing.getId();
        }
        else {
            this.href = `${Constants.ACTIONS_PATH}/${name}/${this.id}`;
            this.thingId = null;
        }
        this.status = 'created';
        this.timeRequested = gateway_addon_1.Utils.timestamp();
        this.timeCompleted = null;
        this.error = '';
    }
    getDescription() {
        const description = {
            input: this.input,
            href: this.href,
            status: this.status,
            timeRequested: this.timeRequested,
        };
        if (this.timeCompleted) {
            description.timeCompleted = this.timeCompleted;
        }
        if (this.error) {
            description.error = this.error;
        }
        return description;
    }
    /**
     * Update status and notify listeners
     * @param {String} newStatus
     */
    updateStatus(newStatus) {
        if (this.status === newStatus) {
            return;
        }
        if (newStatus === 'completed') {
            this.timeCompleted = gateway_addon_1.Utils.timestamp();
        }
        this.status = newStatus;
        this.emit(Constants.ACTION_STATUS, this);
    }
    /**
     * Update from another action.
     */
    update(action) {
        this.timeRequested = action.timeRequested;
        this.timeCompleted = action.timeCompleted || null;
        if (this.status !== action.status) {
            this.status = action.status;
            this.emit(Constants.ACTION_STATUS, this);
        }
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getInput() {
        return this.input;
    }
    getThingId() {
        return this.thingId;
    }
    getStatus() {
        return this.status;
    }
    getTimeRequested() {
        return this.timeRequested;
    }
    getTimeCompleted() {
        return this.timeCompleted;
    }
    setError(error) {
        this.error = error;
    }
}
exports.default = Action;
//# sourceMappingURL=action.js.map