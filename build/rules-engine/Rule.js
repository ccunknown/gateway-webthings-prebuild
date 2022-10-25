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
Object.defineProperty(exports, "__esModule", { value: true });
const Effects = __importStar(require("./effects/index"));
const Triggers = __importStar(require("./triggers/index"));
const Events = __importStar(require("./Events"));
const DEBUG = false || process.env.NODE_ENV === 'test';
class Rule {
    /**
     * @param {boolean} enabled
     * @param {Trigger} trigger
     * @param {Effect} effect
     */
    constructor(enabled, trigger, effect) {
        this.enabled = enabled;
        this.trigger = trigger;
        this.effect = effect;
        this._onTriggerStateChanged = this.onTriggerStateChanged.bind(this);
    }
    setId(id) {
        this.id = id;
    }
    setName(name) {
        this.name = name;
    }
    /**
     * Create a rule from a serialized description
     * @param {RuleDescription} desc
     * @return {Rule}
     */
    static fromDescription(desc) {
        const trigger = Triggers.fromDescription(desc.trigger);
        const effect = Effects.fromDescription(desc.effect);
        const rule = new Rule(desc.enabled, trigger, effect);
        if (desc.hasOwnProperty('id')) {
            rule.setId(desc.id);
        }
        if (desc.hasOwnProperty('name')) {
            rule.setName(desc.name);
        }
        return rule;
    }
    /**
     * Begin executing the rule
     */
    async start() {
        this.trigger.on(Events.STATE_CHANGED, this._onTriggerStateChanged);
        await this.trigger.start();
        if (DEBUG) {
            console.debug('Rule.start', this.name);
        }
    }
    /**
     * On a state changed event, pass the state forward to the rule's effect
     * @param {State} state
     */
    onTriggerStateChanged(state) {
        if (!this.enabled) {
            return;
        }
        if (DEBUG) {
            console.debug('Rule.onTriggerStateChanged', this.name, state);
        }
        this.effect.setState(state);
    }
    /**
     * @return {RuleDescription}
     */
    toDescription() {
        const desc = {
            enabled: this.enabled,
            trigger: this.trigger.toDescription(),
            effect: this.effect.toDescription(),
        };
        if (this.hasOwnProperty('id')) {
            desc.id = this.id;
        }
        if (this.hasOwnProperty('name')) {
            desc.name = this.name;
        }
        return desc;
    }
    /**
     * Stop executing the rule
     */
    stop() {
        this.trigger.removeListener(Events.STATE_CHANGED, this._onTriggerStateChanged);
        this.trigger.stop();
        if (DEBUG) {
            console.debug('Rule.stop', this.name);
        }
    }
}
exports.default = Rule;
//# sourceMappingURL=Rule.js.map