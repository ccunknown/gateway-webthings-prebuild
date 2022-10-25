/**
 * JWT authorization middleware.
 *
 * Contains logic to create a middleware which validates the presence of a JWT
 * token in either the header or query parameters (for websockets).
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import express from 'express';
import JSONWebToken from './models/jsonwebtoken';
export interface WithJWT {
    jwt: JSONWebToken;
}
/**
 * Attempt to find the JWT in query parameters.
 *
 * @param {Request} req incoming http request.
 * @return {string|false} JWT string or false.
 */
export declare function extractJWTQS(req: express.Request): string | false;
/**
 *  Attempt to find the JWT in the Authorization header.
 *
 * @param {Request} req incoming http request.
 * @return {string|false} JWT string or false.
 */
export declare function extractJWTHeader(req: express.Request): string | false;
/**
 * Authenticate the incoming call by checking it's JWT.
 *
 * TODO: User error messages.
 */
export declare function authenticate(req: express.Request): Promise<JSONWebToken | null>;
export declare function scopeAllowsRequest(scope: string | undefined, request: express.Request): boolean;
export declare function middleware(): express.Handler;
//# sourceMappingURL=jwt-middleware.d.ts.map