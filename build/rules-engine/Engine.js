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
const Database_1 = __importDefault(require("./Database"));
const Rule_1 = __importDefault(require("./Rule"));
/**
 * An engine for running and managing list of rules
 */
class Engine {
    constructor() {
        this.rules = null;
    }
    /**
     * Get a list of all current rules
     * @return {Promise<Array<Rule>>} rules
     */
    getRules() {
        let rulesPromise = Promise.resolve(this.rules);
        if (!this.rules) {
            rulesPromise = Database_1.default.getRules().then(async (ruleDescs) => {
                this.rules = {};
                for (const ruleId in ruleDescs) {
                    ruleDescs[ruleId].id = parseInt(ruleId);
                    this.rules[ruleId] = Rule_1.default.fromDescription(ruleDescs[ruleId]);
                    await this.rules[ruleId].start();
                }
                return this.rules;
            });
        }
        return rulesPromise.then((rules) => {
            // eslint-disable-next-line @typescript-eslint/ban-types
            return Object.keys(rules).map((ruleId) => {
                return rules[ruleId];
            });
        });
    }
    /**
     * Get a rule by id
     * @param {number} id
     * @return {Promise<Rule>}
     */
    getRule(id) {
        if (!(id in this.rules)) {
            return Promise.reject(new Error(`Rule ${id} does not exist`));
        }
        return Promise.resolve(this.rules[id]);
    }
    /**
     * Add a new rule to the engine's list
     * @param {Rule} rule
     * @return {Promise<number>} rule id
     */
    async addRule(rule) {
        const id = await Database_1.default.createRule(rule.toDescription());
        // eslint-disable-next-line require-atomic-updates
        rule.setId(id);
        this.rules[id] = rule;
        await rule.start();
        return id;
    }
    /**
     * Update an existing rule
     * @param {number} rule id
     * @param {Rule} rule
     * @return {Promise}
     */
    async updateRule(ruleId, rule) {
        if (!(ruleId in this.rules)) {
            return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
        }
        rule.setId(ruleId);
        await Database_1.default.updateRule(ruleId, rule.toDescription());
        this.rules[ruleId].stop();
        this.rules[ruleId] = rule;
        await rule.start();
    }
    /**
     * Delete an existing rule
     * @param {number} rule id
     * @return {Promise}
     */
    deleteRule(ruleId) {
        if (!(ruleId in this.rules)) {
            return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
        }
        return Database_1.default.deleteRule(ruleId).then(() => {
            this.rules[ruleId].stop();
            delete this.rules[ruleId];
        });
    }
}
exports.default = Engine;
//# sourceMappingURL=Engine.js.map