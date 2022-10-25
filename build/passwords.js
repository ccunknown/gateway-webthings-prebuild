"use strict";
/**
 * Password utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMfaToken = exports.compareSync = exports.compare = exports.hashSync = exports.hash = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const rounds = 2;
/**
 * Hash a password asynchronously
 * @param {String} password
 * @return {Promise<String>} hashed password
 */
function hash(password) {
    return bcryptjs_1.default.hash(password, rounds);
}
exports.hash = hash;
/**
 * Hash a password synchronously.
 * WARNING: This will block for a very long time
 *
 * @param {String} password
 * @return {String} hashed password
 */
function hashSync(password) {
    return bcryptjs_1.default.hashSync(password, rounds);
}
exports.hashSync = hashSync;
/**
 * Compare two password hashes asynchronously
 * @param {String} passwordText - a plain text password
 * @param {String} passwordHash - the expected hash
 * @return {Promise<boolean>} If the hashes are equal
 */
function compare(passwordText, passwordHash) {
    return bcryptjs_1.default.compare(passwordText, passwordHash);
}
exports.compare = compare;
/**
 * Compare two password hashes
 * @param {String} passwordText - a plain text password
 * @param {String} passwordHash - the expected hash
 * @return {boolean} If the hashes are equal
 */
function compareSync(passwordText, passwordHash) {
    return bcryptjs_1.default.compareSync(passwordText, passwordHash);
}
exports.compareSync = compareSync;
/**
 * Verify a TOTP token
 * @param {string} sharedSecret - the MFA shared secret
 * @param {object} token - an MFA token, must contain a totp member
 * @return {boolean} If the token has been verified
 */
function verifyMfaToken(sharedSecret, token) {
    // only supporting TOTP for now
    if (token.totp) {
        return speakeasy_1.default.totp.verify({
            secret: sharedSecret,
            encoding: 'base32',
            window: 1,
            token: token.totp,
        });
    }
    return false;
}
exports.verifyMfaToken = verifyMfaToken;
//# sourceMappingURL=passwords.js.map