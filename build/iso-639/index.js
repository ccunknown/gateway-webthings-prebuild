"use strict";
/**
 * Read data from the official ISO 639-3 table.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const country_list_1 = require("country-list");
const sync_1 = __importDefault(require("csv-parse/lib/sync"));
const path_1 = __importDefault(require("path"));
let parsed = false;
const by1 = new Map();
const by3 = new Map();
/**
 * Parse the table in this directory.
 */
function readFile() {
    let fname;
    try {
        for (const name of fs_1.default.readdirSync(__dirname)) {
            if (name.endsWith('.tab')) {
                fname = name;
                break;
            }
        }
    }
    catch (e) {
        console.error('Failed to list directory:', e);
        return false;
    }
    if (!fname) {
        return false;
    }
    let data;
    try {
        data = fs_1.default.readFileSync(path_1.default.join(__dirname, fname), 'utf8');
    }
    catch (e) {
        console.error('Failed to read ISO-639 table:', e);
        return false;
    }
    if (!data) {
        return false;
    }
    const records = (0, sync_1.default)(data, { delimiter: '\t', columns: true, trim: true });
    if (records.length === 0) {
        return false;
    }
    for (const record of records) {
        // Id is the 639-3 code
        if (record.Id) {
            by3.set(record.Id, record.Ref_Name);
        }
        // Part1 is the 639-1 code
        if (record.Part1) {
            by1.set(record.Part1, record.Ref_Name);
        }
    }
    return true;
}
/**
 * Look up the provided code.
 *
 * @param {string} code - Code to look up
 * @returns {string|null} Language name or null if not found.
 */
function lookup(code) {
    if (!parsed) {
        if (!readFile()) {
            return null;
        }
        parsed = true;
    }
    const [language, country] = code.split('-');
    let name;
    if (language.length === 2) {
        name = by1.get(language);
    }
    else if (language.length === 3) {
        name = by3.get(language);
    }
    else {
        return null;
    }
    if (name && country) {
        const countryName = (0, country_list_1.getName)(country) || country;
        name = `${name} (${countryName})`;
    }
    return name;
}
exports.default = lookup;
//# sourceMappingURL=index.js.map