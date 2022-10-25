/**
 * Action Model.
 *
 * Manages Action data model and business logic.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { ActionDescription as AddonActionDescription, Any } from 'gateway-addon/lib/schema';
import Thing from './thing';
export interface ActionDescription {
    input: Any;
    href: string;
    status: string;
    timeRequested: string;
    timeCompleted?: string;
    error?: string;
}
export default class Action extends EventEmitter {
    private id;
    private name;
    private input;
    private href;
    private thingId;
    private status;
    private timeRequested;
    private timeCompleted;
    private error;
    /**
     * Create a new Action
     * @param {String} name
     * @param {Object} input
     * @param {Thing?} thing
     */
    constructor(name: string, input?: Any, thing?: Thing);
    getDescription(): ActionDescription;
    /**
     * Update status and notify listeners
     * @param {String} newStatus
     */
    updateStatus(newStatus: string): void;
    /**
     * Update from another action.
     */
    update(action: AddonActionDescription): void;
    getId(): string;
    getName(): string;
    getInput(): Any;
    getThingId(): string | null;
    getStatus(): string;
    getTimeRequested(): string;
    getTimeCompleted(): string | null;
    setError(error: string): void;
}
//# sourceMappingURL=action.d.ts.map