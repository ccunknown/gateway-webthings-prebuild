/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Trigger, { TriggerDescription } from './Trigger';
declare type TriggerClass = {
    new (desc: any): Trigger;
};
export declare const triggers: Record<string, TriggerClass>;
/**
 * Produce an trigger from a serialized trigger description. Throws if `desc`
 * is invalid
 * @param {TriggerDescription} desc
 * @return {Trigger}
 */
export declare function fromDescription(desc: TriggerDescription): Trigger;
export {};
//# sourceMappingURL=index.d.ts.map