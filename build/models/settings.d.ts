/**
 * Settings Model.
 *
 * Manages the getting and setting of settings
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * Get a setting.
 *
 * @param {String} key Key of setting to get.
 */
export declare function getSetting(key: string): Promise<unknown>;
/**
 * Set a setting.
 *
 * @param {String} key Key of setting to set.
 * @param value Value to set key to.
 */
export declare function setSetting<T>(key: string, value: T): Promise<T>;
/**
 * Delete a setting.
 *
 * @param {String} key Key of setting to delete.
 */
export declare function deleteSetting(key: string): Promise<void>;
/**
 * Get an object of all tunnel settings
 * @return {string}
 */
export declare function getTunnelInfo(): Promise<string>;
//# sourceMappingURL=settings.d.ts.map