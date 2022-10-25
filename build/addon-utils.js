"use strict";
/**
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
exports.loadManifest = void 0;
const find_1 = __importDefault(require("find"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
const user_profile_1 = __importDefault(require("./user-profile"));
const Utils = __importStar(require("./utils"));
const package_json_1 = __importDefault(require("./package.json"));
const MANIFEST_VERSION = 1;
// Setting this flag will force every file present in an add-on's directory to
// have a checksum in the SHA256SUMS file. However, several add-ons currently
// write files directly into their directories. When we resolve all of those
// issues, this flag can be flipped.
const ENFORCE_STRICT_SHA_CHECK = false;
/**
 * Verify one level of an object, recursing as required.
 *
 * @param {string} prefix - Prefix to use for keys, e.g. level1.level2.
 * @param {object} obj - Object to validate
 * @param {object} template - Template to validate against
 *
 * @returns {string|null} Error string, or null if no error.
 */
function validateObject(prefix, obj, template) {
    for (const key in template) {
        if (key in obj) {
            const objectVal = obj[key];
            const templateVal = template[key];
            if (typeof objectVal !== typeof templateVal) {
                // eslint-disable-next-line max-len
                return `Expecting ${prefix}${key} to have type: ${typeof templateVal}, found: ${typeof objectVal}`;
            }
            if (typeof objectVal === 'object') {
                if (Array.isArray(objectVal)) {
                    if (templateVal.length > 0) {
                        const expectedType = typeof templateVal[0];
                        for (const val of objectVal) {
                            if (typeof val !== expectedType) {
                                return `Expecting all values in ${prefix}${key} to be of type ${expectedType}`;
                            }
                        }
                    }
                }
                else {
                    const err = validateObject(`${prefix + key}.`, objectVal, templateVal);
                    if (err) {
                        return err;
                    }
                }
            }
        }
        else {
            return `Manifest is missing: ${prefix}${key}`;
        }
    }
    return null;
}
/**
 * Verify that a manifest.json looks valid. We only need to validate fields
 * which we actually use.
 *
 * @param {object} manifest - The parsed manifest.json manifest
 *
 * @returns {string|null} Error string, or null if no error.
 */
function validateManifestJson(manifest) {
    const manifestTemplate = {
        author: '',
        description: '',
        gateway_specific_settings: {
            webthings: {
                primary_type: '',
                exec: '',
            },
        },
        homepage_url: '',
        id: '',
        license: '',
        manifest_version: 0,
        name: '',
        version: '',
    };
    // Since we're trying to use a field before full validation, make sure it
    // exists first.
    if (typeof manifest.gateway_specific_settings !== 'object' ||
        !manifest.gateway_specific_settings ||
        typeof manifest.gateway_specific_settings.webthings !== 'object' ||
        !manifest.gateway_specific_settings.webthings ||
        !(manifest.gateway_specific_settings.webthings).primary_type) {
        return ('Expecting manifest.gateway_specific_settings.webthings.primary_type to have type: ' +
            'string, found: undefined');
    }
    if ((manifest.gateway_specific_settings.webthings).primary_type !== 'extension') {
        // If we're not using in-process plugins, and this is not an extension,
        // then we also need the exec keyword to exist.
        manifestTemplate.gateway_specific_settings.webthings.exec = '';
    }
    return validateObject('', manifest, manifestTemplate);
}
/**
 * Load an add-on manifest from a manifest.json file.
 *
 * @param {string} packageId - The ID of the package, e.g. example-adapter
 *
 * @returns {object[]} 2-value array containing a parsed manifest and a default
 *                     config object.
 */
