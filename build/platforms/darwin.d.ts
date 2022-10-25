/**
 * Darwin (macOS) platform interface.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import BasePlatform from './base';
import { SelfUpdateStatus } from './types';
declare class DarwinPlatform extends BasePlatform {
    /**
     * Get mDNS server status.
     *
     * @returns {boolean} Boolean indicating whether or not mDNS is enabled.
     */
    getMdnsServerStatus(): boolean;
    /**
     * Set mDNS server status.
     *
     * @param {boolean} enabled - Whether or not to enable the mDNS server
     * @returns {boolean} Boolean indicating success of the command.
     */
    setMdnsServerStatus(enabled: boolean): boolean;
    /**
     * Get the system's hostname.
     *
     * @returns {string} The hostname.
     */
    getHostname(): string;
    /**
     * Determine whether or not the gateway can auto-update itself.
     *
     * @returns {Object} {available: <bool>, enabled: <bool>}
     */
    getSelfUpdateStatus(): SelfUpdateStatus;
    /**
     * Get a list of all valid timezones for the system.
     *
     * @returns {string[]} List of timezones.
     */
    getValidTimezones(): string[];
    /**
     * Get the current timezone.
     *
     * @returns {string} Name of timezone.
     */
    getTimezone(): string;
    /**
     * Get a list of all valid wi-fi countries for the system.
     *
     * @returns {string[]} List of countries.
     */
    getValidWirelessCountries(): string[];
}
declare const _default: DarwinPlatform;
export default _default;
//# sourceMappingURL=darwin.d.ts.map