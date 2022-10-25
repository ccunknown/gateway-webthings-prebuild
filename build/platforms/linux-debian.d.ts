/**
 * Debian platform interface.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import BasePlatform from './base';
import { LanMode, NetworkAddresses, SelfUpdateStatus, WirelessMode } from './types';
export declare class LinuxDebianPlatform extends BasePlatform {
    /**
     * Determine whether or not the gateway can auto-update itself.
     *
     * @returns {Object} {available: <bool>, enabled: <bool>}
     */
    getSelfUpdateStatus(): SelfUpdateStatus;
    getDhcpServerStatus(): boolean;
    getHostname(): string;
    getLanMode(): LanMode;
    getMacAddress(device: string): string | null;
    getMdnsServerStatus(): boolean;
    getNetworkAddresses(): NetworkAddresses;
    getWirelessMode(): WirelessMode;
    getValidTimezones(): string[];
    getTimezone(): string;
    getValidWirelessCountries(): string[];
    getNtpStatus(): boolean;
}
declare const _default: LinuxDebianPlatform;
export default _default;
//# sourceMappingURL=linux-debian.d.ts.map