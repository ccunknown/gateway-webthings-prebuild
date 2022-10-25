/**
 * JSONWebToken Model.
 *
 * Contains logic to create and verify JWT tokens.
 *
 * This file contains the logic to generate public/private key pairs and return
 * them in the format openssl/crypto expects.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
interface Payload {
    role: string;
    scope?: string;
    client_id?: string;
}
export interface TokenData {
    user: number;
    issuedAt: Date;
    publicKey: string;
    keyId: string;
    payload: Payload;
}
export default class JSONWebToken {
    private user;
    private issuedAt;
    private publicKey;
    private keyId;
    private payload;
    getUser(): number;
    getIssuedAt(): Date;
    getPublicKey(): string;
    getKeyId(): string;
    getPayload(): Payload | null;
    /**
     * Verify a JWT by it's signature.
     *
     * @return {JSONWebToken|null} null when invalid JSONWebToken when valid.
     */
    static verifyJWT(sig: string): Promise<JSONWebToken | null>;
    /**
     * Issue a JWT token and store it in the database.
     *
     * @param {User} user to issue token for.
     * @return {string} the JWT token signature.
     */
    static issueToken(user: number): Promise<string>;
    /**
     * Issue a JWT token for an OAuth2 client and store it in the
     * database.
     *
     * @param {ClientRegistry} client to issue token for.
     * @param {number} user user id associated with token
     * @param {Payload} payload of token
     * @return {string} the JWT token signature.
     */
    static issueOAuthToken(client: {
        id: string;
    }, user: number, payload: Payload): Promise<string>;
    /**
     * Remove a JWT token from the database by it's key id.
     *
     * @param {string} keyId of the record to remove.
     * @return bool true when a record was deleted.
     */
    static revokeToken(keyId: string): Promise<boolean>;
    /**
     * @param number user id of the user to create a token for.
     * @return {Object} containing .sig (the jwt signature) and .token
     *  for storage in the database.
     */
    static create(user: number, payload?: {
        role: string;
    }): Promise<{
        sig: string;
        token: TokenData;
    }>;
    constructor(obj: TokenData);
    /**
     * Verify that the given JWT matches this token.
     *
     * @param string sig jwt token.
     * @returns {Object|null} jwt payload if signature matches.
     */
    verify(sig: string): Payload | null;
}
export {};
//# sourceMappingURL=jsonwebtoken.d.ts.map