/**
 * Events.
 *
 * Manages a collection of Events.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Event, { EventDescription } from './event';
declare class Events {
    private events;
    constructor();
    /**
     * Reset events state.
     */
    clearState(): void;
    /**
     * Get only the events which are not associated with a specific thing and
     * therefore belong to the root Gateway.
     */
    getGatewayEvents(eventName?: string): {
        [name: string]: EventDescription;
    }[];
    /**
     * Get only the events which are associated with a specific thing.
     */
    getByThing(thingId: string, eventName?: string): {
        [name: string]: EventDescription;
    }[];
    /**
     * Add a new event.
     *
     * @param {Object} event An Event object.
     * @returns {Promise} Promise which resolves when the event has been added.
     */
    add(event: Event): Promise<void>;
}
declare const _default: Events;
export default _default;
//# sourceMappingURL=events.d.ts.map