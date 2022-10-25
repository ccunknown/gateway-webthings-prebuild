"use strict";
/**
 * Router.
 *
 * Configure web app routes.
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
const config_1 = __importDefault(require("config"));
const compression_1 = __importDefault(require("compression"));
const Constants = __importStar(require("./constants"));
const express_1 = __importDefault(require("express"));
const jwtMiddleware = __importStar(require("./jwt-middleware"));
const nocache_1 = __importDefault(require("nocache"));
const user_profile_1 = __importDefault(require("./user-profile"));
const things_1 = __importDefault(require("./models/things"));
const actions_controller_1 = __importDefault(require("./controllers/actions_controller"));
const adapters_controller_1 = __importDefault(require("./controllers/adapters_controller"));
const addons_controller_1 = __importDefault(require("./controllers/addons_controller"));
const events_controller_1 = __importDefault(require("./controllers/events_controller"));
const extensions_controller_1 = __importDefault(require("./controllers/extensions_controller"));
const internal_logs_controller_1 = __importDefault(require("./controllers/internal_logs_controller"));
const log_out_controller_1 = __importDefault(require("./controllers/log_out_controller"));
const login_controller_1 = __importDefault(require("./controllers/login_controller"));
const logs_controller_1 = __importDefault(require("./controllers/logs_controller"));
const new_things_controller_1 = __importDefault(require("./controllers/new_things_controller"));
const notifiers_controller_1 = __importDefault(require("./controllers/notifiers_controller"));
const oauthclients_controller_1 = __importDefault(require("./controllers/oauthclients_controller"));
const oauth_controller_1 = __importDefault(require("./controllers/oauth_controller"));
const ping_controller_1 = __importDefault(require("./controllers/ping_controller"));
const proxy_controller_1 = __importDefault(require("./controllers/proxy_controller"));
const push_controller_1 = __importDefault(require("./controllers/push_controller"));
const root_controller_1 = __importDefault(require("./controllers/root_controller"));
const rules_controller_1 = __importDefault(require("./controllers/rules_controller"));
const settings_controller_1 = __importDefault(require("./controllers/settings_controller"));
const things_controller_1 = __importDefault(require("./controllers/things_controller"));
const groups_controller_1 = __importDefault(require("./controllers/groups_controller"));
const updates_controller_1 = __importDefault(require("./controllers/updates_controller"));
const uploads_controller_1 = __importDefault(require("./controllers/uploads_controller"));
const users_controller_1 = __importDefault(require("./controllers/users_controller"));
const nocache = (0, nocache_1.default)();
const auth = jwtMiddleware.middleware();
const API_PREFIX = '/api'; // A pseudo path to use for API requests
const APP_PREFIX = '/app'; // A pseudo path to use for front end requests
/**
 * Router.
 */
