"use strict";
/**
 * Raspbian platform interface.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedError = void 0;
class NotImplementedError extends Error {
    constructor(fn) {
        super(`Method not implemented for platform: ${fn}`);
    }
}
exports.NotImplementedError = NotImplementedError;
class BasePlatform {
    /**
     * Get DHCP server status.
     *
     * @returns {boolean} Boolean indicating whether or not DHCP is enabled.
     */
    getDhcpServerStatus() {
        throw new NotImplementedError('getDhcpServerStatus');
    }
    /**
     * Set DHCP server status.
     *
     * @param {boolean} enabled - Whether or not to enable the DHCP server
     * @returns {boolean} Boolean indicating success of the command.
     */
    setDhcpServerStatus(_enabled) {
        throw new NotImplementedError('setDhcpServerStatus');
    }
    /**
     * Get the LAN mode and options.
     *
     * @returns {Object} {mode: 'static|dhcp|...', options: {...}}
     */
    getLanMode() {
        throw new NotImplementedError('getLanMode');
    }
    /**
     * Set the LAN mode and options.
     *
     * @param {string} mode - static, dhcp, ...
     * @param {Object?} options - options specific to LAN mode
     * @returns {boolean} Boolean indicating success.
     */
    setLanMode(_mode, _options = {}) {
        throw new NotImplementedError('setLanMode');
    }
    /**
     * Get the wireless mode and options.
     *
     * @returns {Object} {enabled: true|false, mode: 'ap|sta|...', options: {...}}
     */
    getWirelessMode() {
        throw new NotImplementedError('getWirelessMode');
    }
    /**
     * Set the wireless mode and options.
     *
     * @param {boolean} enabled - whether or not wireless is enabled
     * @param {string} mode - ap, sta, ...
     * @param {Object?} options - options specific to wireless mode
     * @returns {boolean} Boolean indicating success.
     */
    setWirelessMode(_enabled, _mode = 'ap', _options = {}) {
        throw new NotImplementedError('setWirelessMode');
    }
    /**
     * Get SSH server status.
     *
     * @returns {boolean} Boolean indicating whether or not SSH is enabled.
     */
    getSshServerStatus() {
        throw new NotImplementedError('getSshServerStatus');
    }
    /**
     * Set SSH server status.
     *
     * @param {boolean} enabled - Whether or not to enable the SSH server
     * @returns {boolean} Boolean indicating success of the command.
     */
    setSshServerStatus(_enabled) {
        throw new NotImplementedError('setSshServerStatus');
    }
    /**
     * Get mDNS server status.
     *
     * @returns {boolean} Boolean indicating whether or not mDNS is enabled.
     */
    getMdnsServerStatus() {
        throw new NotImplementedError('getMdnsServerStatus');
    }
    /**
     * Set mDNS server status.
     *
     * @param {boolean} enabled - Whether or not to enable the mDNS server
     * @returns {boolean} Boolean indicating success of the command.
     */
    setMdnsServerStatus(_enabled) {
        throw new NotImplementedError('setMdnsServerStatus');
    }
    /**
     * Get the system's hostname.
     *
     * @returns {string} The hostname.
     */
    getHostname() {
        throw new NotImplementedError('getHostname');
    }
    /**
     * Set the system's hostname.
     *
     * @param {string} hostname - The hostname to set
     * @returns {boolean} Boolean indicating success of the command.
     */
    setHostname(_hostname) {
        throw new NotImplementedError('setHostname');
    }
    /**
     * Restart the gateway process.
     *
     * @returns {boolean} Boolean indicating success of the command.
     */
    restartGateway() {
        throw new NotImplementedError('restartGateway');
    }
    /**
     * Restart the system.
     *
     * @returns {boolean} Boolean indicating success of the command.
     */
    restartSystem() {
        throw new NotImplementedError('restartSystem');
    }
    /**
     * Get the MAC address of a network device.
     *
     * @param {string} device - The network device, e.g. wlan0
     * @returns {string|null} MAC address, or null on error
     */
    getMacAddress(_device) {
        throw new NotImplementedError('getMacAddress');
    }
    /**
     * Scan for visible wireless networks.
     *
     * @returns {Object[]} List of networks as objects:
     *                     [
     *                       {
     *                         ssid: '...',
     *                         quality: <number>,
     *                         encryption: true|false,
     *                       },
     *                       ...
     *                     ]
     */
    scanWirelessNetworks() {
        throw new NotImplementedError('scanWirelessNetworks');
    }
    /**
     * Get the current addresses for Wi-Fi and LAN.
     *
     * @returns {Object} Address object:
     *                   {
     *                     lan: '...',
     *                     wlan: {
     *                       ip: '...',
     *                       ssid: '...',
     *                     }
     *                   }
     */
    getNetworkAddresses() {
        throw new NotImplementedError('getNetworkAddresses');
    }
    /**
     * Determine whether or not the gateway can auto-update itself.
     *
     * @returns {Object} {available: <bool>, enabled: <bool>}
     */
    getSelfUpdateStatus() {
        throw new NotImplementedError('getSelfUpdateStatus');
    }
    /**
     * Enable/disable auto-updates.
     *
     * @param {boolean} enabled - Whether or not to enable auto-updates.
     * @returns {boolean} Boolean indicating success of the command.
     */
    setSelfUpdateStatus(_enabled) {
        throw new NotImplementedError('setSelfUpdateStatus');
    }
    /**
     * Get a list of all valid timezones for the system.
     *
     * @returns {string[]} List of timezones.
     */
    getValidTimezones() {
        throw new NotImplementedError('getValidTimezones');
    }
    /**
     * Get the current timezone.
     *
     * @returns {string} Name of timezone.
     */
    getTimezone() {
        throw new NotImplementedError('getTimezone');
    }
    /**
     * Set the current timezone.
     *
     * @param {string} zone - The timezone to set
     * @returns {boolean} Boolean indicating success of the command.
     */
    setTimezone(_zone) {
        throw new NotImplementedError('setTimezone');
    }
    /**
     * Get a list of all valid wi-fi countries for the system.
     *
     * @returns {string[]} List of countries.
     */
    getValidWirelessCountries() {
        throw new NotImplementedError('getValidWirelessCountries');
    }
    /**
     * Get the wi-fi country code.
     *
     * @returns {string} Country.
     */
    getWirelessCountry() {
        throw new NotImplementedError('getWirelessCountry');
    }
    /**
     * Set the wi-fi country code.
     *
     * @param {string} country - The country to set
     * @returns {boolean} Boolean indicating success of the command.
     */
    setWirelessCountry(_country) {
        throw new NotImplementedError('setWirelessCountry');
    }
    /**
     * Get the NTP synchronization status.
     *
     * @returns {boolean} Boolean indicating whether or not the time has been
     *                    synchronized.
     */
    getNtpStatus() {
        throw new NotImplementedError('getNtpStatus');
    }
    /**
     * Restart the NTP sync service.
     *
     * @returns {boolean} Boolean indicating success of the command.
     */
    restartNtpSync() {
        throw new NotImplementedError('restartNtpSync');
    }
}
exports.default = BasePlatform;
//# sourceMappingURL=base.js.map