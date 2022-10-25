/**
 * WebThings Gateway Database.
 *
 * Stores a list of Things connected to the gateway.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { RunResult } from 'sqlite3';
import { TokenData } from './models/jsonwebtoken';
import User from './models/user';
import { PushSubscription } from 'web-push';
declare class Database {
    /**
     * SQLite3 Database object.
     */
    private db?;
    /**
     * Open the database.
     */
    open(): void;
    createTables(): void;
    /**
     * Do anything necessary to migrate from old database schemas.
     */
    migrate(): void;
    /**
     * Get all Things stored in the database.
     *
     * @return Promise which resolves with a list of Thing objects.
     */
    getThings(): Promise<Record<string, unknown>[]>;
    /**
     * Add a new Thing to the Database.
     *
     * @param String id The ID to give the new Thing.
     * @param String description A serialised Thing description.
     */
    createThing<T>(id: string, description: T): Promise<T>;
    /**
     * Update a Thing in the Database.
     *
     * @param String id ID of the thing to update.
     * @param String description A serialised Thing description.
     */
    updateThing<T>(id: string, description: T): Promise<T>;
    /**
     * Remove a Thing from the Database.
     *
     * @param String id The ID of the Thing to remove.
     */
    removeThing(id: string): Promise<void>;
    /**
     * Get all Groups stored in the database.
     *
     * @return Promise which resolves with a list of Group objects.
     */
    getGroups(): Promise<Record<string, unknown>[]>;
    /**
     * Add a new Group to the Database.
     *
     * @param String id The ID to give the new Group.
     * @param String description A serialised Group description.
     */
    createGroup<T>(id: string, description: T): Promise<T>;
    /**
     * Update a Group in the Database.
     *
     * @param String id ID of the group to update.
     * @param String description A serialised Group description.
     */
    updateGroup<T>(id: string, description: T): Promise<T>;
    /**
     * Remove a Group from the Database.
     *
     * @param String id The ID of the Group to remove.
     */
    removeGroup(id: string): Promise<void>;
    /**
     * Get a user by their email address.
     */
    getUser(email: string): Promise<Record<string, unknown>>;
    /**
     * Get a user by it's primary key (id).
     */
    getUserById(id: number): Promise<Record<string, unknown>>;
    /**
     * Get all Users stored in the database.
     *
     * @return {Promise<Array<User>>} resolves with a list of User objects
     */
    getUsers(): Promise<Record<string, unknown>[]>;
    getUserCount(): Promise<number>;
    /**
     * Get a setting or return undefined
     * @param {String} key
     * @return {Promise<Object?>} value
     */
    getSetting(key: string): Promise<unknown>;
    /**
     * Set a setting. Assumes that the only access to the database is
     * single-threaded.
     *
     * @param {String} key
     * @param {Object} value
     * @return {Promise}
     */
    setSetting(key: string, value: unknown): Promise<RunResult>;
    /**
     * Remove a setting. Assumes that the only access to the database is
     * single-threaded.
     *
     * @param {String} key
     * @return {Promise}
     */
    deleteSetting(key: string): Promise<void>;
    /**
     * Create a user
     * @param {User} user
     * @return {Promise<User>}
     */
    createUser(user: User): Promise<number>;
    /**
     * Edit a user.
     * @param {User} user
     * @return Promise that resolves when operation is complete.
     */
    editUser(user: User): Promise<RunResult>;
    /**
     * Delete a user.
     * @param {Number} userId
     * @return Promise that resolves when operation is complete.
     */
    deleteUser(userId: number): Promise<RunResult[]>;
    /**
     * Delete all jsonwebtoken's for a given user.
     */
    deleteJSONWebTokensForUser(userId: number): Promise<RunResult>;
    /**
     * Insert a JSONWebToken into the database
     * @param {JSONWebToken} token
     * @return {Promise<number>} resolved to JWT's primary key
     */
    createJSONWebToken(token: TokenData): Promise<number>;
    /**
     * Get a JWT by its key id.
     * @param {string} keyId
     * @return {Promise<Object>} jwt data
     */
    getJSONWebTokenByKeyId(keyId: string): Promise<Record<string, unknown>>;
    /**
     * Get all known JWTs of a user
     * @param {number} userId
     * @return {Promise<Array<Object>>}
     */
    getJSONWebTokensByUser(userId: number): Promise<Record<string, unknown>[]>;
    /**
     * Delete a JWT by it's key id.
     * @param {string} keyId
     * @return {Promise<boolean>} whether deleted
     */
    deleteJSONWebTokenByKeyId(keyId: string): Promise<boolean>;
    /**
     * Store a new Push subscription
     * @param {Object} subscription
     * @return {Promise<number>} resolves to sub id
     */
    createPushSubscription(desc: PushSubscription): Promise<number>;
    /**
     * Get all push subscriptions
     * @return {Promise<Array<PushSubscription>>}
     */
    getPushSubscriptions(): Promise<Record<string, unknown>[]>;
    /**
     * Delete a single subscription
     * @param {number} id
     */
    deletePushSubscription(id: string): Promise<RunResult>;
    /**
     * ONLY for tests (clears all tables).
     */
    deleteEverything(): Promise<RunResult[]>;
    get(sql: string, ...values: any[]): Promise<Record<string, unknown>>;
    /**
     * Run a SQL statement
     * @param {String} sql
     * @param {Array<unknown>} values
     * @return {Promise<Object>} promise resolved to `this` of statement result
     */
    run(sql: string, ...values: any[]): Promise<RunResult>;
    all(sql: string, ...values: any[]): Promise<Record<string, unknown>[]>;
}
declare const _default: Database;
export default _default;
//# sourceMappingURL=db.d.ts.map