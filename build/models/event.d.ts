/**
 * Event Model.
 *
 * Manages Event data model
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Any } from 'gateway-addon/lib/schema';
export interface EventDescription {
    data: Any;
    timestamp: string;
}
export default class Event {
    private name;
    private data;
    private thingId;
    private timestamp;
    /**
     * Create a new Event
     * @param {String} name
     * @param {*} data
     * @param {String} thingId
     * @param {String?} timestamp
     */
    constructor(name: string, data: Any | undefined, thingId: string, timestamp?: string);
    getDescription(): EventDescription;
    getName(): string;
    getThingId(): string;
    setThingId(thingId: string): void;
    getData(): Any;
}
//# sourceMappingURL=event.d.ts.map