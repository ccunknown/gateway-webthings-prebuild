/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Property, { PropertyDescription } from '../Property';
import Trigger, { TriggerDescription } from './Trigger';
export interface PropertyTriggerDescription extends TriggerDescription {
    property: PropertyDescription;
}
/**
 * An abstract class for triggers whose input is a single property
 */
export default class PropertyTrigger extends Trigger {
    protected property: Property;
    private _onValueChanged;
    constructor(desc: PropertyTriggerDescription);
    /**
     * @return {TriggerDescription}
     */
    toDescription(): PropertyTriggerDescription;
    start(): Promise<void>;
    onValueChanged(_value: unknown): void;
    stop(): void;
}
//# sourceMappingURL=PropertyTrigger.d.ts.map