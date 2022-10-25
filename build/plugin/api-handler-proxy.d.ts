/**
 * @module APIHandlerProxy base class.
 *
 * Manages API handler data model and business logic.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Deferred from '../deferred';
import { APIHandler, APIRequest, APIResponse } from 'gateway-addon';
import { AddonManager } from '../addon-manager';
import Plugin from './plugin';
/**
 * Class used to describe an API handler from the perspective of the gateway.
 */
export default class APIHandlerProxy extends APIHandler {
    private plugin;
    unloadCompletedPromise: Deferred<void, void> | null;
    constructor(addonManager: AddonManager, packageName: string, plugin: Plugin);
    sendMsg(methodType: number, data: Record<string, unknown>, deferred?: Deferred<APIResponse, unknown>): void;
    handleRequest(request: APIRequest): Promise<APIResponse>;
    /**
     * Unloads the handler.
     *
     * @returns a promise which resolves when the handler has finished unloading.
     */
    unload(): Promise<void>;
}
//# sourceMappingURL=api-handler-proxy.d.ts.map