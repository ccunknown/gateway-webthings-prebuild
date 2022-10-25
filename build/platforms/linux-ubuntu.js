"use strict";
/**
 * Ubuntu platform interface.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const linux_debian_1 = require("./linux-debian");
class LinuxUbuntuPlatform extends linux_debian_1.LinuxDebianPlatform {
}
exports.default = new LinuxUbuntuPlatform();
//# sourceMappingURL=linux-ubuntu.js.map