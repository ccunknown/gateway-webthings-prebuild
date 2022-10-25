"use strict";
/*
 * WebThings Gateway App.
 *
 * Back end main script.
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
exports.serverStartup = exports.servers = void 0;
// Set up the user profile.
const user_profile_1 = __importDefault(require("./user-profile"));
const migrate_1 = __importDefault(require("./migrate"));
const migration = (0, migrate_1.default)();
// Causes a timestamp to be prepended to console log lines.
require("./log-timestamps");
// External Dependencies
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const body_parser_1 = __importDefault(require("body-parser"));
const config_1 = __importDefault(require("config"));
const path_1 = __importDefault(require("path"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const ip_regex_1 = __importDefault(require("ip-regex"));
const SegfaultHandler = __importStar(require("segfault-handler"));
// Keep these imports here to prevent circular dependencies
require("./plugin/outlet-proxy");
require("./plugin/property-proxy");
require("./plugin/plugin");
// Internal Dependencies
const addon_manager_1 = __importDefault(require("./addon-manager"));
const Constants = __importStar(require("./constants"));
const db_1 = __importDefault(require("./db"));
const logs_1 = __importDefault(require("./models/logs"));
const Platform = __importStar(require("./platform"));
const router_1 = __importDefault(require("./router"));
const rules_controller_1 = __importDefault(require("./controllers/rules_controller"));
const sleep_1 = __importDefault(require("./sleep"));
const things_1 = __importDefault(require("./models/things"));
const tunnel_service_1 = __importDefault(require("./tunnel-service"));
const wifi_setup_1 = require("./wifi-setup");
SegfaultHandler.registerHandler(path_1.default.join(user_profile_1.default.logDir, 'crash.log'));
// Open the databases
db_1.default.open();
logs_1.default.open();
exports.servers = {
    http: http_1.default.createServer(),
    https: createHttpsServer(),
};
const httpApp = createGatewayApp(exports.servers.http, false);
let httpsApp = null;
/**
 * Creates an HTTPS server object, if successful. If there are no public and
 * private keys stored for the tunnel service, null is returned.
 *
 * @param {}
 * @return {Object|null} https server object if successful, else NULL
 */
function createHttpsServer() {
    if (!tunnel_service_1.default.hasCertificates()) {
        return null;
    }
    // HTTPS server configuration
    const options = {
        key: fs_1.default.readFileSync(path_1.default.join(user_profile_1.default.sslDir, 'privatekey.pem')),
        cert: fs_1.default.readFileSync(path_1.default.join(user_profile_1.default.sslDir, 'certificate.pem')),
    };
    if (fs_1.default.existsSync(path_1.default.join(user_profile_1.default.sslDir, 'chain.pem'))) {
        options.ca = fs_1.default.readFileSync(path_1.default.join(user_profile_1.default.sslDir, 'chain.pem'));
    }
    return https_1.default.createServer(options);
}
let httpsAttempts = 5;
function startHttpsGateway() {
    const port = config_1.default.get('ports.https');
    if (!exports.servers.https) {
        exports.servers.https = createHttpsServer();
        if (!exports.servers.https) {
            httpsAttempts -= 1;
            if (httpsAttempts < 0) {
                console.error('Unable to create HTTPS server after several tries');
                gracefulExit();
                process.exit(0);
            }
            return (0, sleep_1.default)(4000).then(startHttpsGateway);
        }
    }
    httpsApp = createGatewayApp(exports.servers.https, true);
    exports.servers.https.on('request', httpsApp);
    const promises = [];
    // Start the HTTPS server
    promises.push(new Promise((resolve) => {
        exports.servers.https.listen(port, () => {
            migration
                .then(() => {
                // load existing things from the database
                return things_1.default.getThings();
            })
                .then(() => {
                addon_manager_1.default.loadAddons();
            });
            rules_controller_1.default.configure();
            console.log('HTTPS server listening on port', exports.servers.https.address().port);
            resolve();
        });
    }));
    // Redirect HTTP to HTTPS
    exports.servers.http.on('request', httpsApp);
    const httpPort = config_1.default.get('ports.http');
    promises.push(new Promise((resolve) => {
        exports.servers.http.listen(httpPort, () => {
            console.log('Redirector listening on port', exports.servers.http.address().port);
            resolve();
        });
    }));
    return Promise.all(promises).then(() => exports.servers.https);
}
function startHttpGateway() {
    exports.servers.http.on('request', httpApp);
    const port = config_1.default.get('ports.http');
    return new Promise((resolve) => {
        exports.servers.http.listen(port, () => {
            migration
                .then(() => {
                // load existing things from the database
                return things_1.default.getThings();
            })
                .then(() => {
                addon_manager_1.default.loadAddons();
            });
            rules_controller_1.default.configure();
            console.log('HTTP server listening on port', exports.servers.http.address().port);
            resolve();
        });
    });
}
function stopHttpGateway() {
    exports.servers.http.removeListener('request', httpApp);
    if (httpsApp) {
        exports.servers.http.removeListener('request', httpsApp);
    }
    exports.servers.http.close();
}
function stopHttpsGateway() {
    if (exports.servers.https && httpsApp) {
        exports.servers.https.removeListener('request', httpsApp);
        exports.servers.https.close();
        exports.servers.https = null;
    }
}
function startWiFiSetup() {
    console.log('Starting WiFi setup');
    exports.servers.http.on('request', wifi_setup_1.WiFiSetupApp.onRequest);
    const port = config_1.default.get('ports.http');
    exports.servers.http.listen(port);
}
function stopWiFiSetup() {
    console.log('Stopping WiFi Setup');
    exports.servers.http.removeListener('request', wifi_setup_1.WiFiSetupApp.onRequest);
    exports.servers.http.close();
}
function createApp(isSecure) {
    const port = isSecure ? config_1.default.get('ports.https') : config_1.default.get('ports.http');
    const app = (0, express_1.default)();
    app.engine('handlebars', (0, express_handlebars_1.default)({
        defaultLayout: undefined,
        layoutsDir: Constants.VIEWS_PATH,
    }));
    app.set('view engine', 'handlebars');
    app.set('views', Constants.VIEWS_PATH);
    // Redirect based on https://https.cio.gov/apis/
    app.use((request, response, next) => {
        // If the server is in non-HTTPS mode, or the request is already HTTPS,
        // just carry on.
        if (!isSecure || request.secure) {
            next();
            return;
        }
        // If the Host header was not set, disallow this request.
        if (!request.hostname) {
            response.sendStatus(403);
            return;
        }
        // If the request is for a bare hostname, a .local address, or an IP
        // address, allow it.
        if (request.hostname.indexOf('.') < 0 ||
            request.hostname.endsWith('.local') ||
            (0, ip_regex_1.default)({ exact: true }).test(request.hostname)) {
            next();
            return;
        }
        if (request.method !== 'GET') {
            response.sendStatus(403);
            return;
        }
        if (request.headers.authorization) {
            response.sendStatus(403);
            return;
        }
        let httpsUrl = `https://${request.hostname}`;
        // If we're behind forwarding we can redirect to the port-free https url
        if (port !== 443 && !config_1.default.get('behindForwarding')) {
            httpsUrl += `:${port}`;
        }
        httpsUrl += request.url;
        response.redirect(301, httpsUrl);
    });
    // Use bodyParser to access the body of requests
    app.use(body_parser_1.default.urlencoded({
        extended: false,
    }));
    app.use(body_parser_1.default.json({
        limit: '1mb',
        strict: false,
    }));
    // Use fileUpload to handle multi-part uploads
    app.use((0, express_fileupload_1.default)());
    return app;
}
/**
 * @param {http.Server|https.Server} server
 * @return {express.Router}
 */
