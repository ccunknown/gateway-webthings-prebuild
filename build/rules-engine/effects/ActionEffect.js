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
const action_1 = __importDefault(require("../../models/action"));
const actions_1 = __importDefault(require("../../models/actions"));
const addon_manager_1 = __importDefault(require("../../addon-manager"));
const Effect_1 = __importDefault(require("./Effect"));
const things_1 = __importDefault(require("../../models/things"));
/**
 * An Effect which creates an action
 */
class ActionEffect extends Effect_1.default {
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc) {
        super(desc);
        (0, assert_1.default)(desc.thing);
        (0, assert_1.default)(desc.action);
        this.thing = desc.thing;
        this.action = desc.action;
        this.parameters = desc.parameters || {};
    }
    /**
     * @return {EffectDescription}
     */
    toDescription() {
        return Object.assign(super.toDescription(), {
            thing: this.thing,
            action: this.action,
            parameters: this.parameters,
        });
    }
    /**
     * @param {State} state
     */
    setState(state) {
        if (!state.on) {
            return;
        }
        this.createAction();
    }
    async createAction() {
        try {
            const thing = await things_1.default.getThing(this.thing);
            const action = new action_1.default(this.action, this.parameters, thing);
            await actions_1.default.add(action);
            await addon_manager_1.default.requestAction(this.thing, action.getId(), this.action, this.parameters);
        }
        catch (e) {
            console.warn('Unable to dispatch action', e);
        }
    }
}
exports.default = ActionEffect;
//# sourceMappingURL=ActionEffect.js.map