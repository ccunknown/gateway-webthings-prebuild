"use strict";
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
const event_to_promise_1 = __importDefault(require("event-to-promise"));
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = __importDefault(require("../../models/jsonwebtoken"));
const simpleOAuth2 = __importStar(require("simple-oauth2"));
const url_1 = require("url");
const querystring_1 = __importDefault(require("querystring"));
const common_1 = require("../common");
const Constants = __importStar(require("../../constants"));
const user_1 = require("../user");
const CLIENT_ID = 'test';
const CLIENT_SECRET = 'super secret';
const REQUEST_SCOPE = '/things:readwrite';
const REQUEST_STATE = 'somethingrandom';
const CLIENT_SERVER_PORT = 31338;
const TEST_THING = {
    id: 'test-1',
    title: 'kitchen',
    '@context': 'https://webthings.io/schemas',
    '@type': ['OnOffSwitch'],
    properties: {
        power: {
            '@type': 'OnOffProperty',
            type: 'boolean',
            value: false,
        },
    },
};
describe('oauth/', function () {
    let clientServer;
    let oauth2;
    let customCallbackHandler;
    let userJWT;
    async function addDevice(desc = TEST_THING) {
        const { id } = desc;
        const res = await common_1.chai
            .request(common_1.server)
            .keepOpen()
            .post(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT))
            .send(desc);
        await (0, common_1.mockAdapter)().addDevice(id, desc);
        return res;
    }
    beforeEach(async () => {
        userJWT = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    beforeAll(async () => {
        const client = (0, express_1.default)();
        client.get('/auth', (_req, res) => {
            res.redirect(oauth2.authorizationCode.authorizeURL({
                redirect_uri: `http://127.0.0.1:${CLIENT_SERVER_PORT}/callback`,
                scope: REQUEST_SCOPE,
                state: REQUEST_STATE,
            }));
        });
        client.get('/callback', (req, res) => {
            if (customCallbackHandler) {
                customCallbackHandler(req, res);
                return;
            }
            const code = req.query.code;
            expect(code).toBeTruthy();
            expect(req.query.state).toEqual('somethingrandom');
            oauth2.authorizationCode
                .getToken({
                code: `${code}`,
                redirect_uri: `http://127.0.0.1:${CLIENT_SERVER_PORT}/callback`,
            })
                .then((result) => {
                const { token } = oauth2.accessToken.create(result);
                res.json({ token });
            })
                .catch((err) => {
                res.status(400).json(err.data.payload);
            });
        });
        client.get('/bonus-entry', (req, res) => {
            if (customCallbackHandler) {
                customCallbackHandler(req, res);
                return;
            }
            const code = req.query.code;
            expect(code).toBeTruthy();
            expect(req.query.state).toEqual('somethingrandom');
            oauth2.authorizationCode
                .getToken({
                code: `${code}`,
                redirect_uri: `http://127.0.0.1:${CLIENT_SERVER_PORT}/callback`,
            })
                .then((result) => {
                const { token } = oauth2.accessToken.create(result);
                res.json(Object.assign({ bonus: true }, { token }));
            })
                .catch((err) => {
                res.status(400).json(err.data.payload);
            });
        });
        clientServer = http_1.default.createServer();
        clientServer.on('request', client);
        clientServer.listen(CLIENT_SERVER_PORT);
        await (0, event_to_promise_1.default)(clientServer, 'listening');
    });
    afterAll(async () => {
        if (clientServer) {
            clientServer.close();
            await (0, event_to_promise_1.default)(clientServer, 'close');
            // eslint-disable-next-line require-atomic-updates
            clientServer = null;
        }
        oauth2 = null;
    });
    function setupOAuth(configProvided, customCallbackHandlerProvided, authorizationMethod = 'body') {
        if (!common_1.server.address()) {
            common_1.server.listen(0);
        }
        const config = Object.assign({
            client: {
                id: CLIENT_ID,
                secret: CLIENT_SECRET,
            },
            auth: {
                tokenHost: `https://127.0.0.1:${common_1.server.address().port}`,
            },
            options: {
                authorizationMethod,
            },
            http: {
                headers: {},
            },
        }, configProvided || {});
        oauth2 = simpleOAuth2.create(config);
        customCallbackHandler = customCallbackHandlerProvided || null;
    }
    it('performs simple authorization', async () => {
        setupOAuth();
        let res = await common_1.chai
            .request(clientServer)
            .keepOpen()
            .get('/auth')
            .set('Accept', 'application/json');
        // expect that gateway is showing page for user to authorize
        expect(res.status).toEqual(200);
        // send the request that the page would send
        res = await common_1.chai
            .request(common_1.server)
            .keepOpen()
            .get(`${Constants.OAUTH_PATH}/allow?${querystring_1.default.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: REQUEST_SCOPE,
            state: REQUEST_STATE,
        })}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        const jwt = res.body.token.access_token;
        // Try using the access token
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        // Try using the access token on a forbidden path
        let err = await common_1.chai
            .request(common_1.server)
            .get(Constants.OAUTHCLIENTS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(401);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.OAUTHCLIENTS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        expect(res.status).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].id).toEqual(CLIENT_ID);
        res = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.OAUTHCLIENTS_PATH}/${CLIENT_ID}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        expect(res.status).toEqual(204);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.OAUTHCLIENTS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        expect(res.status).toEqual(200);
        expect(res.body.length).toEqual(0);
        // Try using the access token now that it's revoked
        err = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(401);
    });
    it('fails authorization with an incorrect secret', async () => {
        setupOAuth({
            client: {
                id: CLIENT_ID,
                secret: 'not a super secret',
            },
        });
        const res = await common_1.chai
            .request(clientServer)
            .keepOpen()
            .get('/auth')
            .set('Accept', 'application/json');
        // expect that gateway is showing page for user to authorize
        expect(res.status).toEqual(200);
        // send the request that the page would send
        const err = await common_1.chai
            .request(common_1.server)
            .keepOpen()
            .get(`${Constants.OAUTH_PATH}/allow?${querystring_1.default.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: REQUEST_SCOPE,
            state: REQUEST_STATE,
        })}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        expect(err.status).toEqual(400);
    });
    it('fails authorization with an unknown client', async () => {
        setupOAuth({
            client: {
                id: 'stranger',
                secret: CLIENT_SECRET,
            },
        });
        const err = await common_1.chai.request(clientServer).get('/auth').set('Accept', 'application/json');
        expect(err.status).toEqual(400);
    });
    it('rejects client credential authorization', async () => {
        setupOAuth();
        try {
            const result = await oauth2.clientCredentials.getToken({});
            expect(result).toBeFalsy();
        }
        catch (err) {
            expect(err).toBeTruthy();
        }
    });
    it('rejects password credential authorization', async () => {
        setupOAuth();
        try {
            const result = await oauth2.ownerPassword.getToken({
                username: CLIENT_ID,
                password: CLIENT_SECRET,
                scope: REQUEST_SCOPE,
            });
            expect(result).toBeFalsy();
        }
        catch (err) {
            expect(err).toBeTruthy();
        }
    });
    it('rejects invalid scope', async () => {
        setupOAuth({}, function customCallbackHandler(req, res) {
            expect(req.query.error).toEqual('invalid_scope');
            res.status(400).json(req.query);
        });
        if (!clientServer.address()) {
            clientServer.listen(CLIENT_SERVER_PORT);
        }
        const oauthUrl = new url_1.URL(oauth2.authorizationCode.authorizeURL({
            redirect_uri: `http://127.0.0.1:${clientServer.address().port}/callback`,
            scope: 'potato',
            state: 'somethingrandom',
        }));
        const url = oauthUrl.pathname + oauthUrl.search;
        const err = await common_1.chai.request(common_1.server).get(url).set('Accept', 'application/json');
        expect(err.status).toEqual(400);
    });
    it('rejects redirect_uri mismatch', async () => {
        const oauthUrl = new url_1.URL(oauth2.authorizationCode.authorizeURL({
            redirect_uri: `http://127.0.0.1:${clientServer.address().port}/rhubarb`,
            scope: 'readwrite',
            state: 'somethingrandom',
        }));
        const url = oauthUrl.pathname + oauthUrl.search;
        const err = await common_1.chai.request(common_1.server).get(url).set('Accept', 'application/json');
        expect(err.status).toEqual(400);
        expect(err.body.error).toEqual('invalid_request');
    });
    it('allows secondary redirect_uri', async () => {
        setupOAuth();
        // send the request that the page would send
        let res = await common_1.chai
            .request(common_1.server)
            .keepOpen()
            .get(`${Constants.OAUTH_PATH}/allow?${querystring_1.default.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            redirect_uri: `http://127.0.0.1:${clientServer.address().port}/bonus-entry`,
            scope: REQUEST_SCOPE,
            state: REQUEST_STATE,
        })}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        expect(res.body.bonus).toBeTruthy();
        const jwt = res.body.token.access_token;
        // Try using the access token
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
    });
    it('rejects user JWT in access token request', async () => {
        oauth2.authorizationCode
            .getToken({
            code: userJWT,
            redirect_uri: `http://127.0.0.1:${CLIENT_SERVER_PORT}/callback`,
        })
            .then((result) => {
            expect(result).toBeFalsy();
        })
            .catch((err) => {
            expect(err).toBeTruthy();
        });
    });
    it('rejects revoked JWT in access token request', async () => {
        setupOAuth({}, function customCallbackHandler(req, res) {
            const code = req.query.code;
            expect(code).toBeTruthy();
            expect(req.query.state).toEqual('somethingrandom');
            jsonwebtoken_1.default.verifyJWT(`${code}`)
                .then((token) => {
                return jsonwebtoken_1.default.revokeToken(token.getKeyId());
            })
                .then(() => {
                return oauth2.authorizationCode.getToken({
                    code: `${code}`,
                    redirect_uri: `http://127.0.0.1:${CLIENT_SERVER_PORT}/callback`,
                });
            })
                .then((result) => {
                const token = oauth2.accessToken.create(result);
                res.json(token);
            })
                .catch((err) => {
                res.status(400).json(err.data.payload);
            });
        });
        const res = await common_1.chai
            .request(clientServer)
            .keepOpen()
            .get('/auth')
            .set('Accept', 'application/json');
        // expect that gateway is showing page for user to authorize
        expect(res.status).toEqual(200);
        // send the request that the page would send
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.OAUTH_PATH}/allow?${querystring_1.default.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: REQUEST_SCOPE,
            state: REQUEST_STATE,
        })}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        expect(err.status).toEqual(400);
        expect(err.body.error).toEqual('invalid_grant');
    });
    it('restricts jwt scope and allows header authMethod', async () => {
        setupOAuth(null, null, 'header');
        await addDevice();
        // send the request that the page would send
        let res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.OAUTH_PATH}/allow?${querystring_1.default.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: '/things/test-1:read',
            state: REQUEST_STATE,
        })}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        const jwt = res.body.token.access_token;
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/${TEST_THING.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].href).toEqual('/things/test-1');
        const err = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.THINGS_PATH}/${TEST_THING.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(401);
    });
    it('rejects use of authorization code as access token', async () => {
        setupOAuth({}, function customCallbackHandler(req, res) {
            const code = req.query.code;
            expect(code).toBeTruthy();
            expect(req.query.state).toEqual('somethingrandom');
            res.json(code);
        });
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.OAUTH_PATH}/allow?${querystring_1.default.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: '/things/test-1:read',
            state: REQUEST_STATE,
        })}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(userJWT));
        const jwt = res.body;
        expect(jwt).toBeTruthy();
        const err = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(401);
    });
});
//# sourceMappingURL=oauth-test.js.map