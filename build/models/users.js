"use strict";
/**
 * User Manager.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.editUser = exports.createUser = exports.getUsers = exports.getUserById = exports.getCount = exports.getUser = void 0;
const user_1 = __importDefault(require("./user"));
const db_1 = __importDefault(require("../db"));
/**
 * Get a user from the database.
 *
 * @param {String} email Email address of user to look up.
 * @return {Promise} Promise which resolves to user object
 *   or null if user doesn't exist.
 */
async function getUser(email) {
    const result = await db_1.default.getUser(email);
    if (!result) {
        return null;
    }
    return new user_1.default(result.id, result.email, result.password, result.name, result.mfaSharedSecret, result.mfaEnrolled, result.mfaBackupCodes);
}
exports.getUser = getUser;
function getCount() {
    return db_1.default.getUserCount();
}
exports.getCount = getCount;
/**
 * Get a user from the database.
 *
 * @param {number} id primary key.
 * @return {Promise} Promise which resolves to user object
 *   or null if user doesn't exist.
 */
async function getUserById(id) {
    const row = await db_1.default.getUserById(id);
    if (!row) {
        return null;
    }
    return new user_1.default(row.id, row.email, row.password, row.name, row.mfaSharedSecret, row.mfaEnrolled, row.mfaBackupCodes);
}
exports.getUserById = getUserById;
/**
 * Get all Users stored in the database
 * @return {Promise<Array<User>>}
 */
async function getUsers() {
    const userRows = await db_1.default.getUsers();
    return userRows.map((row) => {
        return new user_1.default(row.id, row.email, row.password, row.name, row.mfaSharedSecret, row.mfaEnrolled, row.mfaBackupCodes);
    });
}
exports.getUsers = getUsers;
/**
 * Create a new User
 * @param {String} email
 * @param {String} password
 * @param {String?} name - optional name of user
 * @return {User} user object.
 */
async function createUser(email, password, name) {
    const user = new user_1.default(null, email.toLowerCase(), password, name, '', false, '');
    user.setId(await db_1.default.createUser(user));
    return user;
}
exports.createUser = createUser;
/**
 * Edit an existing User
 * @param {User} user to edit
 * @return {Promise} Promise which resolves when operation is complete.
 */
async function editUser(user) {
    user.setEmail(user.getEmail().toLowerCase());
    await db_1.default.editUser(user);
}
exports.editUser = editUser;
/**
 * Delete an existing User
 * @param {Number} userId
 * @return {Promise} Promise which resolves when operation is complete.
 */
async function deleteUser(userId) {
    await db_1.default.deleteUser(userId);
}
exports.deleteUser = deleteUser;
//# sourceMappingURL=users.js.map