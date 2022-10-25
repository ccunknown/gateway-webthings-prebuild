/**
 * Things Model.
 *
 * Manages the data model and business logic for a collection of Things.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import Thing, { Router, ThingDescription } from './thing';
import { Any, Device as DeviceSchema } from 'gateway-addon/lib/schema';
import WebSocket from 'ws';
declare class Things extends EventEmitter {
    /**
     * A Map of Things in the Things database.
     */
    private things;
    /**
     * A collection of open websockets listening for new things.
     */
    private websockets;
    /**
     * The promise object returned by Database.getThings()
     */
    private getThingsPromise?;
    private router?;
    constructor();
    setRouter(router: Router): void;
    /**
     * Get all Things known to the Gateway, initially loading them from the
     * database,
     *
     * @return {Promise} which resolves with a Map of Thing objects.
     */
    getThings(): Promise<Map<string, Thing>>;
    /**
     * Get the titles of all things.
     *
     * @return {Promise<Array>} which resolves with a list of all thing titles.
     */
    getThingTitles(): Promise<string[]>;
    /**
     * Get Thing Descriptions for all Things stored in the database.
     *
     * @param {String} reqHost request host, if coming via HTTP
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
     * @return {Promise} which resolves with a list of Thing Descriptions.
     */
    getThingDescriptions(reqHost?: string, reqSecure?: boolean): Promise<ThingDescription[]>;
    /**
     * Get a list of Things by their hrefs.
     *
     * {Array} hrefs hrefs of the list of Things to get.
     * @return {Promise} A promise which resolves with a list of Things.
     */
    getListThings(hrefs: string[]): Promise<Thing[]>;
    /**
     * Get Thing Descriptions for a list of Things by their hrefs.
     *
     * @param {Array} hrefs The hrefs of the list of Things to get
     *                      descriptions of.
     * @param {String} reqHost request host, if coming via HTTP.
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS.
     * @return {Promise} which resolves with a list of Thing Descriptions.
     */
    getListThingDescriptions(hrefs: string[], reqHost?: string, reqSecure?: boolean): Promise<ThingDescription[]>;
    /**
     * Get a list of things which are connected to adapters but not yet saved
     * in the gateway database.
     *
     * @returns Promise A promise which resolves with a list of Things.
     */
    getNewThings(): Promise<DeviceSchema[]>;
    /**
     * Create a new Thing with the given ID and description.
     *
     * @param String id ID to give Thing.
     * @param Object description Thing description.
     */
    createThing(id: string, description: ThingDescription): Promise<ThingDescription>;
    /**
     * Handle a new Thing having been discovered.
     *
     * @param {Object} newThing - New Thing description
     */
    handleNewThing(newThing: ThingDescription): void;
    /**
     * Handle a thing being removed by an adapter.
     *
     * @param {Object} thing - Thing which was removed
     */
    handleThingRemoved(thing: DeviceSchema): void;
    /**
     * Handle a thing's connectivity state change.
     *
     * @param {string} thingId - ID of thing
     * @param {boolean} connected - New connectivity state
     */
    handleConnected(thingId: string, connected: boolean): void;
    /**
     * Add a websocket to the list of new Thing subscribers.
     *
     * @param {Websocket} websocket A websocket instance.
     */
    registerWebsocket(websocket: WebSocket): void;
    /**
     * Get a Thing by its ID.
     *
     * @param {String} id The ID of the Thing to get.
     * @return {Promise<Thing>} A Thing object.
     */
    getThing(id: string): Promise<Thing>;
    /**
     * Get a Thing by its title.
     *
     * @param {String} title The title of the Thing to get.
     * @return {Promise<Thing>} A Thing object.
     */
    getThingByTitle(title: string): Promise<Thing | null>;
    /**
     * Get a Thing description for a thing by its ID.
     *
     * @param {String} id The ID of the Thing to get a description of.
     * @param {String} reqHost request host, if coming via HTTP
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
     * @return {Promise<ThingDescription>} A Thing description object.
     */
    getThingDescription(id: string, reqHost?: string, reqSecure?: boolean): Promise<ThingDescription>;
    /**
     * Set the layout index for a Thing.
     *
     * @param {number} thing The thing.
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    setThingLayoutIndex(thing: Thing, index: number, emitModified?: boolean): Promise<void>;
    /**
     * Set the group for a Thing in the overview.
     *
     * @param {number} thing The thing.
     * @param {string} group_id ID of the group
     * @return {Promise} A promise which resolves with the description set.
     */
    setThingGroup(thing: Thing, group_id: string | null, emitModified?: boolean): Promise<void>;
    /**
     * Set the group and layout index for a Thing in the overview.
     *
     * @param {number} thing The thing.
     * @param {string} group_id ID of the group
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    setThingGroupAndLayoutIndex(thing: Thing, group_id: string | null, index: number): Promise<void>;
    /**
     * Remove a Thing.
     *
     * @param String id ID to give Thing.
     */
    removeThing(id: string): Promise<void>;
    /**
     * @param {String} thingId
     * @param {String} propertyName
     * @return {Promise<Any>} resolves to value of property
     */
    getThingProperty(thingId: string, propertyName: string): Promise<Any>;
    /**
     * @param {String} thingId
     * @param {String} propertyName
     * @param {Any} value
     * @return {Promise<Any>} resolves to new value
     */
    setThingProperty(thingId: string, propertyName: string, value: Any): Promise<Any>;
    clearState(): void;
}
declare const instance: Things;
export default instance;
//# sourceMappingURL=things.d.ts.map