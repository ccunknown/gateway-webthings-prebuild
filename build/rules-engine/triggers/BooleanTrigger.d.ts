/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropertyTrigger, { PropertyTriggerDescription } from './PropertyTrigger';
export interface BooleanTriggerDescription extends PropertyTriggerDescription {
    onValue: boolean;
}
/**
 * A Trigger which activates when a boolean property is
 * equal to a given value, `onValue`
 */
export default class BooleanTrigger extends PropertyTrigger {
    private onValue;
    /**
     * @param {TriggerDescription} desc
     */
    constructor(desc: BooleanTriggerDescription);
    /**
     * @return {TriggerDescription}
     */
    toDescription(): BooleanTriggerDescription;
    /**
     * @param {boolean} propValue
     * @return {State}
     */
    onValueChanged(propValue: boolean): void;
}
//# sourceMappingURL=BooleanTrigger.d.ts.map