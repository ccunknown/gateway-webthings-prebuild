/**
 * Password utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * Hash a password asynchronously
 * @param {String} password
 * @return {Promise<String>} hashed password
 */
export declare function hash(password: string): Promise<string>;
/**
 * Hash a password synchronously.
 * WARNING: This will block for a very long time
 *
 * @param {String} password
 * @return {String} hashed password
 */
export declare function hashSync(password: string): string;
/**
 * Compare two password hashes asynchronously
 * @param {String} passwordText - a plain text password
 * @param {String} passwordHash - the expected hash
 * @return {Promise<boolean>} If the hashes are equal
 */
export declare function compare(passwordText: string, passwordHash: string): Promise<boolean>;
/**
 * Compare two password hashes
 * @param {String} passwordText - a plain text password
 * @param {String} passwordHash - the expected hash
 * @return {boolean} If the hashes are equal
 */
export declare function compareSync(passwordText: string, passwordHash: string): boolean;
/**
 * Verify a TOTP token
 * @param {string} sharedSecret - the MFA shared secret
 * @param {object} token - an MFA token, must contain a totp member
 * @return {boolean} If the token has been verified
 */
export declare function verifyMfaToken(sharedSecret: string, token: {
    totp: string;
}): boolean;
//# sourceMappingURL=passwords.d.ts.map