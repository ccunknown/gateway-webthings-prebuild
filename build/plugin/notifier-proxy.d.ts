/**
 * @module NotifierProxy base class.
 *
 * Manages Notifier data model and business logic.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Deferred from '../deferred';
import { Notifier } from 'gateway-addon';
import { OutletDescription } from 'gateway-addon/lib/schema';
import { AddonManager } from '../addon-manager';
import Plugin from './plugin';
/**
 * Class used to describe a notifier from the perspective of the gateway.
 */
export default class NotifierProxy extends Notifier {
    private plugin;
    unloadCompletedPromise: Deferred<void, void> | null;
    constructor(addonManager: AddonManager, notifierId: string, name: string, packageName: string, plugin: Plugin);
    sendMsg(methodType: number, data: Record<string, unknown>, deferred?: Deferred<unknown, unknown>): void;
    /**
     * Unloads a notifier.
     *
     * @returns a promise which resolves when the notifier has finished unloading.
     */
    unload(): Promise<void>;
    addOutlet(outletId: string, outletDescription: OutletDescription): void;
}
//# sourceMappingURL=notifier-proxy.d.ts.map