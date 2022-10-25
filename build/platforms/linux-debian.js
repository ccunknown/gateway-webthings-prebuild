"use strict";
/**
 * Debian platform interface.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinuxDebianPlatform = void 0;
const base_1 = __importDefault(require("./base"));
const linux_raspbian_1 = __importDefault(require("./linux-raspbian"));
class LinuxDebianPlatform extends base_1.default {
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
    getDhcpServerStatus() {
        return linux_raspbian_1.default.getDhcpServerStatus();
    }
    getHostname() {
        return linux_raspbian_1.default.getHostname();
    }
    getLanMode() {
        return linux_raspbian_1.default.getLanMode();
    }
    getMacAddress(device) {
        return linux_raspbian_1.default.getMacAddress(device);
    }
    getMdnsServerStatus() {
        return linux_raspbian_1.default.getMdnsServerStatus();
    }
    getNetworkAddresses() {
        return linux_raspbian_1.default.getNetworkAddresses();
    }
    getWirelessMode() {
        return linux_raspbian_1.default.getWirelessMode();
    }
    getValidTimezones() {
        return linux_raspbian_1.default.getValidTimezones();
    }
    getTimezone() {
        return linux_raspbian_1.default.getTimezone();
    }
    getValidWirelessCountries() {
        return linux_raspbian_1.default.getValidWirelessCountries();
    }
    getNtpStatus() {
        return linux_raspbian_1.default.getNtpStatus();
    }
}
exports.LinuxDebianPlatform = LinuxDebianPlatform;
exports.default = new LinuxDebianPlatform();
//# sourceMappingURL=linux-debian.js.map