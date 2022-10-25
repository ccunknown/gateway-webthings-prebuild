"use strict";
/**
 * Groups Model.
 *
 * Manages the data model and business logic for a collection of Groups.
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
const events_1 = require("events");
const db_1 = __importDefault(require("../db"));
const group_1 = __importDefault(require("./group"));
const Constants = __importStar(require("../constants"));
class Groups extends events_1.EventEmitter {
    constructor() {
        super();
        this.groups = new Map();
    }
    /**
     * Get all Groups known to the Gateway, initially loading them from the
     * database,
     *
     * @return {Promise} which resolves with a Map of Group objects.
     */
    getGroups() {
        if (this.groups.size > 0) {
            return Promise.resolve(this.groups);
        }
        if (this.getGroupsPromise) {
            // We're still waiting for the database request.
            return this.getGroupsPromise;
        }
        this.getGroupsPromise = db_1.default.getGroups().then((groups) => {
            this.getGroupsPromise = null;
            // Update the map of Groups
            this.groups = new Map();
            groups.forEach((group) => {
                this.groups.set(group.id, new group_1.default(group.id, group));
            });
            return this.groups;
        });
        return this.getGroupsPromise;
    }
    /**
     * Get the titles of all groups.
     *
     * @return {Promise<Array>} which resolves with a list of all group titles.
     */
    getGroupTitles() {
        return this.getGroups().then((groups) => {
            return Array.from(groups.values()).map((t) => t.getTitle());
        });
    }
    /**
     * Get Group Descriptions for all Groups stored in the database.
     *
     * @return {Promise} which resolves with a list of Group Descriptions.
     */
    getGroupDescriptions() {
        return this.getGroups().then((groups) => {
            const descriptions = [];
            for (const group of groups.values()) {
                descriptions.push(group.getDescription());
            }
            return descriptions;
        });
    }
    /**
     * Get a list of Groups by their hrefs.
     *
     * {Array} hrefs hrefs of the list of Groups to get.
     * @return {Promise} A promise which resolves with a list of Groups.
     */
    getListGroups(hrefs) {
        return this.getGroups().then((groups) => {
            const listGroups = [];
            for (const href of hrefs) {
                groups.forEach((group) => {
                    if (group.getHref() === href) {
                        listGroups.push(group);
                    }
                });
            }
            return listGroups;
        });
    }
    /**
     * Get Group Descriptions for a list of Groups by their hrefs.
     *
     * @param {Array} hrefs The hrefs of the list of Groups to get
     *                      descriptions of.
     * @return {Promise} which resolves with a list of Group Descriptions.
     */
    getListGroupDescriptions(hrefs) {
        return this.getListGroups(hrefs).then((listGroups) => {
            const descriptions = [];
            for (const group of listGroups) {
                descriptions.push(group.getDescription());
            }
            return descriptions;
        });
    }
    /**
     * Create a new Group with the given ID and description.
     *
     * @param String id ID to give Group.
     * @param Object description Group description.
     */
    async createGroup(id, description) {
        const group = new group_1.default(id, description);
        const groupDesc = await db_1.default.createGroup(group.getId(), group.getDescription());
        this.groups.set(group.getId(), group);
        await this.setGroupLayoutIndex(group, Infinity);
        this.emit(Constants.GROUP_ADDED, group);
        return groupDesc;
    }
    /**
     * Get a Group by its ID.
     *
     * @param {String} id The ID of the Group to get.
     * @return {Promise<Group>} A Group object.
     */
    getGroup(id) {
        return this.getGroups().then((groups) => {
            const group = groups.get(id);
            if (group) {
                return group;
            }
            else {
                throw new Error(`Unable to find group with id = ${id}`);
            }
        });
    }
    /**
     * Get a Group description for a group by its ID.
     *
     * @param {String} id The ID of the Group to get a description of.
     * @return {Promise<GroupDescription>} A Group description object.
     */
    getGroupDescription(id) {
        return this.getGroup(id).then((group) => {
            return group === null || group === void 0 ? void 0 : group.getDescription();
        });
    }
    /**
     * Set the layout index for a Group.
     *
     * @param {number} group The group.
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    async setGroupLayoutIndex(group, index, emitModified = true) {
        const groups = Array.from(this.groups.values());
        index = Math.min(groups.length - 1, Math.max(0, index));
        const movePromises = groups.map((g) => {
            if (group.getLayoutIndex() < g.getLayoutIndex() && g.getLayoutIndex() <= index) {
                return g.setLayoutIndex(g.getLayoutIndex() - 1);
            }
            else if (index <= g.getLayoutIndex() && g.getLayoutIndex() < group.getLayoutIndex()) {
                return g.setLayoutIndex(g.getLayoutIndex() + 1);
            }
            else {
                return new Promise((resolve) => resolve(null));
            }
        });
        await Promise.all(movePromises);
        await group.setLayoutIndex(index);
        if (emitModified) {
            this.emit(Constants.LAYOUT_MODIFIED);
        }
    }
    /**
     * Remove a Group.
     *
     * @param String id ID to give Group.
     */
    removeGroup(id) {
        return db_1.default.removeGroup(id).then(() => {
            const group = this.groups.get(id);
            if (!group) {
                return;
            }
            const index = group.getLayoutIndex();
            group.remove();
            this.groups.delete(id);
            Array.from(this.groups.values()).forEach((g) => {
                if (g.getLayoutIndex() > index) {
                    g.setLayoutIndex(g.getLayoutIndex() - 1);
                }
            });
            this.emit(Constants.LAYOUT_MODIFIED);
            this.emit(Constants.GROUP_REMOVED, group);
        });
    }
    clearState() {
        this.groups = new Map();
        this.removeAllListeners();
    }
}
const instance = new Groups();
exports.default = instance;
//# sourceMappingURL=groups.js.map