/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface TriggerDescription {
    type: string;
    label?: string;
}
/**
 * The trigger component of a Rule which monitors some state and passes on
 * whether to be active to the Rule's effect
 */
export default class Trigger extends EventEmitter {
    private type;
    private label?;
    /**
     * Create a Trigger based on a wire-format description with a property
     * @param {TriggerDescription} desc
     */
    constructor(desc: TriggerDescription);
    /**
     * @return {TriggerDescription}
     */
    toDescription(): TriggerDescription;
    start(): Promise<void>;
    stop(): void;
}
//# sourceMappingURL=Trigger.d.ts.map