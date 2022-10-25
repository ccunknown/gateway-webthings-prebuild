/**
 * Push Service.
 *
 * Manage the Push Service for notifications
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import WebPush from 'web-push';
declare class PushService {
    private enabled;
    constructor();
    /**
     * Initialize the Push Service, generating and storing a VAPID keypair
     * if necessary.
     */
    init(tunnelDomain: string): Promise<void>;
    getVAPIDKeys(): Promise<WebPush.VapidKeys | null>;
    createPushSubscription(subscription: WebPush.PushSubscription): Promise<number>;
    broadcastNotification(message: string): Promise<void>;
}
declare const _default: PushService;
export default _default;
//# sourceMappingURL=push-service.d.ts.map