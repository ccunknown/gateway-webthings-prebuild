/**
 * Gateway tunnel service.
 *
 * Manages the tunnel service.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { Server } from 'https';
import express from 'express';
declare class TunnelService {
    private pagekiteProcess;
    private tunnelToken;
    private connected;
    private pingInterval;
    private renewInterval;
    private server;
    switchToHttps: (() => void) | null;
    constructor();
    isTunnelSet(_request: express.Request, response: express.Response, next: express.NextFunction): Promise<void>;
    setServerHandle(server: Server): void;
    start(response?: express.Response, urlredirect?: {
        url: string;
    }): void;
    stop(): void;
    hasCertificates(): boolean;
    hasTunnelToken(): Promise<boolean>;
    userSkipped(): Promise<boolean>;
    pingRegistrationServer(): void;
}
declare const _default: TunnelService;
export default _default;
//# sourceMappingURL=tunnel-service.d.ts.map