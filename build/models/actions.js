"use strict";
/**
 * Actions.
 *
 * Manages a collection of Actions.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Constants = __importStar(require("../constants"));
const events_1 = require("events");
const things_1 = __importDefault(require("./things"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
class Actions extends events_1.EventEmitter {
    constructor() {
        super();
        /**
         * A map of action requests.
         */
        this.actions = {};
        /**
         * A counter to generate action IDs.
         */
        this.nextId = 0;
        this._onActionStatus = this.onActionStatus.bind(this);
    }
    /**
     * Reset actions state.
     */
    clearState() {
        this.nextId = 0;
        for (const id in this.actions) {
            this.remove(id);
        }
    }
    /**
     * Generate an ID for a new action.
     *
     * @returns {String} An id.
     */
    generateId() {
        return `${++this.nextId}`;
    }
    /**
     * Get a particular action.
     *
     * @returns {Object} The specified action, or undefined if the action
     * doesn't exist.
     */
    get(id) {
        return this.actions[id];
    }
    /**
     * Get a list of all current actions.
     *
     * @returns {Array} A list of current actions.
     */
    getAll() {
        return Object.keys(this.actions).map((id) => {
            return this.actions[id];
        });
    }
    /**
     * Get only the actions which are not associated with a specific thing and
     * therefore belong to the root Gateway
     */
    getGatewayActions(actionName) {
        return this.getAll()
            .filter((action) => {
            return !action.getThingId();
        })
            .filter((action) => {
            if (actionName) {
                return actionName === action.getName();
            }
            return true;
        })
            .map((action) => {
            return { [action.getName()]: action.getDescription() };
        });
    }
    /**
     * Get only the actions which are associated with a specific thing
     */
    getByThing(thingId, actionName) {
        return this.getAll()
            .filter((action) => {
            return action.getThingId() === thingId;
        })
            .filter((action) => {
            if (actionName) {
                return actionName === action.getName();
            }
            return true;
        })
            .map((action) => {
            return { [action.getName()]: action.getDescription() };
        });
    }
    /**
     * Add a new action.
     *
     * @param {Action} action An Action object.
     * @return {Promise} resolved when action added or rejected if failed
     */
    add(action) {
        const id = action.getId();
        this.actions[id] = action;
        // Call this initially for the 'created' status.
        this.onActionStatus(action);
        action.on(Constants.ACTION_STATUS, this._onActionStatus);
        if (action.getThingId()) {
            return things_1.default.getThing(action.getThingId()).then((thing) => {
                const success = thing.addAction(action);
                if (!success) {
                    delete this.actions[id];
                    throw new Error(`Invalid thing action name: "${action.getName()}"`);
                }
            });
        }
        // Only update the action status if it's being handled internally
        action.updateStatus('pending');
        switch (action.getName()) {
            case 'pair':
                addon_manager_1.default.addNewThing(action.getInput().timeout)
                    .then(() => {
                    action.updateStatus('completed');
                })
                    .catch((error) => {
                    action.setError(`${error}`);
                    action.updateStatus('error');
                    console.error('Thing was not added');
                    console.error(error);
                });
                break;
            case 'unpair': {
                const thingId = action.getInput().id;
                if (thingId) {
                    const _finally = () => {
                        console.log('unpair: thing:', thingId, 'was unpaired');
                        things_1.default.removeThing(thingId)
                            .then(() => {
                            action.updateStatus('completed');
                        })
                            .catch((error) => {
                            action.setError(`${error}`);
                            action.updateStatus('error');
                            console.error('unpair of thing:', thingId, 'failed.');
                            console.error(error);
                        });
                    };
                    addon_manager_1.default.removeThing(thingId).then(_finally, _finally);
                }
                else {
                    const msg = 'unpair missing "id" parameter.';
                    action.setError(msg);
                    action.updateStatus('error');
                    console.error(msg);
                }
                break;
            }
            default:
                delete this.actions[id];
                return Promise.reject(new Error(`Invalid action name: "${action.getName()}"`));
        }
        return Promise.resolve();
    }
    /**
     * Forward the actionStatus event
     */
    onActionStatus(action) {
        this.emit(Constants.ACTION_STATUS, action);
    }
    /**
     * Remove an action from the action list.
     *
     * @param {String} id Action ID.
     *
     * If the action has not yet been completed, it is cancelled.
     */
    remove(id) {
        const action = this.actions[id];
        if (!action) {
            throw new Error(`Invalid action id: ${id}`);
        }
        if (action.getStatus() === 'pending') {
            if (action.getThingId()) {
                things_1.default.getThing(action.getThingId())
                    .then((thing) => {
                    if (!thing.removeAction(action)) {
                        throw new Error(`Invalid thing action name: "${action.getName()}"`);
                    }
                })
                    .catch((err) => {
                    console.error('Error removing thing action:', err);
                });
            }
            else {
                switch (action.getName()) {
                    case 'pair':
                        addon_manager_1.default.cancelAddNewThing();
                        break;
                    case 'unpair':
                        addon_manager_1.default.cancelRemoveThing(action.getInput().id);
                        break;
                    default:
                        throw new Error(`Invalid action name: "${action.getName()}"`);
                }
            }
        }
        action.updateStatus('deleted');
        action.removeListener(Constants.ACTION_STATUS, this._onActionStatus);
        delete this.actions[id];
    }
}
exports.default = new Actions();
//# sourceMappingURL=actions.js.map