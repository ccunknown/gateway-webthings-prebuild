"use strict";
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
const uuid_1 = require("uuid");
const jwt = __importStar(require("jsonwebtoken"));
const ec = __importStar(require("../ec-crypto"));
const db_1 = __importDefault(require("../db"));
const Settings = __importStar(require("./settings"));
const ROLE_USER_TOKEN = 'user_token';
class JSONWebToken {
    constructor(obj) {
        const { user, issuedAt, publicKey, keyId } = obj;
        this.user = user;
        this.issuedAt = issuedAt;
        this.publicKey = publicKey;
        this.keyId = keyId;
        this.payload = null;
    }
    getUser() {
        return this.user;
    }
    getIssuedAt() {
        return this.issuedAt;
    }
    getPublicKey() {
        return this.publicKey;
    }
    getKeyId() {
        return this.keyId;
    }
    getPayload() {
        return this.payload;
    }
    /**
     * Verify a JWT by it's signature.
     *
     * @return {JSONWebToken|null} null when invalid JSONWebToken when valid.
     */
    static async verifyJWT(sig) {
        const decoded = jwt.decode(sig, {
            complete: true,
            json: true,
        });
        if (!decoded || !decoded.header || !decoded.header.kid) {
            return null;
        }
        const { kid } = decoded.header;
        const tokenData = await db_1.default.getJSONWebTokenByKeyId(kid);
        if (!tokenData) {
            return null;
        }
        const token = new JSONWebToken(tokenData);
        token.payload = token.verify(sig);
        if (token.payload) {
            return token;
        }
        return null;
    }
    /**
     * Issue a JWT token and store it in the database.
     *
     * @param {User} user to issue token for.
     * @return {string} the JWT token signature.
     */
    static async issueToken(user) {
        const { sig, token } = await this.create(user);
        await db_1.default.createJSONWebToken(token);
        return sig;
    }
    /**
     * Issue a JWT token for an OAuth2 client and store it in the
     * database.
     *
     * @param {ClientRegistry} client to issue token for.
     * @param {number} user user id associated with token
     * @param {Payload} payload of token
     * @return {string} the JWT token signature.
     */
    static async issueOAuthToken(client, user, payload) {
        const { sig, token } = await this.create(user, Object.assign({
            client_id: client.id,
        }, payload));
        await db_1.default.createJSONWebToken(token);
        return sig;
    }
    /**
     * Remove a JWT token from the database by it's key id.
     *
     * @param {string} keyId of the record to remove.
     * @return bool true when a record was deleted.
     */
    static async revokeToken(keyId) {
        return await db_1.default.deleteJSONWebTokenByKeyId(keyId);
    }
    /**
     * @param number user id of the user to create a token for.
     * @return {Object} containing .sig (the jwt signature) and .token
     *  for storage in the database.
     */
    static async create(user, payload = { role: ROLE_USER_TOKEN }) {
        const pair = ec.generateKeyPair();
        const keyId = (0, uuid_1.v4)();
        const issuer = await Settings.getTunnelInfo();
        const options = {
            algorithm: ec.JWT_ALGORITHM,
            keyid: keyId,
        };
        if (issuer) {
            options.issuer = issuer;
        }
        const sig = jwt.sign(payload, pair.private, options);
        const token = {
            user,
            issuedAt: new Date(),
            publicKey: pair.public,
            keyId,
            payload,
        };
        return { sig, token };
    }
    /**
     * Verify that the given JWT matches this token.
     *
     * @param string sig jwt token.
     * @returns {Object|null} jwt payload if signature matches.
     */
    verify(sig) {
        try {
            return jwt.verify(sig, this.publicKey, {
                algorithms: [ec.JWT_ALGORITHM],
            });
        }
        catch (err) {
            // If this error is thrown we know the token is invalid.
            if (err.name === 'JsonWebTokenError') {
                return null;
            }
            throw err;
        }
    }
}
exports.default = JSONWebToken;
//# sourceMappingURL=jsonwebtoken.js.map