/**
 * This module contains test helpers for interacting with users and credentials.
 */
/// <reference types="node" />
/// <reference types="node" />
import http from 'http';
import https from 'https';
import { UserDescription } from '../models/user';
export declare const TEST_USER: {
    email: string;
    name: string;
    password: string;
};
export declare const TEST_USER_DIFFERENT: {
    email: string;
    name: string;
    password: string;
};
export declare const TEST_USER_UPDATE_1: {
    email: string;
    name: string;
    password: string;
};
export declare const TEST_USER_UPDATE_2: {
    email: string;
    name: string;
    password: string;
    newPassword: string;
};
export declare function loginUser(server: http.Server | https.Server, user: Record<string, unknown>): Promise<string>;
export declare function createUser(server: http.Server | https.Server, user: Record<string, unknown>): Promise<string>;
export declare function addUser(server: http.Server | https.Server, jwt: string, user: Record<string, unknown>): Promise<ChaiHttp.Response>;
export declare function editUser(server: http.Server | https.Server, jwt: string, user: Record<string, unknown>): Promise<ChaiHttp.Response>;
export declare function enableMfa(server: http.Server | https.Server, jwt: string, user: Record<string, unknown>, totp?: string): Promise<{
    secret: string;
    url: string;
    backupCodes: string[];
}>;
export declare function disableMfa(server: http.Server | https.Server, jwt: string, user: Record<string, unknown>): Promise<ChaiHttp.Response>;
export declare function deleteUser(server: http.Server | https.Server, jwt: string, userId: number): Promise<ChaiHttp.Response>;
export declare function userInfo(server: http.Server | https.Server, jwt: string): Promise<UserDescription | null>;
export declare function userInfoById(server: http.Server | https.Server, jwt: string, userId: number): Promise<UserDescription>;
export declare function userCount(server: http.Server | https.Server): Promise<{
    count: number;
}>;
export declare function logoutUser(server: http.Server | https.Server, jwt: string): Promise<ChaiHttp.Response>;
export declare function headerAuth(jwt: string): [string, string];
//# sourceMappingURL=user.d.ts.map