/**
 * Platform-specific utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LanMode, NetworkAddresses, SelfUpdateStatus, WirelessMode, WirelessNetwork } from './platforms/types';
/**
 * Get the OS the gateway is running on.
 *
 * @returns {string|null} String describing OS. Currently, one of:
 *                        * aix
 *                        * android
 *                        * darwin
 *                        * freebsd
 *                        * openbsd
 *                        * sunos
 *                        * win32
 *                        * linux-arch
 *                        * linux-debian
 *                        * linux-raspbian
 *                        * linux-ubuntu
 *                        * linux-unknown
 */
export declare function getOS(): string;
/**
 * Get the current architecture as "os-machine", i.e. darwin-x64.
 */
export declare function getArchitecture(): string;
/**
 * Determine whether or not we're running inside a container (e.g. Docker).
 */
export declare function isContainer(): boolean;
/**
 * Get the current node version.
 */
export declare function getNodeVersion(): number;
/**
 * Get a list of installed Python versions.
 */
export declare function getPythonVersions(): string[];
export declare const getDhcpServerStatus: (...params: any[]) => boolean;
export declare const setDhcpServerStatus: (...params: any[]) => boolean;
export declare const getHostname: (...params: any[]) => string;
export declare const setHostname: (...params: any[]) => boolean;
export declare const getLanMode: (...params: any[]) => LanMode;
export declare const setLanMode: (...params: any[]) => boolean;
export declare const getMacAddress: (...params: any[]) => string | null;
export declare const getMdnsServerStatus: (...params: any[]) => boolean;
export declare const setMdnsServerStatus: (...params: any[]) => boolean;
export declare const getNetworkAddresses: (...params: any[]) => NetworkAddresses;
export declare const getSshServerStatus: (...params: any[]) => boolean;
export declare const setSshServerStatus: (...params: any[]) => boolean;
export declare const getWirelessMode: (...params: any[]) => WirelessMode;
export declare const setWirelessMode: (...params: any[]) => boolean;
export declare const restartGateway: (...params: any[]) => boolean;
export declare const restartSystem: (...params: any[]) => boolean;
export declare const scanWirelessNetworks: (...params: any[]) => WirelessNetwork[];
export declare const getSelfUpdateStatus: (...params: any[]) => SelfUpdateStatus;
export declare const setSelfUpdateStatus: (...params: any[]) => boolean;
export declare const getValidTimezones: (...params: any[]) => string[];
export declare const getTimezone: (...params: any[]) => string;
export declare const setTimezone: (...params: any[]) => boolean;
export declare const getValidWirelessCountries: (...params: any[]) => string[];
export declare const getWirelessCountry: (...params: any[]) => string;
export declare const setWirelessCountry: (...params: any[]) => boolean;
export declare const restartNtpSync: (...params: any[]) => boolean;
export declare const getNtpStatus: () => boolean;
export declare const implemented: (fn: string) => boolean;
//# sourceMappingURL=platform.d.ts.map