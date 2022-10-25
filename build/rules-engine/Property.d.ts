/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Property as AddonProperty } from 'gateway-addon';
import { Any } from 'gateway-addon/lib/schema';
export interface PropertyDescription {
    id: string;
    type: string;
    thing: string;
    unit?: string;
    description?: string;
    href?: string;
}
/**
 * Utility to support operations on Thing's properties
 */
export default class Property extends EventEmitter {
    private type;
    private thing;
    private id;
    private unit?;
    private description?;
    /**
     * Create a Property from a descriptor returned by the WoT API
     * @param {PropertyDescription} desc
     */
    constructor(desc: PropertyDescription);
    getType(): string;
    /**
     * @return {PropertyDescription}
     */
    toDescription(): PropertyDescription;
    /**
     * @return {Promise} resolves to property's value or undefined if not found
     */
    get(): Promise<Any>;
    /**
     * @param {Any} value
     * @return {Promise} resolves when set is done
     */
    set(value: Any): Promise<Any>;
    start(): Promise<void>;
    getInitialValue(): Promise<void>;
    /**
     * Listener for AddonManager's THING_ADDED event
     * @param {String} thing - thing id
     */
    onThingAdded(thing: Record<string, unknown>): void;
    onPropertyChanged(property: AddonProperty<Any>): void;
    stop(): void;
}
//# sourceMappingURL=Property.d.ts.map