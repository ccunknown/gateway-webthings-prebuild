/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { RuleDescription } from './Rule';
import { RunResult } from 'sqlite3';
declare class RulesDatabase {
    constructor();
    /**
     * Open the database
     */
    open(): Promise<RunResult>;
    /**
     * Get all rules
     * @return {Promise<Map<number, RuleDescription>>} resolves to a map of rule
     * id to rule
     */
    getRules(): Promise<Record<number, RuleDescription>>;
    /**
     * Create a new rule
     * @param {RuleDescription} desc
     * @return {Promise<number>} resolves to rule id
     */
    createRule(desc: RuleDescription): Promise<number>;
    /**
     * Update an existing rule
     * @param {number} id
     * @param {RuleDescription} desc
     * @return {Promise}
     */
    updateRule(id: number, desc: RuleDescription): Promise<RunResult>;
    /**
     * Delete an existing rule
     * @param {number} id
     * @return {Promise}
     */
    deleteRule(id: number): Promise<RunResult>;
}
declare const _default: RulesDatabase;
export default _default;
//# sourceMappingURL=Database.d.ts.map