function createGatewayApp(server, isSecure) {
    const app = createApp(isSecure);
    // Inject WebSocket support
    (0, express_ws_1.default)(app, server);
    // Configure router with configured app.
    router_1.default.configure(app);
    return app;
}
exports.serverStartup = {
    promise: Promise.resolve(),
};
switch (Platform.getOS()) {
    case 'linux-raspbian':
        migration
            .then(() => {
            return (0, wifi_setup_1.isWiFiConfigured)();
        })
            .then((configured) => {
            if (!configured) {
                wifi_setup_1.WiFiSetupApp.onConnection = () => {
                    stopWiFiSetup();
                    startGateway();
                };
                startWiFiSetup();
            }
            else {
                startGateway();
            }
        });
        break;
    default:
        startGateway();
        break;
}
function startGateway() {
    // if we have the certificates installed, we start https
    if (tunnel_service_1.default.hasCertificates()) {
        exports.serverStartup.promise = tunnel_service_1.default.userSkipped().then((skipped) => {
            const promise = startHttpsGateway();
            // if the user opted to skip the tunnel, but still has certificates, go
            // ahead and start up the https server.
            if (skipped) {
                return promise;
            }
            // if they did not opt to skip, check if they have a tunnel token. if so,
            // start the tunnel.
            return promise.then((server) => {
                if (!server) {
                    console.error('Failed to start HTTPS gateway');
                }
                else {
                    tunnel_service_1.default.hasTunnelToken().then((result) => {
                        if (result) {
                            tunnel_service_1.default.setServerHandle(server);
                            tunnel_service_1.default.start();
                        }
                    });
                }
            });
        });
    }
    else {
        exports.serverStartup.promise = startHttpGateway();
    }
}
function gracefulExit() {
    addon_manager_1.default.unloadAddons();
    tunnel_service_1.default.stop();
}
// Get some decent error messages for unhandled rejections. This is
// often just errors in the code.
process.on('unhandledRejection', (reason) => {
    console.log('Unhandled Rejection');
    console.error(reason);
});
// Do graceful shutdown when Control-C is pressed.
process.on('SIGINT', () => {
    console.log('Control-C: Exiting gracefully');
    gracefulExit();
    process.exit(0);
});
// function to stop running server and start https
tunnel_service_1.default.switchToHttps = () => {
    stopHttpGateway();
    stopHttpsGateway();
    startHttpsGateway().then((server) => {
        if (!server) {
            console.error('Failed to start HTTPS gateway');
        }
        else {
            tunnel_service_1.default.setServerHandle(server);
        }
    });
};
//# sourceMappingURL=app.js.map