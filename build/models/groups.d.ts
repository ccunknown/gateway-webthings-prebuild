/**
 * Groups Model.
 *
 * Manages the data model and business logic for a collection of Groups.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import Group, { GroupDescription } from './group';
declare class Groups extends EventEmitter {
    /**
     * A Map of Groups in the Groups database.
     */
    private groups;
    /**
     * The promise object returned by Database.getGroups()
     */
    private getGroupsPromise?;
    constructor();
    /**
     * Get all Groups known to the Gateway, initially loading them from the
     * database,
     *
     * @return {Promise} which resolves with a Map of Group objects.
     */
    getGroups(): Promise<Map<string, Group>>;
    /**
     * Get the titles of all groups.
     *
     * @return {Promise<Array>} which resolves with a list of all group titles.
     */
    getGroupTitles(): Promise<string[]>;
    /**
     * Get Group Descriptions for all Groups stored in the database.
     *
     * @return {Promise} which resolves with a list of Group Descriptions.
     */
    getGroupDescriptions(): Promise<GroupDescription[]>;
    /**
     * Get a list of Groups by their hrefs.
     *
     * {Array} hrefs hrefs of the list of Groups to get.
     * @return {Promise} A promise which resolves with a list of Groups.
     */
    getListGroups(hrefs: string[]): Promise<Group[]>;
    /**
     * Get Group Descriptions for a list of Groups by their hrefs.
     *
     * @param {Array} hrefs The hrefs of the list of Groups to get
     *                      descriptions of.
     * @return {Promise} which resolves with a list of Group Descriptions.
     */
    getListGroupDescriptions(hrefs: string[]): Promise<GroupDescription[]>;
    /**
     * Create a new Group with the given ID and description.
     *
     * @param String id ID to give Group.
     * @param Object description Group description.
     */
    createGroup(id: string, description: GroupDescription): Promise<GroupDescription>;
    /**
     * Get a Group by its ID.
     *
     * @param {String} id The ID of the Group to get.
     * @return {Promise<Group>} A Group object.
     */
    getGroup(id: string): Promise<Group>;
    /**
     * Get a Group description for a group by its ID.
     *
     * @param {String} id The ID of the Group to get a description of.
     * @return {Promise<GroupDescription>} A Group description object.
     */
    getGroupDescription(id: string): Promise<GroupDescription>;
    /**
     * Set the layout index for a Group.
     *
     * @param {number} group The group.
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    setGroupLayoutIndex(group: Group, index: number, emitModified?: boolean): Promise<void>;
    /**
     * Remove a Group.
     *
     * @param String id ID to give Group.
     */
    removeGroup(id: string): Promise<void>;
    clearState(): void;
}
declare const instance: Groups;
export default instance;
//# sourceMappingURL=groups.d.ts.map