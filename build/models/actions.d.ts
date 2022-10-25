/**
 * Actions.
 *
 * Manages a collection of Actions.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import Action, { ActionDescription } from './action';
import { EventEmitter } from 'events';
declare class Actions extends EventEmitter {
    private actions;
    private nextId;
    private _onActionStatus;
    constructor();
    /**
     * Reset actions state.
     */
    clearState(): void;
    /**
     * Generate an ID for a new action.
     *
     * @returns {String} An id.
     */
    generateId(): string;
    /**
     * Get a particular action.
     *
     * @returns {Object} The specified action, or undefined if the action
     * doesn't exist.
     */
    get(id: string): Action;
    /**
     * Get a list of all current actions.
     *
     * @returns {Array} A list of current actions.
     */
    getAll(): Action[];
    /**
     * Get only the actions which are not associated with a specific thing and
     * therefore belong to the root Gateway
     */
    getGatewayActions(actionName?: string): {
        [name: string]: ActionDescription;
    }[];
    /**
     * Get only the actions which are associated with a specific thing
     */
    getByThing(thingId: string, actionName?: string): {
        [name: string]: ActionDescription;
    }[];
    /**
     * Add a new action.
     *
     * @param {Action} action An Action object.
     * @return {Promise} resolved when action added or rejected if failed
     */
    add(action: Action): Promise<void>;
    /**
     * Forward the actionStatus event
     */
    onActionStatus(action: Action): void;
    /**
     * Remove an action from the action list.
     *
     * @param {String} id Action ID.
     *
     * If the action has not yet been completed, it is cancelled.
     */
    remove(id: string): void;
}
declare const _default: Actions;
export default _default;
//# sourceMappingURL=actions.d.ts.map