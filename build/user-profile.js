"use strict";
/**
 * WebThings Gateway user profile.
 *
 * The user profile lives outside of the source tree to allow for things like
 * data persistence with Docker, as well as the ability to easily switch
 * profiles, if desired.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const path_1 = __importDefault(require("path"));
const baseDir = path_1.default.resolve(process.env.WEBTHINGS_HOME || config_1.default.get('profileDir'));
exports.default = {
    baseDir,
    configDir: path_1.default.join(baseDir, 'config'),
    dataDir: path_1.default.join(baseDir, 'data'),
    sslDir: path_1.default.join(baseDir, 'ssl'),
    uploadsDir: path_1.default.join(baseDir, 'uploads'),
    mediaDir: path_1.default.join(baseDir, 'media'),
    logDir: path_1.default.join(baseDir, 'log'),
    gatewayDir: path_1.default.resolve(path_1.default.join(__dirname, '..')),
    addonsDir: process.env.NODE_ENV === 'test'
        ? path_1.default.join(__dirname, 'addons-test')
        : path_1.default.join(baseDir, 'addons'),
};
//# sourceMappingURL=user-profile.js.map