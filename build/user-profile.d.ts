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
declare const _default: {
    baseDir: string;
    configDir: string;
    dataDir: string;
    sslDir: string;
    uploadsDir: string;
    mediaDir: string;
    logDir: string;
    gatewayDir: string;
    addonsDir: string;
};
export default _default;
//# sourceMappingURL=user-profile.d.ts.map