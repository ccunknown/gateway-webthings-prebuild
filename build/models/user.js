"use strict";
/**
 * User Model.
 *
 * Represents a user.
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
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../db"));
const Passwords = __importStar(require("../passwords"));
const speakeasy_1 = __importDefault(require("speakeasy"));
class User {
    constructor(id, email, password, name, mfaSharedSecret, mfaEnrolled, mfaBackupCodes) {
        this.id = id;
        this.email = email;
        this.password = password; // Hashed
        this.mfaSharedSecret = mfaSharedSecret;
        this.mfaEnrolled = typeof mfaEnrolled === 'number' ? mfaEnrolled === 1 : mfaEnrolled;
        this.mfaBackupCodes = mfaBackupCodes ? JSON.parse(mfaBackupCodes) : [];
        this.name = name;
    }
    static async generate(email, rawPassword, name) {
        const hash = await Passwords.hash(rawPassword);
        return new User(null, email, hash, name, '', false, '');
    }
    /**
     * Get a JSON description for this user.
     *
     * @return {Object} JSON description of user.
     */
    getDescription() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            mfaEnrolled: this.mfaEnrolled,
        };
    }
    async generateMfaParams() {
        const secret = speakeasy_1.default.generateSecret({
            issuer: 'WebThings Gateway',
            name: `WebThings:${this.email}`,
            length: 64,
        });
        this.mfaSharedSecret = secret.base32;
        await db_1.default.editUser(this);
        return {
            secret: this.mfaSharedSecret,
            url: secret.otpauth_url,
        };
    }
    async generateMfaBackupCodes() {
        const codes = new Set();
        while (codes.size !== 10) {
            codes.add(crypto_1.default.randomBytes(6).toString('hex'));
        }
        this.mfaBackupCodes = [];
        for (const code of codes) {
            this.mfaBackupCodes.push(await Passwords.hash(code));
        }
        await db_1.default.editUser(this);
        return Array.from(codes);
    }
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }
    getEmail() {
        return this.email;
    }
    setEmail(email) {
        this.email = email;
    }
    getPassword() {
        return this.password;
    }
    setPassword(password) {
        this.password = password;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getMfaSharedSecret() {
        return this.mfaSharedSecret;
    }
    getMfaBackupCodes() {
        return this.mfaBackupCodes;
    }
    getMfaEnrolled() {
        return this.mfaEnrolled;
    }
    setMfaEnrolled(mfaEnrolled) {
        this.mfaEnrolled = mfaEnrolled;
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map