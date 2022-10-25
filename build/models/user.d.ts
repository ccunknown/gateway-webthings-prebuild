/**
 * User Model.
 *
 * Represents a user.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export interface UserDescription {
    id: number | null;
    email: string;
    name: string | null;
    mfaEnrolled: boolean;
}
export default class User {
    private id;
    private email;
    private password;
    private mfaEnrolled;
    private mfaSharedSecret;
    private mfaBackupCodes;
    private name;
    constructor(id: number | null, email: string, password: string, name: string | null, mfaSharedSecret: string, mfaEnrolled: number | boolean, mfaBackupCodes: string);
    static generate(email: string, rawPassword: string, name: string): Promise<User>;
    /**
     * Get a JSON description for this user.
     *
     * @return {Object} JSON description of user.
     */
    getDescription(): UserDescription;
    generateMfaParams(): Promise<{
        secret: string;
        url: string;
    }>;
    generateMfaBackupCodes(): Promise<string[]>;
    getId(): number | null;
    setId(id: number): void;
    getEmail(): string;
    setEmail(email: string): void;
    getPassword(): string;
    setPassword(password: string): void;
    getName(): string | null;
    setName(name: string): void;
    getMfaSharedSecret(): string;
    getMfaBackupCodes(): string[];
    getMfaEnrolled(): boolean;
    setMfaEnrolled(mfaEnrolled: boolean): void;
}
//# sourceMappingURL=user.d.ts.map