/**
 * DeviceProxy - Gateway side representation of a device when using
 *               an adapter plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Device, Property } from 'gateway-addon';
import { Any, Device as DeviceSchema } from 'gateway-addon/lib/schema';
import AdapterProxy from './adapter-proxy';
export default class DeviceProxy extends Device {
    private deviceDict;
    constructor(adapter: AdapterProxy, deviceDict: DeviceSchema);
    getAdapter(): AdapterProxy;
    asDict(): DeviceSchema;
    /**
     * @method requestAction
     */
    requestAction(actionId: string, actionName: string, input: Any): Promise<void>;
    /**
     * @method removeAction
     */
    removeAction(actionId: string, actionName: string): Promise<void>;
    notifyPropertyChanged(property: Property<Any>): void;
    actionNotify(action: unknown): void;
    eventNotify(event: unknown): void;
    connectedNotify(connected: boolean): void;
}
//# sourceMappingURL=device-proxy.d.ts.map