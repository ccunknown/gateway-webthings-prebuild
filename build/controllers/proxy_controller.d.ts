/**
 * Proxy Controller.
 *
 * Handles proxied resources.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import express from 'express';
export interface WithProxyMethods {
    addProxyServer: (thingId: string, server: string) => void;
    removeProxyServer: (thingId: string) => void;
}
declare function build(): express.Router & WithProxyMethods;
export default build;
//# sourceMappingURL=proxy_controller.d.ts.map