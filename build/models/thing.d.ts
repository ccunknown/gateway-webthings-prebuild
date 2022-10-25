/**
 * Thing Model.
 *
 * Represents a Web Thing.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Action as ActionSchema, Event as EventSchema, Property as PropertySchema, Link, Form } from 'gateway-addon/lib/schema';
import Action from './action';
import Event from './event';
export interface Router {
    addProxyServer: (thingId: string, server: string) => void;
    removeProxyServer: (thingId: string) => void;
}
export interface ThingDescription {
    id: string;
    title: string;
    '@context': string;
    '@type': string[];
    description: string;
    base: string;
    baseHref: string;
    href: string;
    properties: Record<string, PropertySchema>;
    actions: Record<string, ActionSchema>;
    events: Record<string, EventSchema>;
    links: Link[];
    forms: Form[];
    floorplanVisibility: boolean;
    floorplanX: number;
    floorplanY: number;
    layoutIndex: number;
    selectedCapability: string;
    iconHref: string | null;
    iconData: IconData;
    security: string;
    securityDefinitions: SecurityDefinition;
    group_id: string | null;
}
interface IconData {
    data: string;
    mime: string;
}
interface SecurityDefinition {
    oauth2_sc: OAuth2;
}
interface OAuth2 {
    scheme: string;
    flow: string;
    authorization: string;
    token: string;
    scopes: string[];
}
export default class Thing extends EventEmitter {
    private id;
    private title;
    private '@context';
    private '@type';
    private description;
    private href;
    private properties;
    private actions;
    private events;
    private connected;
    private eventsDispatched;
    private floorplanVisibility;
    private floorplanX;
    private floorplanY;
    private layoutIndex;
    private selectedCapability;
    private links;
    private forms;
    private iconHref;
    private group_id;
    /**
     * Thing constructor.
     *
     * Create a Thing object from an id and a valid Thing description.
     *
     * @param {String} id Unique ID.
     * @param {Object} description Thing description.
     */
    constructor(id: string, description: ThingDescription, router: Router);
    getId(): string;
    getTitle(): string;
    getLayoutIndex(): number;
    getGroup(): string | null;
    getHref(): string;
    getProperties(): Record<string, PropertySchema>;
    getActions(): Record<string, ActionSchema>;
    getEvents(): Record<string, EventSchema>;
    /**
     * Set the visibility of a Thing on the floorplan.
     *
     * @param {boolean} visibility Whether or not to include in the floorplan view.
     * @return {Promise} A promise which resolves with the description set.
     */
    setFloorplanVisibility(visibility: boolean): Promise<ThingDescription>;
    /**
     * Set the x and y co-ordinates for a Thing on the floorplan.
     *
     * @param {number} x The x co-ordinate on floorplan (0-100).
     * @param {number} y The y co-ordinate on floorplan (0-100).
     * @return {Promise} A promise which resolves with the description set.
     */
    setCoordinates(x: number, y: number): Promise<ThingDescription>;
    /**
     * Set the layout index for a Thing.
     *
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    setLayoutIndex(index: number): Promise<ThingDescription>;
    /**
     * Set the title of this Thing.
     *
     * @param {String} title The new title
     * @return {Promise} A promise which resolves with the description set.
     */
    setTitle(title: string): Promise<ThingDescription>;
    /**
     * Set the custom icon for this Thing.
     *
     * @param {Object} iconData Base64-encoded icon and its mime-type.
     * @param {Boolean} updateDatabase Whether or not to update the database after
     *                                 setting.
     */
    setIcon(iconData: IconData, updateDatabase: boolean): Promise<ThingDescription>;
    /**
     * Set the selected capability of this Thing.
     *
     * @param {String} capability The selected capability
     * @return {Promise} A promise which resolves with the description set.
     */
    setSelectedCapability(capability: string): Promise<ThingDescription>;
    /**
     * Set the group for a Thing in the overview.
     *
     * @param {string} group_id ID of the group
     * @return {Promise} A promise which resolves with the description set.
     */
    setGroup(group_id: string | null): Promise<ThingDescription>;
    /**
     * Dispatch an event to all listeners subscribed to the Thing
     * @param {Event} event
     */
    dispatchEvent(event: Event): void;
    /**
     * Add a subscription to the Thing's events
     * @param {Function} callback
     */
    addEventSubscription(callback: (arg: Event) => void): void;
    /**
     * Remove a subscription to the Thing's events
     * @param {Function} callback
     */
    removeEventSubscription(callback: (arg: Event) => void): void;
    /**
     * Add a subscription to the Thing's connected state
     * @param {Function} callback
     */
    addConnectedSubscription(callback: (connected: boolean) => void): void;
    /**
     * Remove a subscription to the Thing's connected state
     * @param {Function} callback
     */
    removeConnectedSubscription(callback: (connected: boolean) => void): void;
    /**
     * Add a subscription to the Thing's modified state
     * @param {Function} callback
     */
    addModifiedSubscription(callback: () => void): void;
    /**
     * Remove a subscription to the Thing's modified state
     * @param {Function} callback
     */
    removeModifiedSubscription(callback: () => void): void;
    /**
     * Add a subscription to the Thing's removed state
     * @param {Function} callback
     */
    addRemovedSubscription(callback: (arg: boolean) => void): void;
    /**
     * Remove a subscription to the Thing's removed state
     * @param {Function} callback
     */
    removeRemovedSubscription(callback: (arg: boolean) => void): void;
    /**
     * Get a JSON Thing Description for this Thing.
     *
     * @param {String} reqHost request host, if coming via HTTP
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
     */
    getDescription(reqHost?: string, reqSecure?: boolean): ThingDescription;
    /**
     * Remove and clean up the Thing
     */
    remove(): void;
    /**
     * Add an action
     * @param {Action} action
     * @return {boolean} Whether a known action
     */
    addAction(action: Action): boolean;
    /**
     * Remove an action
     * @param {Action} action
     * @return {boolean} Whether a known action
     */
    removeAction(action: Action): boolean;
    /**
     * Update a thing from a description.
     *
     * Thing descriptions can change as new capabilities are developed, so this
     * method allows us to update the stored thing description.
     *
     * @param {Object} description Thing description.
     * @return {Promise} A promise which resolves with the description set.
     */
    updateFromDescription(description: ThingDescription, router: Router): Promise<ThingDescription>;
    /**
     * Set the connected state of this thing.
     *
     * @param {boolean} connected - Whether or not the thing is connected
     */
    setConnected(connected: boolean): void;
}
export {};
//# sourceMappingURL=thing.d.ts.map