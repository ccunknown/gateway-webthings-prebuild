"use strict";
/**
 * Gateway tunnel service.
 *
 * Manages the tunnel service.
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
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("config"));
const deferred_1 = __importDefault(require("./deferred"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const child_process_1 = require("child_process");
const Settings = __importStar(require("./models/settings"));
const user_profile_1 = __importDefault(require("./user-profile"));
const push_service_1 = __importDefault(require("./push-service"));
const CertificateManager = __importStar(require("./certificate-manager"));
const DEBUG = false || process.env.NODE_ENV === 'test';
class TunnelService {
    constructor() {
        this.pagekiteProcess = null;
        this.tunnelToken = null;
        this.connected = new deferred_1.default();
        this.pingInterval = null;
        this.renewInterval = null;
        this.server = null;
        this.switchToHttps = null;
    }
    /*
     * Router middleware to check if we have a ssl tunnel set.
     *
     * @param {Object} request Express request object.
     * @param {Object} response Express response object.
     * @param {Object} next Next middleware.
     */
    async isTunnelSet(_request, response, next) {
        // If ssl tunnel is disabled, continue
        if (!config_1.default.get('ssltunnel.enabled')) {
            return next();
        }
        else {
            let notunnel = await Settings.getSetting('notunnel');
            if (typeof notunnel !== 'boolean') {
                notunnel = false;
            }
            // then we check if we have certificates installed
            if ((fs_1.default.existsSync(path_1.default.join(user_profile_1.default.sslDir, 'certificate.pem')) &&
                fs_1.default.existsSync(path_1.default.join(user_profile_1.default.sslDir, 'privatekey.pem'))) ||
                notunnel) {
                // if certs are installed,
                // then we don't need to do anything and return
                return next();
            }
            // if there are no certs installed,
            // we display the cert setup page to the user
            response.render('tunnel-setup', { domain: config_1.default.get('ssltunnel.domain') });
        }
    }
    // Set a handle for the running https server, used when renewing certificates
    setServerHandle(server) {
        this.server = server;
    }
    // method that starts the client if the box has a registered tunnel
    start(response, urlredirect) {
        Settings.getSetting('tunneltoken')
            .then((result) => {
            if (typeof result === 'object') {
                const token = result;
                if (!token.base) {
                    // handle legacy tunnels
                    token.base = 'mozilla-iot.org';
                    Settings.setSetting('tunneltoken', token).catch((e) => {
                        console.error('Failed to set tunneltoken.base:', e);
                    });
                }
                let responseSent = false;
                this.tunnelToken = token;
                const endpoint = `${token.name}.${token.base}`;
                this.pagekiteProcess = (0, child_process_1.spawn)(config_1.default.get('ssltunnel.pagekite_cmd'), [
                    '--clean',
                    `--frontend=${endpoint}:${config_1.default.get('ssltunnel.port')}`,
                    `--service_on=https:${endpoint}:localhost:${config_1.default.get('ports.https')}:${this.tunnelToken.token}`,
                ], { shell: true });
                this.pagekiteProcess.stdout.on('data', (data) => {
                    if (DEBUG) {
                        console.log(`[pagekite] stdout: ${data}`);
                    }
                    const needToSend = response && !responseSent;
                    if (data.indexOf('err=Error in connect') > -1) {
                        console.error('PageKite failed to connect');
                        this.connected.reject();
                        if (needToSend) {
                            responseSent = true;
                            response.sendStatus(400);
                        }
                    }
                    else if (data.indexOf('connect=') > -1) {
                        console.log('PageKite connected!');
                        this.connected.resolve();
                        if (needToSend) {
                            responseSent = true;
                            response.status(200).json(urlredirect);
                        }
                    }
                });
                this.pagekiteProcess.stderr.on('data', (data) => {
                    console.log(`[pagekite] stderr: ${data}`);
                });
                this.pagekiteProcess.on('close', (code) => {
                    console.log(`[pagekite] process exited with code ${code}`);
                });
                this.connected
                    .getPromise()
                    .then(() => {
                    // Ping the registration server every hour.
                    this.pingInterval = setInterval(() => this.pingRegistrationServer(), 60 * 60 * 1000);
                    // Enable push service
                    push_service_1.default.init(`https://${endpoint}`);
                    const renew = () => {
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        return CertificateManager.renew(this.server).catch(() => { });
                    };
                    // Try to renew certificates immediately, then daily.
                    renew().then(() => {
                        this.renewInterval = setInterval(renew, 24 * 60 * 60 * 1000);
                    });
                })
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    .catch(() => { });
            }
            else {
                console.error('tunneltoken not set');
                if (response) {
                    response.status(400).end();
                }
            }
        })
            .catch((e) => {
            console.error('Failed to get tunneltoken setting:', e);
            if (response) {
                response.status(400).send(e);
            }
        });
    }
    // method to stop pagekite process
    stop() {
        if (this.pingInterval !== null) {
            clearInterval(this.pingInterval);
        }
        if (this.renewInterval !== null) {
            clearInterval(this.renewInterval);
        }
        if (this.pagekiteProcess) {
            this.pagekiteProcess.kill('SIGHUP');
        }
    }
    // method to check if the box has certificates
    hasCertificates() {
        return (fs_1.default.existsSync(path_1.default.join(user_profile_1.default.sslDir, 'certificate.pem')) &&
            fs_1.default.existsSync(path_1.default.join(user_profile_1.default.sslDir, 'privatekey.pem')));
    }
    // method to check if the box has a registered tunnel
    async hasTunnelToken() {
        const tunneltoken = await Settings.getSetting('tunneltoken');
        return typeof tunneltoken === 'object';
    }
    // method to check if user skipped the ssl tunnel setup
    async userSkipped() {
        const notunnel = await Settings.getSetting('notunnel');
        if (typeof notunnel === 'boolean' && notunnel) {
            return true;
        }
        return false;
    }
    // method to ping the registration server to track active domains
    pingRegistrationServer() {
        const url = `${config_1.default.get('ssltunnel.registration_endpoint')}/ping?token=${this.tunnelToken.token}`;
        (0, node_fetch_1.default)(url).catch((e) => {
            console.log('Failed to ping registration server:', e);
        });
    }
}
exports.default = new TunnelService();
//# sourceMappingURL=tunnel-service.js.map