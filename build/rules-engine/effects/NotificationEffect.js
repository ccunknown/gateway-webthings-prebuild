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
const Effect_1 = __importDefault(require("./Effect"));
const push_service_1 = __importDefault(require("../../push-service"));
/**
 * An Effect which creates a notification
 */
class NotificationEffect extends Effect_1.default {
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc) {
        super(desc);
        (0, assert_1.default)(desc.hasOwnProperty('message'));
        this.message = desc.message;
    }
    /**
     * @return {EffectDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), {
            message: this.message,
        });
    }
    /**
     * @param {State} state
     */
    setState(state) {
        if (!state.on) {
            return;
        }
        push_service_1.default.broadcastNotification(this.message);
    }
}
exports.default = NotificationEffect;
//# sourceMappingURL=NotificationEffect.js.map