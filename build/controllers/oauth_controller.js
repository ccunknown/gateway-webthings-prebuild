"use strict";
/**
 * OAuth Controller.
 *
 * Handles a simple OAuth2 flow with a hardcoded client
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
const express_1 = __importDefault(require("express"));
const url_1 = require("url");
const jsonwebtoken_1 = __importDefault(require("../models/jsonwebtoken"));
const config_1 = __importDefault(require("config"));
const oauth_types_1 = require("../oauth-types");
const oauthclients_1 = __importDefault(require("../models/oauthclients"));
const jwtMiddleware = __importStar(require("../jwt-middleware"));
const Constants = __importStar(require("../constants"));
function build() {
    const auth = jwtMiddleware.middleware();
    const controller = express_1.default.Router();
    function redirect(response, baseURL, params) {
        const url = new url_1.URL(baseURL.toString());
        for (const key in params) {
            if (!params.hasOwnProperty(key)) {
                continue;
            }
            if (typeof params[key] !== 'undefined') {
                url.searchParams.set(key, `${params[key]}`);
            }
        }
        if (url.hostname === 'gateway.localhost') {
            response.redirect(url.toString().replace(/^https:\/\/gateway\.localhost/, ''));
            return;
        }
        response.redirect(url.toString());
    }
    function verifyClient(request, response) {
        const client = oauthclients_1.default.get(request.client_id, request.redirect_uri);
        if (!client) {
            const err = {
                error: 'unauthorized_client',
                error_description: 'client id unknown',
                state: request.state,
            };
            response.status(400).json(err);
            return null;
        }
        if (!request.redirect_uri) {
            request.redirect_uri = client.redirect_uri;
        }
        if (request.redirect_uri.toString() !== client.redirect_uri.toString()) {
            const err = {
                error: 'invalid_request',
                error_description: 'mismatched redirect_uri',
                state: request.state,
            };
            response.status(400).json(err);
            return null;
        }
        return client;
    }
    function extractClientInfo(request, response) {
        const authorization = request.headers.authorization;
        if (!authorization) {
            if (!request.body.client_id) {
                return null;
            }
            return {
                clientId: request.body.client_id,
                clientSecret: request.body.client_secret,
            };
        }
        if (typeof authorization !== 'string' || !authorization.startsWith('Basic ')) {
            const err = {
                error: 'unauthorized_client',
                error_description: 'authorization header missing or malformed',
            };
            response.status(400).json(err);
            return null;
        }
        const userPassB64 = authorization.substring('Basic '.length);
        const userPass = Buffer.from(userPassB64, 'base64').toString();
        const parts = userPass.split(':');
        if (parts.length !== 2) {
            const err = {
                error: 'unauthorized_client',
                error_description: 'authorization header missing or malformed',
            };
            response.status(400).json(err);
            return null;
        }
        return {
            clientId: decodeURIComponent(parts[0].replace(/\+/g, '%20')),
            clientSecret: decodeURIComponent(parts[1].replace(/\+/g, '%20')),
        };
    }
    function verifyAuthorizationRequest(authRequest, response) {
        const client = verifyClient(authRequest, response);
        if (!client) {
            return null;
        }
        if (authRequest.response_type !== 'code') {
            const err = {
                error: 'unsupported_response_type',
                state: authRequest.state,
            };
            redirect(response, client.redirect_uri, err);
            return null;
        }
        if (!(0, oauth_types_1.scopeValidSubset)(client.scope, authRequest.scope)) {
            const err = {
                error: 'invalid_scope',
                error_description: 'client scope does not cover requested scope',
                state: authRequest.state,
            };
            redirect(response, client.redirect_uri, err);
            return null;
        }
        return client;
    }
    controller.get('/authorize', async (request, response) => {
        let redirect_uri;
        if (request.query.redirect_uri) {
            redirect_uri = new url_1.URL(`${request.query.redirect_uri}`);
        }
        // From query component construct
        const authRequest = {
            response_type: `${request.query.response_type}`,
            client_id: `${request.query.client_id}`,
            redirect_uri: redirect_uri,
            scope: `${request.query.scope}`,
            state: `${request.query.state}`,
        };
        const client = verifyAuthorizationRequest(authRequest, response);
        if (!client) {
            return;
        }
        response.render('authorize', {
            name: client.name,
            domain: client.redirect_uri.host,
            request: authRequest,
        });
    });
    controller.get('/local-token-service', async (request, response) => {
        const localClient = oauthclients_1.default.get('local-token');
        const tokenRequest = {
            grant_type: 'authorization_code',
            code: `${request.query.code}`,
            redirect_uri: localClient.redirect_uri,
            client_id: localClient.id,
        };
        request.body = tokenRequest;
        request.headers.authorization = `Basic ${Buffer.from(`${localClient.id}:${localClient.secret}`).toString('base64')}`;
        const token = await handleAccessTokenRequest(request, response);
        if (token) {
            response.render('local-token-service', {
                oauthPostToken: config_1.default.get('oauth.postToken'),
                token: token.access_token,
            });
        }
    });
    controller.get('/allow', auth, async (req, response) => {
        const request = req;
        let redirect_uri;
        if (request.query.redirect_uri) {
            redirect_uri = new url_1.URL(`${request.query.redirect_uri}`);
        }
        const authRequest = {
            response_type: `${request.query.response_type}`,
            client_id: `${request.query.client_id}`,
            redirect_uri: redirect_uri,
            scope: `${request.query.scope}`,
            state: `${request.query.state}`,
        };
        const client = verifyAuthorizationRequest(authRequest, response);
        if (!client) {
            return;
        }
        const jwt = request.jwt;
        if (!jwt) {
            return;
        }
        if (!jwt.getPayload() || jwt.getPayload().role !== 'user_token') {
            response.status(401).send('Authorization must come from user');
            return;
        }
        // TODO: should expire in 10 minutes
        const code = await jsonwebtoken_1.default.issueOAuthToken(client, jwt.getUser(), {
            role: 'authorization_code',
            scope: authRequest.scope,
        });
        const success = {
            code: code,
            state: authRequest.state,
        };
        redirect(response, client.redirect_uri, success);
    });
    controller.post('/token', async (request, response) => {
        const requestData = request.body;
        if (requestData.grant_type === 'authorization_code') {
            const token = await handleAccessTokenRequest(request, response);
            if (token) {
                response.json(token);
            }
            return;
        }
        // if (requestData.grant_type === 'refresh_token') {
        //   handleRefreshTokenRequest(request, response);
        // }
        const err = {
            error: 'unsupported_grant_type',
            state: requestData.state,
        };
        response.status(400).json(err);
    });
    /**
     * Handles the request for an access token using an authorization code.
     * On error sends a 400 with a JSON reason.
     */
    async function handleAccessTokenRequest(request, response) {
        const requestData = request.body;
        const reqClientInfo = extractClientInfo(request, response);
        if (!reqClientInfo) {
            const err = {
                error: 'unauthorized_client',
                error_description: 'client info missing or malformed',
            };
            response.status(400).json(err);
            return null;
        }
        const tokenRequest = {
            grant_type: requestData.grant_type,
            code: requestData.code,
            redirect_uri: requestData.redirect_uri && new url_1.URL(requestData.redirect_uri),
            client_id: reqClientInfo.clientId,
        };
        const client = verifyClient(tokenRequest, response);
        if (!client) {
            return null;
        }
        if (client.id !== reqClientInfo.clientId || client.secret !== reqClientInfo.clientSecret) {
            const err = {
                error: 'unauthorized_client',
                error_description: 'client info mismatch',
            };
            response.status(400).json(err);
            return null;
        }
        let tokenData = await jsonwebtoken_1.default.verifyJWT(tokenRequest.code);
        if (!tokenData) {
            const err = {
                error: 'invalid_grant',
                error_description: 'included JWT is invalid',
                state: request.body.state,
            };
            response.status(400).json(err);
            return null;
        }
        tokenData = tokenData;
        const payload = tokenData.getPayload();
        if (!payload || payload.role !== 'authorization_code' || payload.client_id !== client.id) {
            const err = {
                error: 'invalid_grant',
                state: request.body.state,
            };
            response.status(400).json(err);
            return null;
        }
        const accessToken = await jsonwebtoken_1.default.issueOAuthToken(client, tokenData.getUser(), {
            role: Constants.ACCESS_TOKEN,
            scope: payload.scope,
        });
        // let refreshToken = await JSONWebToken.issueOAuthToken(client, 'refresh_token');
        const res = {
            access_token: accessToken,
            token_type: 'bearer',
            // refresh_token: refreshToken,
            scope: client.scope,
        };
        return res;
    }
    return controller;
}
exports.default = build;
//# sourceMappingURL=oauth_controller.js.map