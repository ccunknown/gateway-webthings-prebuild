/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Trigger, { TriggerDescription } from './Trigger';
export interface TimeTriggerDescription extends TriggerDescription {
    time: string;
    localized: boolean;
}
/**
 * An abstract class for triggers whose input is a single property
 */
export default class TimeTrigger extends Trigger {
    private time;
    private localized;
    private timeout;
    private _sendOn;
    private _sendOff;
    constructor(desc: TimeTriggerDescription);
    /**
     * @return {TriggerDescription}
     */
    toDescription(): TimeTriggerDescription;
    start(): Promise<void>;
    scheduleNext(): void;
    sendOn(): void;
    sendOff(): void;
    stop(): void;
}
//# sourceMappingURL=TimeTrigger.d.ts.map