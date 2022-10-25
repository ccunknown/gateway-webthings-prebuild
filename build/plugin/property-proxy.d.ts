/**
 * PropertyProxy - Gateway side representation of a property
 *                 when using an adapter plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Any, Property as PropertySchema } from 'gateway-addon/lib/schema';
import { Property } from 'gateway-addon';
import DeviceProxy from './device-proxy';
export default class PropertyProxy extends Property<Any> {
    private propertyChangedPromises;
    private propertyDict;
    constructor(device: DeviceProxy, propertyName: string, propertyDict: PropertySchema);
    getDevice(): DeviceProxy;
    asDict(): PropertySchema;
    /**
     * @method onPropertyChanged
     * @returns a promise which is resoved when the next
     * propertyChanged notification is received.
     */
    onPropertyChanged(): Promise<Any>;
    /**
     * @method doPropertyChanged
     * Called whenever a property changed notification is received
     * from the adapter.
     */
    doPropertyChanged(propertyDict: PropertySchema): void;
    /**
     * @returns a promise which resolves to the updated value.
     *
     * @note it is possible that the updated value doesn't match
     * the value passed in.
     */
    setValue(value: Any): Promise<Any>;
}
//# sourceMappingURL=property-proxy.d.ts.map