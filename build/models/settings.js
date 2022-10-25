"use strict";
/**
 * Settings Model.
 *
 * Manages the getting and setting of settings
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTunnelInfo = exports.deleteSetting = exports.setSetting = exports.getSetting = void 0;
const db_1 = __importDefault(require("../db"));
const util_1 = __importDefault(require("util"));
const DEBUG = false || process.env.NODE_ENV === 'test';
/**
 * Get a setting.
 *
 * @param {String} key Key of setting to get.
 */
async function getSetting(key) {
    try {
        return await db_1.default.getSetting(key);
    }
    catch (e) {
        console.error('Failed to get', key);
        throw e;
    }
}
exports.getSetting = getSetting;
/**
 * Set a setting.
 *
 * @param {String} key Key of setting to set.
 * @param value Value to set key to.
 */
async function setSetting(key, value) {
    try {
        await db_1.default.setSetting(key, value);
        if (DEBUG) {
            console.log('Set', key, 'to', util_1.default.inspect(value, { breakLength: Infinity }));
        }
        return value;
    }
    catch (e) {
        console.error('Failed to set', key, 'to', util_1.default.inspect(value, { breakLength: Infinity }));
        throw e;
    }
}
exports.setSetting = setSetting;
/**
 * Delete a setting.
 *
 * @param {String} key Key of setting to delete.
 */
async function deleteSetting(key) {
    try {
        await db_1.default.deleteSetting(key);
    }
    catch (e) {
        console.error('Failed to delete', key);
        throw e;
    }
}
exports.deleteSetting = deleteSetting;
/**
 * Get an object of all tunnel settings
 * @return {string}
 */
async function getTunnelInfo() {
    // Check to see if we have a tunnel endpoint first
    const result = await getSetting('tunneltoken');
    let tunnelDomain;
    if (typeof result === 'object') {
        const token = result;
        console.log(`Tunnel domain found. Tunnel name is: ${token.name} and tunnel domain is: ${token.base}`);
        tunnelDomain = `https://${token.name}.${token.base}`;
    }
    else {
        console.log('Tunnel domain not set.');
        tunnelDomain = 'Not set.';
    }
    return tunnelDomain;
}
exports.getTunnelInfo = getTunnelInfo;
//# sourceMappingURL=settings.js.map