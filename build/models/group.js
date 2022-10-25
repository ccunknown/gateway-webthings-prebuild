"use strict";
/**
 * Group Model.
 *
 * Represents a Group.
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
const db_1 = __importDefault(require("../db"));
const events_1 = require("events");
const things_1 = __importDefault(require("./things"));
class Group extends events_1.EventEmitter {
    /**
     * Group constructor.
     *
     * Create a Group object from an id and a valid Group description.
     *
     * @param {String} id Unique ID.
     * @param {Object} description Group description.
     */
    constructor(id, description) {
        super();
        if (!id || !description) {
            throw new Error('id and description needed to create new Group');
        }
        // Parse the Group Description
        this.id = id;
        this.title = description.title || '';
        this.href = `${Constants.GROUPS_PATH}/${encodeURIComponent(this.id)}`;
        this.layoutIndex = description.layoutIndex;
    }
    getId() {
        return this.id;
    }
    getTitle() {
        return this.title;
    }
    getHref() {
        return this.href;
    }
    getLayoutIndex() {
        return this.layoutIndex;
    }
    /**
     * Set the title of this Group.
     *
     * @param {String} title The new title
     * @return {Promise} A promise which resolves with the description set.
     */
    setTitle(title) {
        this.title = title;
        return db_1.default.updateGroup(this.id, this.getDescription()).then((descr) => {
            this.emit(Constants.MODIFIED);
            return descr;
        });
    }
    /**
     * Get a JSON Group Description for this Group.
     */
    getDescription() {
        const desc = {
            title: this.title,
            href: this.href,
            layoutIndex: this.layoutIndex,
        };
        return desc;
    }
    /**
     * Remove the Group
     */
    remove() {
        return things_1.default.getThings().then(async (things) => {
            for (const thing of things.values()) {
                if (thing.getGroup() === this.getId()) {
                    await things_1.default.setThingGroup(thing, null);
                }
            }
            this.emit(Constants.REMOVED, true);
        });
    }
    /**
     * Set the layout index for a Group.
     *
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    setLayoutIndex(index) {
        this.layoutIndex = index;
        return db_1.default.updateGroup(this.id, this.getDescription()).then((descr) => {
            return descr;
        });
    }
    /**
     * Add a subscription to the Group's modified state
     * @param {Function} callback
     */
    addModifiedSubscription(callback) {
        this.on(Constants.MODIFIED, callback);
    }
    /**
     * Remove a subscription to the Group's modified state
     * @param {Function} callback
     */
    removeModifiedSubscription(callback) {
        this.removeListener(Constants.MODIFIED, callback);
    }
    /**
     * Add a subscription to the Group's removed state
     * @param {Function} callback
     */
    addRemovedSubscription(callback) {
        this.on(Constants.REMOVED, callback);
    }
    /**
     * Remove a subscription to the Group's removed state
     * @param {Function} callback
     */
    removeRemovedSubscription(callback) {
        this.removeListener(Constants.REMOVED, callback);
    }
}
exports.default = Group;
//# sourceMappingURL=group.js.map