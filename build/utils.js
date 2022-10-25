"use strict";
/**
 * Various utilities.
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
exports.isW3CThingDescription = exports.getGatewayUserAgent = exports.escapeHtml = exports.hashFile = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const Platform = __importStar(require("./platform"));
const package_json_1 = __importDefault(require("./package.json"));
/**
 * Compute a SHA-256 checksum of a file.
 *
 * @param {String} fname File path
 * @returns A checksum as a lower case hex string.
 */
function hashFile(fname) {
    const hash = crypto_1.default.createHash('sha256');
    let fd;
    try {
        fd = fs_1.default.openSync(fname, 'r');
        const buffer = new Uint8Array(4096);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const bytes = fs_1.default.readSync(fd, buffer, 0, 4096, null);
            if (bytes <= 0) {
                break;
            }
            hash.update(buffer.slice(0, bytes));
        }
    }
    catch (e) {
        console.error(e);
        return null;
    }
    finally {
        if (fd) {
            fs_1.default.closeSync(fd);
        }
    }
    return hash.digest('hex').toLowerCase();
}
exports.hashFile = hashFile;
/**
 * Escape text such that it's safe to be placed in HTML.
 */
function escapeHtml(text) {
    if (typeof text !== 'string') {
        text = `${text}`;
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
exports.escapeHtml = escapeHtml;
function getGatewayUserAgent() {
    const primary = `webthings-gateway/${package_json_1.default.version}`;
    const secondary = `(${Platform.getArchitecture()}; ${Platform.getOS()})`;
    const tertiary = Platform.isContainer() ? ' (container)' : '';
    return `${primary} ${secondary}${tertiary}`;
}
exports.getGatewayUserAgent = getGatewayUserAgent;
function isW3CThingDescription(thingDescription) {
    if (typeof thingDescription['@context'] === 'string') {
        return (thingDescription['@context'] === 'https://www.w3.org/2019/wot/td/v1' ||
            thingDescription['@context'] === 'http://www.w3.org/ns/td');
    }
    if (Array.isArray(thingDescription['@context'])) {
        return (thingDescription['@context'].includes('https://www.w3.org/2019/wot/td/v1') ||
            thingDescription['@context'].includes('http://www.w3.org/ns/td'));
    }
    return false;
}
exports.isW3CThingDescription = isW3CThingDescription;
//# sourceMappingURL=utils.js.map