class Router {
    constructor() {
        this.proxyController = (0, proxy_controller_1.default)();
        things_1.default.setRouter(this);
    }
    /**
     * Configure web app routes.
     */
    configure(app) {
        // Compress all responses larger than 1kb
        app.use((0, compression_1.default)());
        app.use((request, response, next) => {
            // Enable HSTS
            if (request.protocol === 'https') {
                response.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            }
            // Disable embedding
            response.set('Content-Security-Policy', 
            // eslint-disable-next-line @typescript-eslint/quotes
            config_1.default.get('oauth.postToken') ? 'frame-ancestors filesystem:' : "frame-ancestors 'none'");
            next();
        });
        // First look for a static file
        const staticHandler = express_1.default.static(Constants.BUILD_STATIC_PATH);
        app.use(Constants.UPLOADS_PATH, express_1.default.static(user_profile_1.default.uploadsDir));
        app.use(Constants.EXTENSIONS_PATH, nocache, (0, extensions_controller_1.default)());
        app.use((request, response, next) => {
            if (request.path === '/' && request.accepts('html')) {
                // We need this to hit RootController.
                next();
            }
            else {
                staticHandler(request, response, next);
            }
        });
        // Content negotiation middleware
        app.use((request, response, next) => {
            // Inform the browser that content negotiation is taking place
            response.setHeader('Vary', 'Accept');
            // Enable CORS for all requests
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
            // If this is a proxy request, skip everything and go straight there.
            if (request.path.startsWith(Constants.PROXY_PATH)) {
                request.url = APP_PREFIX + request.url;
                next();
                // If request won't accept HTML but will accept JSON or an event stream,
                // or is a WebSocket request, or is multipart/form-data,
                // treat it as an API request
            }
            else if ((!request.accepts('html') && request.accepts('json')) ||
                (!request.accepts('html') && request.accepts('text/event-stream')) ||
                request.headers['content-type'] === 'application/json' ||
                request.get('Upgrade') === 'websocket' ||
                request.is('multipart/form-data') ||
                request.path.startsWith(Constants.ADDONS_PATH) ||
                request.path.startsWith(Constants.INTERNAL_LOGS_PATH)) {
                request.url = API_PREFIX + request.url;
                next();
                // Otherwise treat it as an app request
            }
            else {
                request.url = APP_PREFIX + request.url;
                next();
            }
        });
        const oauthController = (0, oauth_controller_1.default)();
        // Handle proxied resources
        app.use(APP_PREFIX + Constants.PROXY_PATH, nocache, auth, this.proxyController);
        // Let OAuth handle its own rendering
        app.use(APP_PREFIX + Constants.OAUTH_PATH, nocache, oauthController);
        // Handle static media files before other static content. These must be
        // authenticated.
        app.use(APP_PREFIX + Constants.MEDIA_PATH, nocache, auth, express_1.default.static(user_profile_1.default.mediaDir));
        // Web app routes - send index.html and fall back to client side URL router
        app.use(`${APP_PREFIX}/*`, (0, root_controller_1.default)());
        // Unauthenticated API routes
        app.use(API_PREFIX + Constants.LOGIN_PATH, nocache, (0, login_controller_1.default)());
        app.use(API_PREFIX + Constants.SETTINGS_PATH, nocache, (0, settings_controller_1.default)());
        app.use(API_PREFIX + Constants.USERS_PATH, nocache, (0, users_controller_1.default)());
        app.use(API_PREFIX + Constants.PING_PATH, nocache, (0, ping_controller_1.default)());
        // Authenticated API routes
        app.use(API_PREFIX + Constants.THINGS_PATH, nocache, auth, (0, things_controller_1.default)());
        app.use(API_PREFIX + Constants.NEW_THINGS_PATH, nocache, auth, (0, new_things_controller_1.default)());
        app.use(API_PREFIX + Constants.GROUPS_PATH, nocache, auth, (0, groups_controller_1.default)());
        app.use(API_PREFIX + Constants.ADAPTERS_PATH, nocache, auth, (0, adapters_controller_1.default)());
        app.use(API_PREFIX + Constants.ACTIONS_PATH, nocache, auth, (0, actions_controller_1.default)());
        app.use(API_PREFIX + Constants.EVENTS_PATH, nocache, auth, (0, events_controller_1.default)());
        app.use(API_PREFIX + Constants.LOG_OUT_PATH, nocache, auth, (0, log_out_controller_1.default)());
        app.use(API_PREFIX + Constants.UPLOADS_PATH, nocache, auth, (0, uploads_controller_1.default)());
        app.use(API_PREFIX + Constants.UPDATES_PATH, nocache, auth, (0, updates_controller_1.default)());
        app.use(API_PREFIX + Constants.ADDONS_PATH, nocache, auth, (0, addons_controller_1.default)());
        app.use(API_PREFIX + Constants.RULES_PATH, nocache, auth, rules_controller_1.default.getController());
        app.use(API_PREFIX + Constants.INTERNAL_LOGS_PATH, nocache, auth, (0, internal_logs_controller_1.default)());
        app.use(API_PREFIX + Constants.PUSH_PATH, nocache, auth, (0, push_controller_1.default)());
        app.use(API_PREFIX + Constants.LOGS_PATH, nocache, auth, (0, logs_controller_1.default)());
        app.use(API_PREFIX + Constants.NOTIFIERS_PATH, nocache, auth, (0, notifiers_controller_1.default)());
        app.use(API_PREFIX + Constants.OAUTH_PATH, nocache, oauthController);
        app.use(API_PREFIX + Constants.OAUTHCLIENTS_PATH, nocache, auth, (0, oauthclients_controller_1.default)());
    }
    addProxyServer(thingId, server) {
        this.proxyController.addProxyServer(thingId, server);
    }
    removeProxyServer(thingId) {
        this.proxyController.removeProxyServer(thingId);
    }
}
exports.default = new Router();
//# sourceMappingURL=router.js.map