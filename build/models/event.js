"use strict";
/**
 * Event Model.
 *
 * Manages Event data model
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const gateway_addon_1 = require("gateway-addon");
class Event {
    /**
     * Create a new Event
     * @param {String} name
     * @param {*} data
     * @param {String} thingId
     * @param {String?} timestamp
     */
    constructor(name, data, thingId, timestamp) {
        this.name = name;
        this.data = typeof data === 'undefined' ? null : data;
        this.thingId = thingId;
        this.timestamp = timestamp || gateway_addon_1.Utils.timestamp();
    }
    getDescription() {
        return {
            data: this.data,
            timestamp: this.timestamp,
        };
    }
    getName() {
        return this.name;
    }
    getThingId() {
        return this.thingId;
    }
    setThingId(thingId) {
        this.thingId = thingId;
    }
    getData() {
        return this.data;
    }
}
exports.default = Event;
//# sourceMappingURL=event.js.map