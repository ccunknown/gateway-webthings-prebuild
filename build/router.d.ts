/**
 * Router.
 *
 * Configure web app routes.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import express from 'express';
/**
 * Router.
 */
declare class Router {
    private proxyController;
    constructor();
    /**
     * Configure web app routes.
     */
    configure(app: express.Application): void;
    addProxyServer(thingId: string, server: string): void;
    removeProxyServer(thingId: string): void;
}
declare const _default: Router;
export default _default;
//# sourceMappingURL=router.d.ts.map