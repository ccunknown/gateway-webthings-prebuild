/**
 * User Manager.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import User from './user';
/**
 * Get a user from the database.
 *
 * @param {String} email Email address of user to look up.
 * @return {Promise} Promise which resolves to user object
 *   or null if user doesn't exist.
 */
export declare function getUser(email: string): Promise<User | null>;
export declare function getCount(): Promise<number>;
/**
 * Get a user from the database.
 *
 * @param {number} id primary key.
 * @return {Promise} Promise which resolves to user object
 *   or null if user doesn't exist.
 */
export declare function getUserById(id: number): Promise<User | null>;
/**
 * Get all Users stored in the database
 * @return {Promise<Array<User>>}
 */
export declare function getUsers(): Promise<User[]>;
/**
 * Create a new User
 * @param {String} email
 * @param {String} password
 * @param {String?} name - optional name of user
 * @return {User} user object.
 */
export declare function createUser(email: string, password: string, name: string | null): Promise<User>;
/**
 * Edit an existing User
 * @param {User} user to edit
 * @return {Promise} Promise which resolves when operation is complete.
 */
export declare function editUser(user: User): Promise<void>;
/**
 * Delete an existing User
 * @param {Number} userId
 * @return {Promise} Promise which resolves when operation is complete.
 */
export declare function deleteUser(userId: number): Promise<void>;
//# sourceMappingURL=users.d.ts.map