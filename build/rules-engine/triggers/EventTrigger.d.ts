/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Trigger, { TriggerDescription } from './Trigger';
import Event from '../../models/event';
export interface EventTriggerDescription extends TriggerDescription {
    thing: string;
    event: string;
}
/**
 * A trigger activated when an event occurs
 */
export default class EventTrigger extends Trigger {
    private thing;
    private event;
    private stopped;
    private _onEvent;
    constructor(desc: EventTriggerDescription);
    /**
     * @return {TriggerDescription}
     */
    toDescription(): EventTriggerDescription;
    start(): Promise<void>;
    onEvent(event: Event): void;
    stop(): void;
}
//# sourceMappingURL=EventTrigger.d.ts.map