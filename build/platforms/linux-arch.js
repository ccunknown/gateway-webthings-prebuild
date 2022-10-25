"use strict";
/**
 * Arch Linux platform interface.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
class LinuxArchPlatform extends base_1.default {
    /**
     * Get the system's hostname.
     *
     * @returns {string} The hostname.
     */
    getHostname() {
        return fs_1.default.readFileSync('/etc/hostname', 'utf8').trim();
    }
    /**
     * Get the MAC address of a network device.
     *
     * @param {string} device - The network device, e.g. wlan0
     * @returns {string|null} MAC address, or null on error
     */
    getMacAddress(device) {
        const addrFile = `/sys/class/net/${device}/address`;
        if (!fs_1.default.existsSync(addrFile)) {
            return null;
        }
        return fs_1.default.readFileSync(addrFile, 'utf8').trim();
    }
    /**
     * Determine whether or not the gateway can auto-update itself.
     *
     * @returns {Object} {available: <bool>, enabled: <bool>}
     */
    getSelfUpdateStatus() {
        return {
            available: false,
            enabled: false,
        };
    }
    /**
     * Get a list of all valid timezones for the system.
     *
     * @returns {string[]} List of timezones.
     */
    getValidTimezones() {
        const tzdata = '/usr/share/zoneinfo/zone.tab';
        if (!fs_1.default.existsSync(tzdata)) {
            return [];
        }
        try {
            const data = fs_1.default.readFileSync(tzdata, 'utf8');
            const zones = data
                .split('\n')
                .filter((l) => !l.startsWith('#') && l.length > 0)
                .map((l) => l.split(/\s+/g)[2])
                .sort();
            return zones;
        }
        catch (e) {
            console.error('Failed to read zone file:', e);
        }
        return [];
    }
    /**
     * Get the current timezone.
     *
     * @returns {string} Name of timezone.
     */
    getTimezone() {
        const proc = child_process_1.default.spawnSync('timedatectl', ['status'], { encoding: 'utf8' });
        if (proc.status !== 0) {
            return '';
        }
        const lines = proc.stdout.split('\n').map((l) => l.trim());
        const zone = lines.find((l) => l.startsWith('Time zone:'));
        if (!zone) {
            return '';
        }
        return zone.split(':')[1].split('(')[0].trim();
    }
    /**
     * Get a list of all valid wi-fi countries for the system.
     *
     * @returns {string[]} List of countries.
     */
    getValidWirelessCountries() {
        const fname = '/usr/share/zoneinfo/iso3166.tab';
        if (!fs_1.default.existsSync(fname)) {
            return [];
        }
        try {
            const data = fs_1.default.readFileSync(fname, 'utf8');
            const zones = data
                .split('\n')
                .filter((l) => !l.startsWith('#') && l.length > 0)
                .map((l) => l.split('\t')[1])
                .sort();
            return zones;
        }
        catch (e) {
            console.error('Failed to read zone file:', e);
        }
        return [];
    }
    /**
     * Get the NTP synchronization status.
     *
     * @returns {boolean} Boolean indicating whether or not the time has been
     *                    synchronized.
     */
    getNtpStatus() {
        const proc = child_process_1.default.spawnSync('timedatectl', ['status'], { encoding: 'utf8' });
        if (proc.status !== 0) {
            return false;
        }
        const lines = proc.stdout.split('\n').map((l) => l.trim());
        const status = lines.find((l) => l.startsWith('System clock synchronized:'));
        if (!status) {
            return false;
        }
        return status.split(':')[1].trim() === 'yes';
    }
}
exports.default = new LinuxArchPlatform();
//# sourceMappingURL=linux-arch.js.map