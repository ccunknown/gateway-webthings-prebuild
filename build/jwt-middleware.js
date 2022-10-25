"use strict";
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
exports.middleware = exports.scopeAllowsRequest = exports.authenticate = exports.extractJWTHeader = exports.extractJWTQS = void 0;
const Constants = __importStar(require("./constants"));
const jsonwebtoken_1 = __importDefault(require("./models/jsonwebtoken"));
const AUTH_TYPE = 'Bearer';
/**
 * Attempt to find the JWT in query parameters.
 *
 * @param {Request} req incoming http request.
 * @return {string|false} JWT string or false.
 */
function extractJWTQS(req) {
    if (typeof req.query === 'object' && req.query.jwt) {
        return `${req.query.jwt}`;
    }
    return false;
}
exports.extractJWTQS = extractJWTQS;
/**
 *  Attempt to find the JWT in the Authorization header.
 *
 * @param {Request} req incoming http request.
 * @return {string|false} JWT string or false.
 */
function extractJWTHeader(req) {
    const { authorization } = req.headers;
    if (!authorization) {
        return false;
    }
    const [type, sig] = authorization.split(' ');
    if (type !== AUTH_TYPE) {
        console.warn('JWT header extraction failed: invalid auth type');
        return false;
    }
    return sig;
}
exports.extractJWTHeader = extractJWTHeader;
/**
 * Authenticate the incoming call by checking it's JWT.
 *
 * TODO: User error messages.
 */
async function authenticate(req) {
    const sig = extractJWTHeader(req) || extractJWTQS(req);
    if (!sig) {
        return null;
    }
    return await jsonwebtoken_1.default.verifyJWT(sig);
}
exports.authenticate = authenticate;
function scopeAllowsRequest(scope, request) {
    const requestPath = request.originalUrl;
    if (!scope) {
        return true;
    }
    const paths = scope.split(' ');
    for (let path of paths) {
        const parts = path.split(':');
        if (parts.length !== 2) {
            console.warn('Invalid scope', scope);
            return false;
        }
        const access = parts[1];
        const readwrite = access === Constants.READWRITE;
        path = parts[0];
        const allowedDirect = requestPath.startsWith(path);
        const allowedThings = requestPath === Constants.THINGS_PATH && path.startsWith(Constants.THINGS_PATH);
        // Allow access to media only if scope covers all things
        const allowedMedia = requestPath.startsWith(Constants.MEDIA_PATH) && path === Constants.THINGS_PATH;
        if (allowedDirect || allowedThings || allowedMedia) {
            if (!readwrite && request.method !== 'GET' && request.method !== 'OPTIONS') {
                return false;
            }
            return true;
        }
    }
    return false;
}
exports.scopeAllowsRequest = scopeAllowsRequest;
function middleware() {
    return (req, res, next) => {
        authenticate(req)
            .then((jwt) => {
            if (!jwt) {
                res.status(401).end();
                return;
            }
            const payload = jwt.getPayload();
            let scope = payload.scope;
            if (payload.role === Constants.AUTHORIZATION_CODE) {
                scope = `${Constants.OAUTH_PATH}:${Constants.READWRITE}`;
            }
            if (!scopeAllowsRequest(scope, req)) {
                res.status(401).send(`Token of role ${payload.role} used out of scope: ${scope}`);
                return;
            }
            if (payload.role !== Constants.USER_TOKEN) {
                if (!payload.scope) {
                    res.status(400).send('Token must contain scope');
                    return;
                }
            }
            req.jwt = jwt;
            next();
        })
            .catch((err) => {
            console.error('error running jwt middleware', err.stack);
            next(err);
        });
    };
}
exports.middleware = middleware;
//# sourceMappingURL=jwt-middleware.js.map