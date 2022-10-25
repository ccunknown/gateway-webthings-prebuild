"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const oauth_types_1 = require("../oauth-types");
const config_1 = __importDefault(require("config"));
const db_1 = __importDefault(require("../db"));
class OAuthClients {
    constructor() {
        this.clients = new Map();
    }
    register(client) {
        if (this.clients.get(client.id)) {
            this.clients.get(client.id).push(client);
        }
        else {
            this.clients.set(client.id, [client]);
        }
    }
    get(id, redirectUri) {
        const clients = this.clients.get(id);
        if (!clients) {
            return null;
        }
        if (!redirectUri) {
            return clients[0];
        }
        for (const client of clients) {
            if (client.redirect_uri.href === redirectUri.href) {
                return client;
            }
        }
        return clients[0];
    }
    async getAuthorized(userId) {
        const jwts = await db_1.default.getJSONWebTokensByUser(userId);
        const authorized = new Map();
        for (const jwt of jwts) {
            const payload = JSON.parse(jwt.payload);
            if (payload.role !== 'access_token') {
                continue;
            }
            if (!this.clients.has(payload.client_id)) {
                console.warn('Orphaned access_token', jwt);
                await db_1.default.deleteJSONWebTokenByKeyId(jwt.keyId);
                continue;
            }
            const defaultClient = this.clients.get(payload.client_id)[0];
            if (!defaultClient) {
                continue;
            }
            authorized.set(payload.client_id, defaultClient);
        }
        return Array.from(authorized.values());
    }
    async revokeClientAuthorization(userId, clientId) {
        const jwts = await db_1.default.getJSONWebTokensByUser(userId);
        for (const jwt of jwts) {
            const payload = JSON.parse(jwt.payload);
            if (payload.client_id === clientId) {
                await db_1.default.deleteJSONWebTokenByKeyId(jwt.keyId);
            }
        }
    }
}
const oauthClients = new OAuthClients();
if (config_1.default.get('oauth.testClients')) {
    oauthClients.register(new oauth_types_1.ClientRegistry(new url_1.URL('http://127.0.0.1:31338/callback'), 'test', 'Test OAuth Client', 'super secret', '/things:readwrite'));
    oauthClients.register(new oauth_types_1.ClientRegistry(new url_1.URL('http://127.0.0.1:31338/bonus-entry'), 'test', 'Test OAuth Client', 'other secret', '/things:readwrite'));
    oauthClients.register(new oauth_types_1.ClientRegistry(new url_1.URL('http://localhost:8888/callback'), 'mycroft', 'Mycroft', 'bDaQN6yDgI0GlvJL2UVcIAb4M8c', '/things:readwrite'));
}
oauthClients.register(new oauth_types_1.ClientRegistry(new url_1.URL('https://gateway.localhost/oauth/local-token-service'), 'local-token', 'Local Token Service', 'super secret', '/things:readwrite'));
oauthClients.register(new oauth_types_1.ClientRegistry(new url_1.URL('https://api.mycroft.ai/v1/auth/callback'), 'mycroft', 'Mycroft', 'bDaQN6yDgI0GlvJL2UVcIAb4M8c', '/things:readwrite'));
oauthClients.register(new oauth_types_1.ClientRegistry(new url_1.URL('https://api-test.mycroft.ai/v1/auth/callback'), 'mycroft', 'Mycroft', 'bDaQN6yDgI0GlvJL2UVcIAb4M8c', '/things:readwrite'));
exports.default = oauthClients;
//# sourceMappingURL=oauthclients.js.map