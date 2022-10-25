/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Rule from './Rule';
/**
 * An engine for running and managing list of rules
 */
export default class Engine {
    private rules;
    constructor();
    /**
     * Get a list of all current rules
     * @return {Promise<Array<Rule>>} rules
     */
    getRules(): Promise<Rule[]>;
    /**
     * Get a rule by id
     * @param {number} id
     * @return {Promise<Rule>}
     */
    getRule(id: number): Promise<Rule>;
    /**
     * Add a new rule to the engine's list
     * @param {Rule} rule
     * @return {Promise<number>} rule id
     */
    addRule(rule: Rule): Promise<number>;
    /**
     * Update an existing rule
     * @param {number} rule id
     * @param {Rule} rule
     * @return {Promise}
     */
    updateRule(ruleId: number, rule: Rule): Promise<void>;
    /**
     * Delete an existing rule
     * @param {number} rule id
     * @return {Promise}
     */
    deleteRule(ruleId: number): Promise<void>;
}
//# sourceMappingURL=Engine.d.ts.map