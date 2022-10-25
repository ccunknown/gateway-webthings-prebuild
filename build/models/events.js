"use strict";
/**
 * Events.
 *
 * Manages a collection of Events.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const things_1 = __importDefault(require("../models/things"));
class Events {
    constructor() {
        this.events = [];
    }
    /**
     * Reset events state.
     */
    clearState() {
        this.events = [];
    }
    /**
     * Get only the events which are not associated with a specific thing and
     * therefore belong to the root Gateway.
     */
    getGatewayEvents(eventName) {
        return this.events
            .filter((event) => {
            return !event.getThingId();
        })
            .filter((event) => {
            if (eventName) {
                return eventName === event.getName();
            }
            return true;
        })
            .map((event) => {
            return { [event.getName()]: event.getDescription() };
        });
    }
    /**
     * Get only the events which are associated with a specific thing.
     */
    getByThing(thingId, eventName) {
        return this.events
            .filter((event) => {
            return event.getThingId() === thingId;
        })
            .filter((event) => {
            if (eventName) {
                return eventName === event.getName();
            }
            return true;
        })
            .map((event) => {
            return { [event.getName()]: event.getDescription() };
        });
    }
    /**
     * Add a new event.
     *
     * @param {Object} event An Event object.
     * @returns {Promise} Promise which resolves when the event has been added.
     */
    add(event) {
        this.events.push(event);
        if (event.getThingId()) {
            return things_1.default.getThing(event.getThingId())
                .then((thing) => {
                thing.dispatchEvent(event);
            })
                .catch(() => {
                console.warn('Received event for unknown thing:', event.getThingId());
            });
        }
        return Promise.resolve();
    }
}
exports.default = new Events();
//# sourceMappingURL=events.js.map