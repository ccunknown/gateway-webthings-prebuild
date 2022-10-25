/**
 * Arch Linux platform interface.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import BasePlatform from './base';
import { SelfUpdateStatus } from './types';
declare class LinuxArchPlatform extends BasePlatform {
    /**
     * Get the system's hostname.
     *
     * @returns {string} The hostname.
     */
    getHostname(): string;
    /**
     * Get the MAC address of a network device.
     *
     * @param {string} device - The network device, e.g. wlan0
     * @returns {string|null} MAC address, or null on error
     */
    getMacAddress(device: string): string | null;
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
    /**
     * Get the NTP synchronization status.
     *
     * @returns {boolean} Boolean indicating whether or not the time has been
     *                    synchronized.
     */
    getNtpStatus(): boolean;
}
declare const _default: LinuxArchPlatform;
export default _default;
//# sourceMappingURL=linux-arch.d.ts.map