function loadManifestJson(packageId) {
    const addonPath = path_1.default.join(user_profile_1.default.addonsDir, packageId);
    // Read the package.json file.
    let data;
    try {
        data = fs_1.default.readFileSync(path_1.default.join(addonPath, 'manifest.json'), 'utf8');
    }
    catch (e) {
        throw new Error(`Failed to read manifest.json for add-on ${packageId}: ${e}`);
    }
    // Parse as JSON
    let manifest;
    try {
        manifest = JSON.parse(data);
    }
    catch (e) {
        throw new Error(`Failed to parse manifest.json for add-on: ${packageId}: ${e}`);
    }
    // First, verify manifest version.
    if (manifest.manifest_version !== MANIFEST_VERSION) {
        throw new Error(`Manifest version ${manifest.manifest_version} for add-on ${packageId} does not match ` +
            `expected version ${MANIFEST_VERSION}`);
    }
    // Verify that the id in the package matches the packageId
    if (manifest.id != packageId) {
        const err = `ID from manifest .json "${manifest.id}" doesn't ` +
            `match the ID from list.json "${packageId}"`;
        throw new Error(err);
    }
    // If the add-on is not a git repository, check the SHA256SUMS file.
    if (!fs_1.default.existsSync(path_1.default.join(addonPath, '.git'))) {
        const sumsFile = path_1.default.resolve(path_1.default.join(addonPath, 'SHA256SUMS'));
        if (fs_1.default.existsSync(sumsFile)) {
            const sums = new Map();
            try {
                const data = fs_1.default.readFileSync(sumsFile, 'utf8');
                const lines = data.trim().split(/\r?\n/);
                for (const line of lines) {
                    const checksum = line.slice(0, 64);
                    let filename = line.slice(64).trimLeft();
                    if (filename.startsWith('*')) {
                        filename = filename.substring(1);
                    }
                    filename = path_1.default.resolve(path_1.default.join(addonPath, filename));
                    if (!fs_1.default.existsSync(filename)) {
                        throw new Error(`File ${filename} missing for add-on ${packageId}`);
                    }
                    sums.set(filename, checksum);
                }
            }
            catch (e) {
                throw new Error(`Failed to read SHA256SUMS for add-on ${packageId}: ${e}`);
            }
            find_1.default.fileSync(addonPath).forEach((fname) => {
                fname = path_1.default.resolve(fname);
                if (fname === sumsFile) {
                    return;
                }
                if (!sums.has(fname)) {
                    if (ENFORCE_STRICT_SHA_CHECK) {
                        throw new Error(`No checksum found for file ${fname} in add-on ${packageId}`);
                    }
                    else {
                        return;
                    }
                }
                if (Utils.hashFile(fname) !== sums.get(fname)) {
                    throw new Error(`Checksum failed for file ${fname} in add-on ${packageId}`);
                }
            });
        }
        else if (process.env.NODE_ENV !== 'test') {
            throw new Error(`SHA256SUMS file missing for add-on ${packageId}`);
        }
    }
    // Verify that important fields exist in the manifest
    const err = validateManifestJson(manifest);
    if (err) {
        throw new Error(`Error found in manifest for add-on ${packageId}: ${err}`);
    }
    // Verify gateway version.
    let min = manifest.gateway_specific_settings.webthings.strict_min_version;
    let max = manifest.gateway_specific_settings.webthings.strict_max_version;
    if (typeof min === 'string' && min !== '*') {
        min = semver_1.default.coerce(min);
        if (semver_1.default.lt(package_json_1.default.version, min)) {
            throw new Error(
            // eslint-disable-next-line max-len
            `Gateway version ${package_json_1.default.version} is lower than minimum version ${min} supported by add-on ${packageId}`);
        }
    }
    if (typeof max === 'string' && max !== '*') {
        max = semver_1.default.coerce(max);
        if (semver_1.default.gt(package_json_1.default.version, max)) {
            throw new Error(
            // eslint-disable-next-line max-len
            `Gateway version ${package_json_1.default.version} is higher than maximum version ${max} supported by add-on ${packageId}`);
        }
    }
    const obj = {
        id: manifest.id,
        author: manifest.author,
        name: manifest.name,
        description: manifest.description,
        homepage_url: manifest.homepage_url,
        version: manifest.version,
        primary_type: manifest.gateway_specific_settings.webthings.primary_type,
        exec: manifest.gateway_specific_settings.webthings.exec,
        content_scripts: manifest.content_scripts,
        web_accessible_resources: manifest.web_accessible_resources,
        enabled: false,
    };
    let cfg = {};
    if (manifest.hasOwnProperty('options')) {
        if (manifest.options.hasOwnProperty('default')) {
            cfg = manifest.options.default;
        }
        if (manifest.options.hasOwnProperty('schema')) {
            obj.schema = manifest.options.schema;
        }
    }
    if (manifest.gateway_specific_settings.webthings.enabled) {
        obj.enabled = true;
    }
    return [obj, cfg];
}
/**
 * Load the manifest for a given package.
 *
 * @param {string} packageId - The ID of the package, e.g. example-adapter
 *
 * @returns {object[]} 2-value array containing a parsed manifest and a default
 *                     config object.
 */
function loadManifest(packageId) {
    const addonPath = path_1.default.join(user_profile_1.default.addonsDir, packageId);
    if (fs_1.default.existsSync(path_1.default.join(addonPath, 'manifest.json'))) {
        return loadManifestJson(packageId);
    }
    throw new Error(`No manifest found for add-on ${packageId}`);
}
exports.loadManifest = loadManifest;
//# sourceMappingURL=addon-utils.js.map