/**
 * OutletProxy - Gateway side representation of an outlet when using
 *               a notifier plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Level, OutletDescription } from 'gateway-addon/lib/schema';
import { Outlet } from 'gateway-addon';
import NotifierProxy from './notifier-proxy';
export default class OutletProxy extends Outlet {
    constructor(notifier: NotifierProxy, outletDict: OutletDescription);
    notify(title: string, message: string, level: Level): Promise<void>;
}
//# sourceMappingURL=outlet-proxy.d.ts.map