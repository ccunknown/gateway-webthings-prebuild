"use strict";
/**
 * Platform-specific utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.implemented = exports.getNtpStatus = exports.restartNtpSync = exports.setWirelessCountry = exports.getWirelessCountry = exports.getValidWirelessCountries = exports.setTimezone = exports.getTimezone = exports.getValidTimezones = exports.setSelfUpdateStatus = exports.getSelfUpdateStatus = exports.scanWirelessNetworks = exports.restartSystem = exports.restartGateway = exports.setWirelessMode = exports.getWirelessMode = exports.setSshServerStatus = exports.getSshServerStatus = exports.getNetworkAddresses = exports.setMdnsServerStatus = exports.getMdnsServerStatus = exports.getMacAddress = exports.setLanMode = exports.getLanMode = exports.setHostname = exports.getHostname = exports.setDhcpServerStatus = exports.getDhcpServerStatus = exports.getPythonVersions = exports.getNodeVersion = exports.isContainer = exports.getArchitecture = exports.getOS = void 0;
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const base_1 = __importStar(require("./platforms/base"));
const darwin_1 = __importDefault(require("./platforms/darwin"));
const linux_arch_1 = __importDefault(require("./platforms/linux-arch"));
const linux_debian_1 = __importDefault(require("./platforms/linux-debian"));
const linux_raspbian_1 = __importDefault(require("./platforms/linux-raspbian"));
const linux_ubuntu_1 = __importDefault(require("./platforms/linux-ubuntu"));
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
function getOS() {
    const platform = process.platform;
    if (platform !== 'linux') {
        return platform;
    }
    const proc = child_process_1.default.spawnSync('lsb_release', ['-i', '-s']);
    if (proc.status === 0) {
        const lsb_release = proc.stdout.toString().trim();
        switch (lsb_release) {
            case 'Arch':
                return 'linux-arch';
            case 'Debian':
                return 'linux-debian';
            case 'Raspbian':
                return 'linux-raspbian';
            case 'Ubuntu':
                return 'linux-ubuntu';
            default:
                break;
        }
    }
    return 'linux-unknown';
}
exports.getOS = getOS;
/**
 * Get the current architecture as "os-machine", i.e. darwin-x64.
 */
function getArchitecture() {
    return `${process.platform}-${process.arch}`;
}
exports.getArchitecture = getArchitecture;
/**
 * Determine whether or not we're running inside a container (e.g. Docker).
 */
function isContainer() {
    return (fs_1.default.existsSync('/.dockerenv') ||
        fs_1.default.existsSync('/run/.containerenv') ||
        (fs_1.default.existsSync('/proc/1/cgroup') &&
            fs_1.default.readFileSync('/proc/1/cgroup').indexOf(':/docker/') >= 0) ||
        fs_1.default.existsSync('/pantavisor'));
}
exports.isContainer = isContainer;
/**
 * Get the current node version.
 */
function getNodeVersion() {
    return process.config.variables.node_module_version;
}
exports.getNodeVersion = getNodeVersion;
/**
 * Get a list of installed Python versions.
 */
function getPythonVersions() {
    const versions = new Set();
    const parse = (output) => {
        const parts = output.split(' ');
        if (parts.length === 2) {
            const match = parts[1].match(/^\d+\.\d+/);
            if (match) {
                versions.add(match[0]);
            }
        }
    };
    for (const bin of ['python', 'python2', 'python3']) {
        const proc = child_process_1.default.spawnSync(bin, ['--version'], { encoding: 'utf8' });
        if (proc.status === 0) {
            const output = proc.stdout || proc.stderr;
            parse(output);
        }
    }
    return Array.from(versions).sort();
}
exports.getPythonVersions = getPythonVersions;
// Wrap platform-specific methods
function wrapPlatform(platform, fn) {
    return (...params) => {
        if (platform === null) {
            throw new base_1.NotImplementedError(fn);
        }
        return platform[fn](...params);
    };
}
let platform;
switch (getOS()) {
    case 'darwin':
        platform = darwin_1.default;
        break;
    case 'linux-arch':
        platform = linux_arch_1.default;
        break;
    case 'linux-debian':
        platform = linux_debian_1.default;
        break;
    case 'linux-raspbian':
        platform = linux_raspbian_1.default;
        break;
    case 'linux-ubuntu':
        platform = linux_ubuntu_1.default;
        break;
    default:
        platform = null;
        break;
}
exports.getDhcpServerStatus = wrapPlatform(platform, 'getDhcpServerStatus');
exports.setDhcpServerStatus = wrapPlatform(platform, 'setDhcpServerStatus');
exports.getHostname = wrapPlatform(platform, 'getHostname');
exports.setHostname = wrapPlatform(platform, 'setHostname');
exports.getLanMode = wrapPlatform(platform, 'getLanMode');
exports.setLanMode = wrapPlatform(platform, 'setLanMode');
exports.getMacAddress = wrapPlatform(platform, 'getMacAddress');
exports.getMdnsServerStatus = wrapPlatform(platform, 'getMdnsServerStatus');
exports.setMdnsServerStatus = wrapPlatform(platform, 'setMdnsServerStatus');
exports.getNetworkAddresses = wrapPlatform(platform, 'getNetworkAddresses');
exports.getSshServerStatus = wrapPlatform(platform, 'getSshServerStatus');
exports.setSshServerStatus = wrapPlatform(platform, 'setSshServerStatus');
exports.getWirelessMode = wrapPlatform(platform, 'getWirelessMode');
exports.setWirelessMode = wrapPlatform(platform, 'setWirelessMode');
exports.restartGateway = wrapPlatform(platform, 'restartGateway');
exports.restartSystem = wrapPlatform(platform, 'restartSystem');
exports.scanWirelessNetworks = wrapPlatform(platform, 'scanWirelessNetworks');
exports.getSelfUpdateStatus = wrapPlatform(platform, 'getSelfUpdateStatus');
exports.setSelfUpdateStatus = wrapPlatform(platform, 'setSelfUpdateStatus');
exports.getValidTimezones = wrapPlatform(platform, 'getValidTimezones');
exports.getTimezone = wrapPlatform(platform, 'getTimezone');
exports.setTimezone = wrapPlatform(platform, 'setTimezone');
exports.getValidWirelessCountries = wrapPlatform(platform, 'getValidWirelessCountries');
exports.getWirelessCountry = wrapPlatform(platform, 'getWirelessCountry');
exports.setWirelessCountry = wrapPlatform(platform, 'setWirelessCountry');
exports.restartNtpSync = wrapPlatform(platform, 'restartNtpSync');
const getNtpStatus = () => {
    if (isContainer()) {
        return true;
    }
    return wrapPlatform(platform, 'getNtpStatus')();
};
exports.getNtpStatus = getNtpStatus;
const implemented = (fn) => {
    if (platform === null) {
        return false;
    }
    const base = new base_1.default();
    return (base[fn] !=
        platform[fn]);
};
exports.implemented = implemented;
//# sourceMappingURL=platform.js.map