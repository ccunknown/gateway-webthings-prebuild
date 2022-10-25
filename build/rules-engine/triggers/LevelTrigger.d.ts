/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropertyTrigger, { PropertyTriggerDescription } from './PropertyTrigger';
export interface LevelTriggerDescription extends PropertyTriggerDescription {
    value: number;
    levelType: string;
}
/**
 * A trigger which activates when a numerical property is less or greater than
 * a given level
 */
export default class LevelTrigger extends PropertyTrigger {
    static types: Record<string, string>;
    private value;
    private levelType;
    /**
     * @param {TriggerDescription} desc
     */
    constructor(desc: LevelTriggerDescription);
    /**
     * @return {TriggerDescription}
     */
    toDescription(): LevelTriggerDescription;
    /**
     * @param {number} propValue
     * @return {State}
     */
    onValueChanged(propValue: number): void;
}
//# sourceMappingURL=LevelTrigger.d.ts.map