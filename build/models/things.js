"use strict";
/**
 * Things Model.
 *
 * Manages the data model and business logic for a collection of Things.
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
const ajv_1 = __importDefault(require("ajv"));
const events_1 = require("events");
const addon_manager_1 = __importDefault(require("../addon-manager"));
const db_1 = __importDefault(require("../db"));
const thing_1 = __importDefault(require("./thing"));
const Constants = __importStar(require("../constants"));
const errors_1 = require("../errors");
const ajv = new ajv_1.default({ strict: false });
class Things extends events_1.EventEmitter {
    constructor() {
        super();
        this.things = new Map();
        this.websockets = [];
    }
    setRouter(router) {
        this.router = router;
    }
    /**
     * Get all Things known to the Gateway, initially loading them from the
     * database,
     *
     * @return {Promise} which resolves with a Map of Thing objects.
     */
    getThings() {
        if (this.things.size > 0) {
            return Promise.resolve(this.things);
        }
        if (this.getThingsPromise) {
            // We're still waiting for the database request.
            return this.getThingsPromise;
        }
        this.getThingsPromise = db_1.default.getThings().then((things) => {
            this.getThingsPromise = null;
            // Update the map of Things
            this.things = new Map();
            things.forEach((thing, index) => {
                // This should only happen on the first migration. // TODO
                if (!thing.hasOwnProperty('layoutIndex')) {
                    thing.layoutIndex = index;
                }
                this.things.set(thing.id, new thing_1.default(thing.id, thing, this.router));
            });
            return this.things;
        });
        return this.getThingsPromise;
    }
    /**
     * Get the titles of all things.
     *
     * @return {Promise<Array>} which resolves with a list of all thing titles.
     */
    getThingTitles() {
        return this.getThings().then((things) => {
            return Array.from(things.values()).map((t) => t.getTitle());
        });
    }
    /**
     * Get Thing Descriptions for all Things stored in the database.
     *
     * @param {String} reqHost request host, if coming via HTTP
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
     * @return {Promise} which resolves with a list of Thing Descriptions.
     */
    getThingDescriptions(reqHost, reqSecure) {
        return this.getThings().then((things) => {
            const descriptions = [];
            for (const thing of things.values()) {
                descriptions.push(thing.getDescription(reqHost, reqSecure));
            }
            return descriptions;
        });
    }
    /**
     * Get a list of Things by their hrefs.
     *
     * {Array} hrefs hrefs of the list of Things to get.
     * @return {Promise} A promise which resolves with a list of Things.
     */
    getListThings(hrefs) {
        return this.getThings().then((things) => {
            const listThings = [];
            for (const href of hrefs) {
                things.forEach((thing) => {
                    if (thing.getHref() === href) {
                        listThings.push(thing);
                    }
                });
            }
            return listThings;
        });
    }
    /**
     * Get Thing Descriptions for a list of Things by their hrefs.
     *
     * @param {Array} hrefs The hrefs of the list of Things to get
     *                      descriptions of.
     * @param {String} reqHost request host, if coming via HTTP.
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS.
     * @return {Promise} which resolves with a list of Thing Descriptions.
     */
    getListThingDescriptions(hrefs, reqHost, reqSecure) {
        return this.getListThings(hrefs).then((listThings) => {
            const descriptions = [];
            for (const thing of listThings) {
                descriptions.push(thing.getDescription(reqHost, reqSecure));
            }
            return descriptions;
        });
    }
    /**
     * Get a list of things which are connected to adapters but not yet saved
     * in the gateway database.
     *
     * @returns Promise A promise which resolves with a list of Things.
     */
    getNewThings() {
        // Get a map of things in the database
        return this.getThings().then((storedThings) => {
            // Get a list of things connected to adapters
            const connectedThings = addon_manager_1.default.getThings();
            const newThings = [];
            connectedThings.forEach((connectedThing) => {
                if (!storedThings.has(connectedThing.id)) {
                    connectedThing.href = `${Constants.THINGS_PATH}/${encodeURIComponent(connectedThing.id)}`;
                    if (connectedThing.properties) {
                        for (const propertyName in connectedThing.properties) {
                            const property = connectedThing.properties[propertyName];
                            property.href = `${Constants.THINGS_PATH}/${encodeURIComponent(connectedThing.id)}${Constants.PROPERTIES_PATH}/${encodeURIComponent(propertyName)}`;
                        }
                    }
                    newThings.push(connectedThing);
                }
            });
            return newThings;
        });
    }
    /**
     * Create a new Thing with the given ID and description.
     *
     * @param String id ID to give Thing.
     * @param Object description Thing description.
     */
    async createThing(id, description) {
        const thing = new thing_1.default(id, description, this.router);
        thing.setConnected(true);
        const thingDesc = await db_1.default.createThing(thing.getId(), thing.getDescription());
        this.things.set(thing.getId(), thing);
        await this.setThingLayoutIndex(thing, Infinity);
        this.emit(Constants.THING_ADDED, thing);
        return thingDesc;
    }
    /**
     * Handle a new Thing having been discovered.
     *
     * @param {Object} newThing - New Thing description
     */
    handleNewThing(newThing) {
        this.getThing(newThing.id)
            .then((thing) => {
            thing === null || thing === void 0 ? void 0 : thing.setConnected(true);
            return thing === null || thing === void 0 ? void 0 : thing.updateFromDescription(newThing, this.router);
        })
            .catch(() => {
            // If we don't already know about this thing, notify each open websocket
            this.websockets.forEach((socket) => {
                socket.send(JSON.stringify(newThing));
            });
        });
    }
    /**
     * Handle a thing being removed by an adapter.
     *
     * @param {Object} thing - Thing which was removed
     */
    handleThingRemoved(thing) {
        this.getThing(thing.id)
            .then((thing) => {
            thing === null || thing === void 0 ? void 0 : thing.setConnected(false);
        })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => { });
    }
    /**
     * Handle a thing's connectivity state change.
     *
     * @param {string} thingId - ID of thing
     * @param {boolean} connected - New connectivity state
     */
    handleConnected(thingId, connected) {
        this.getThing(thingId)
            .then((thing) => {
            thing === null || thing === void 0 ? void 0 : thing.setConnected(connected);
        })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => { });
    }
    /**
     * Add a websocket to the list of new Thing subscribers.
     *
     * @param {Websocket} websocket A websocket instance.
     */
    registerWebsocket(websocket) {
        this.websockets.push(websocket);
        websocket.on('close', () => {
            const index = this.websockets.indexOf(websocket);
            this.websockets.splice(index, 1);
        });
    }
    /**
     * Get a Thing by its ID.
     *
     * @param {String} id The ID of the Thing to get.
     * @return {Promise<Thing>} A Thing object.
     */
    getThing(id) {
        return this.getThings().then((things) => {
            const thing = things.get(id);
            if (thing) {
                return thing;
            }
            else {
                throw new Error(`Unable to find thing with id = ${id}`);
            }
        });
    }
    /**
     * Get a Thing by its title.
     *
     * @param {String} title The title of the Thing to get.
     * @return {Promise<Thing>} A Thing object.
     */
    getThingByTitle(title) {
        title = title.toLowerCase();
        return this.getThings()
            .then((things) => {
            for (const thing of things.values()) {
                if (thing.getTitle().toLowerCase() === title) {
                    return thing;
                }
            }
            throw new Error(`Unable to find thing with title = ${title}`);
        })
            .catch((e) => {
            console.warn('Unexpected thing retrieval error', e);
            return null;
        });
    }
    /**
     * Get a Thing description for a thing by its ID.
     *
     * @param {String} id The ID of the Thing to get a description of.
     * @param {String} reqHost request host, if coming via HTTP
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
     * @return {Promise<ThingDescription>} A Thing description object.
     */
    getThingDescription(id, reqHost, reqSecure) {
        return this.getThing(id).then((thing) => {
            return thing === null || thing === void 0 ? void 0 : thing.getDescription(reqHost, reqSecure);
        });
    }
    /**
     * Set the layout index for a Thing.
     *
     * @param {number} thing The thing.
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    async setThingLayoutIndex(thing, index, emitModified = true) {
        const things = Array.from(this.things.values()).filter((t) => t.getGroup() == thing.getGroup());
        index = Math.min(things.length - 1, Math.max(0, index));
        const movePromises = things.map((t) => {
            if (thing.getLayoutIndex() < t.getLayoutIndex() && t.getLayoutIndex() <= index) {
                return t.setLayoutIndex(t.getLayoutIndex() - 1);
            }
            else if (index <= t.getLayoutIndex() && t.getLayoutIndex() < thing.getLayoutIndex()) {
                return t.setLayoutIndex(t.getLayoutIndex() + 1);
            }
            else {
                return new Promise((resolve) => resolve(null));
            }
        });
        await Promise.all(movePromises);
        await thing.setLayoutIndex(index);
        if (emitModified) {
            this.emit(Constants.LAYOUT_MODIFIED);
        }
    }
    /**
     * Set the group for a Thing in the overview.
     *
     * @param {number} thing The thing.
     * @param {string} group_id ID of the group
     * @return {Promise} A promise which resolves with the description set.
     */
    async setThingGroup(thing, group_id, emitModified = true) {
        if (!group_id) {
            group_id = null;
        }
        await this.setThingLayoutIndex(thing, Infinity, false);
        await thing.setGroup(group_id);
        const index = Array.from(this.things.values()).filter((t) => t.getGroup() == thing.getGroup()).length - 1;
        await thing.setLayoutIndex(index);
        if (emitModified) {
            this.emit(Constants.LAYOUT_MODIFIED);
        }
    }
    /**
     * Set the group and layout index for a Thing in the overview.
     *
     * @param {number} thing The thing.
     * @param {string} group_id ID of the group
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    async setThingGroupAndLayoutIndex(thing, group_id, index) {
        if (!group_id) {
            group_id = null;
        }
        await this.setThingGroup(thing, group_id, false);
        await this.setThingLayoutIndex(thing, index, false);
        this.emit(Constants.LAYOUT_MODIFIED);
    }
    /**
     * Remove a Thing.
     *
     * @param String id ID to give Thing.
     */
    removeThing(id) {
        this.router.removeProxyServer(id);
        return db_1.default.removeThing(id).then(() => {
            const thing = this.things.get(id);
            if (!thing) {
                return;
            }
            const index = thing.getLayoutIndex();
            const group_id = thing.getGroup();
            thing.remove();
            this.things.delete(id);
            Array.from(this.things.values())
                .filter((t) => t.getGroup() == group_id)
                .forEach((t) => {
                if (t.getLayoutIndex() > index) {
                    t.setLayoutIndex(t.getLayoutIndex() - 1);
                }
            });
            this.emit(Constants.LAYOUT_MODIFIED);
        });
    }
    /**
     * @param {String} thingId
     * @param {String} propertyName
     * @return {Promise<Any>} resolves to value of property
     */
    async getThingProperty(thingId, propertyName) {
        try {
            return await addon_manager_1.default.getProperty(thingId, propertyName);
        }
        catch (e) {
            console.error('Error getting value for thingId:', thingId, 'property:', propertyName);
            console.error(e);
            throw new errors_1.HttpErrorWithCode(e.message, 500);
        }
    }
    /**
     * @param {String} thingId
     * @param {String} propertyName
     * @param {Any} value
     * @return {Promise<Any>} resolves to new value
     */
    async setThingProperty(thingId, propertyName, value) {
        let thing;
        try {
            thing = await this.getThingDescription(thingId, 'localhost', true);
        }
        catch (e) {
            throw new errors_1.HttpErrorWithCode('Thing not found', 404);
        }
        if (!thing.properties.hasOwnProperty(propertyName)) {
            throw new errors_1.HttpErrorWithCode('Property not found', 404);
        }
        if (thing.properties[propertyName].readOnly) {
            throw new errors_1.HttpErrorWithCode('Read-only property', 400);
        }
        const valid = ajv.validate(thing.properties[propertyName], value);
        if (!valid) {
            throw new errors_1.HttpErrorWithCode('Invalid property value', 400);
        }
        try {
            const updatedValue = await addon_manager_1.default.setProperty(thingId, propertyName, value);
            // Note: it's possible that updatedValue doesn't match value.
            return updatedValue;
        }
        catch (e) {
            console.error('Error setting value for thingId:', thingId, 'property:', propertyName, 'value:', value);
            throw new errors_1.HttpErrorWithCode(e.message, 500);
        }
    }
    clearState() {
        this.websockets = [];
        this.things = new Map();
        this.removeAllListeners();
    }
}
const instance = new Things();
addon_manager_1.default.on(Constants.THING_ADDED, (thing) => {
    instance.handleNewThing(thing);
});
addon_manager_1.default.on(Constants.THING_REMOVED, (thing) => {
    instance.handleThingRemoved(thing);
});
addon_manager_1.default.on(Constants.CONNECTED, ({ device, connected }) => {
    instance.handleConnected(device.id, connected);
});
exports.default = instance;
//# sourceMappingURL=things.js.map