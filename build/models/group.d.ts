/**
 * Group Model.
 *
 * Represents a Group.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface Router {
    addProxyServer: (groupId: string, server: string) => void;
    removeProxyServer: (groupId: string) => void;
}
export interface GroupDescription {
    id: string;
    title: string;
    href: string;
    layoutIndex: number;
}
export default class Group extends EventEmitter {
    private id;
    private title;
    private href;
    private layoutIndex;
    /**
     * Group constructor.
     *
     * Create a Group object from an id and a valid Group description.
     *
     * @param {String} id Unique ID.
     * @param {Object} description Group description.
     */
    constructor(id: string, description: GroupDescription);
    getId(): string;
    getTitle(): string;
    getHref(): string;
    getLayoutIndex(): number;
    /**
     * Set the title of this Group.
     *
     * @param {String} title The new title
     * @return {Promise} A promise which resolves with the description set.
     */
    setTitle(title: string): Promise<GroupDescription>;
    /**
     * Get a JSON Group Description for this Group.
     */
    getDescription(): GroupDescription;
    /**
     * Remove the Group
     */
    remove(): Promise<void>;
    /**
     * Set the layout index for a Group.
     *
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    setLayoutIndex(index: number): Promise<GroupDescription>;
    /**
     * Add a subscription to the Group's modified state
     * @param {Function} callback
     */
    addModifiedSubscription(callback: () => void): void;
    /**
     * Remove a subscription to the Group's modified state
     * @param {Function} callback
     */
    removeModifiedSubscription(callback: () => void): void;
    /**
     * Add a subscription to the Group's removed state
     * @param {Function} callback
     */
    addRemovedSubscription(callback: (arg: boolean) => void): void;
    /**
     * Remove a subscription to the Group's removed state
     * @param {Function} callback
     */
    removeRemovedSubscription(callback: (arg: boolean) => void): void;
}
//# sourceMappingURL=group.d.ts.map