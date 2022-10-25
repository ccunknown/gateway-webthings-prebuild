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
const db_1 = __importDefault(require("../db"));
const DatabaseMigrate = __importStar(require("./DatabaseMigrate"));
class RulesDatabase {
    constructor() {
        db_1.default.open();
        this.open();
    }
    /**
     * Open the database
     */
    open() {
        const rulesTableSQL = `CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY,
      description TEXT
    );`;
        return db_1.default.run(rulesTableSQL);
    }
    /**
     * Get all rules
     * @return {Promise<Map<number, RuleDescription>>} resolves to a map of rule
     * id to rule
     */
    getRules() {
        const rules = {};
        return db_1.default.all('SELECT id, description FROM rules')
            .then((rows) => {
            const updatePromises = [];
            for (const row of rows) {
                let desc = JSON.parse(row.description);
                const updatedDesc = DatabaseMigrate.migrate(desc);
                if (updatedDesc) {
                    desc = updatedDesc;
                    updatePromises.push(this.updateRule(row.id, desc));
                }
                rules[row.id] = desc;
            }
            return Promise.all(updatePromises);
        })
            .then(() => {
            return rules;
        });
    }
    /**
     * Create a new rule
     * @param {RuleDescription} desc
     * @return {Promise<number>} resolves to rule id
     */
    createRule(desc) {
        return db_1.default.run('INSERT INTO rules (description) VALUES (?)', JSON.stringify(desc)).then((res) => {
            return res.lastID;
        });
    }
    /**
     * Update an existing rule
     * @param {number} id
     * @param {RuleDescription} desc
     * @return {Promise}
     */
    updateRule(id, desc) {
        return db_1.default.run('UPDATE rules SET description = ? WHERE id = ?', JSON.stringify(desc), id);
    }
    /**
     * Delete an existing rule
     * @param {number} id
     * @return {Promise}
     */
    deleteRule(id) {
        return db_1.default.run('DELETE FROM rules WHERE id = ?', id);
    }
}
exports.default = new RulesDatabase();
//# sourceMappingURL=Database.js.map