"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
/**
 * The trigger component of a Rule which monitors some state and passes on
 * whether to be active to the Rule's effect
 */
class Trigger extends events_1.EventEmitter {
    /**
     * Create a Trigger based on a wire-format description with a property
     * @param {TriggerDescription} desc
     */
    constructor(desc) {
        super();
        this.type = this.constructor.name;
        this.label = desc.label;
    }
    /**
     * @return {TriggerDescription}
     */
    toDescription() {
        return {
            type: this.type,
            label: this.label,
        };
    }
    async start() {
        // to be overridden
    }
    stop() {
        // to be overridden
    }
}
exports.default = Trigger;
//# sourceMappingURL=Trigger.js.map