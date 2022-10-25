/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Trigger, { TriggerDescription } from './Trigger';
export interface MultiTriggerDescription extends TriggerDescription {
    op: string;
    triggers: TriggerDescription[];
}
/**
 * A Trigger which activates only when a set of triggers are activated
 */
export default class MultiTrigger extends Trigger {
    private op;
    private triggers;
    private id?;
    private states;
    private state;
    /**
     * @param {TriggerDescription} desc
     */
    constructor(desc: MultiTriggerDescription);
    /**
     * @return {TriggerDescription}
     */
    toDescription(): MultiTriggerDescription;
    start(): Promise<void>;
    stop(): void;
    onStateChanged(triggerIndex: number, state: Record<string, unknown>): void;
}
//# sourceMappingURL=MultiTrigger.d.ts.map