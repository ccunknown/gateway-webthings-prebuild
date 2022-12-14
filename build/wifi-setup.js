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
exports.isWiFiConfigured = exports.WiFiSetupApp = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const config_1 = __importDefault(require("config"));
const Constants = __importStar(require("./constants"));
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const os_1 = __importDefault(require("os"));
const Platform = __importStar(require("./platform"));
const Settings = __importStar(require("./models/settings"));
const sleep_1 = __importDefault(require("./sleep"));
const hbs = express_handlebars_1.default.create({
    helpers: {
        escapeQuotes: (str) => `${str}`.replace(/"/g, '\\"'),
    },
    defaultLayout: undefined,
    layoutsDir: Constants.VIEWS_PATH,
});
// The express server
const app = (0, express_1.default)();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', Constants.VIEWS_PATH);
// When we get POSTs, handle the body like this
app.use(body_parser_1.default.urlencoded({ extended: false }));
// Define the handler methods for the various URLs we handle
app.get('/*', handleCaptive);
app.get('/', handleRoot);
app.get('/wifi-setup', handleWiFiSetup);
app.post('/connecting', handleConnecting);
app.use(express_1.default.static(Constants.BUILD_STATIC_PATH));
exports.WiFiSetupApp = {
    onConnection: null,
    onRequest: app,
};
/**
 * Handle captive portal requests.
 */
function handleCaptive(request, response, next) {
    console.log('wifi-setup: handleCaptive:', request.path);
    switch (request.path) {
        case '/hotspot.html': {
            // WISPr XML response
            const ssid = getHotspotSsid();
            response.render('hotspot', {
                ap_ssid: ssid,
                ap_ip: config_1.default.get('wifi.ap.ipaddr'),
            });
            break;
        }
        case '/hotspot-detect.html': // iOS/macOS
        case '/library/test/success.html': // iOS/macOS
        case '/connecttest.txt': {
            // Windows
            const ua = request.get('User-Agent');
            // These 2 user-agents expect a WISPr XML response
            if (ua && (ua.includes('CaptiveNetworkSupport') || ua.includes('Microsoft NCSI'))) {
                response.redirect(302, `http://${config_1.default.get('wifi.ap.ipaddr')}/hotspot.html`);
                break;
            }
            // otherwise, fall through
        }
        // eslint-disable-next-line no-fallthrough
        case '/kindle-wifi/wifistub.html': // Kindle
        case '/generate_204': // Android, Chrome
        case '/fwlink/': // Windows
        case '/redirect': // Windows
        case '/success.txt': // Firefox
            // Redirect to the wifi setup page
            response.redirect(302, `http://${config_1.default.get('wifi.ap.ipaddr')}/wifi-setup`);
            break;
        default:
            console.log('wifi-setup: handleCaptive: unknown path, skipping.');
            next();
            break;
    }
}
/**
 * Handle requests to the root URL. We display a different page depending on
 * what stage of setup we're at.
 */
function handleRoot(_request, response) {
    const status = Platform.getWirelessMode();
    if (!(status.enabled && status.mode === 'sta')) {
        // If we don't have a wifi connection yet, display the wifi setup page
        console.log('wifi-setup: handleRoot: no wifi connection; redirecting to wifiSetup');
        response.redirect('/wifi-setup');
    }
    else {
        // Otherwise, look to see if we have an oauth token yet
        console.log('wifi-setup: handleRoot: wifi setup complete; redirecting to /status');
        response.redirect('/status');
    }
}
/**
 * Handle requests to /wifi-setup.
 */
function handleWiFiSetup(_request, response) {
    scan().then((results) => {
        // XXX
        // To handle the case where the user entered a bad password and we are
        // not connected, we should show the networks we know about, and modify
        // the template to explain that if the user is seeing it, it means
        // that the network is down or password is bad. This allows the user
        // to re-enter a network.  Hopefully wpa_supplicant is smart enough
        // to do the right thing if there are two entries for the same ssid.
        // If not, we could modify defineNetwork() to overwrite rather than
        // just adding.
        let networks = [];
        if (results) {
            networks = results.map((result) => {
                const icon = result.encryption ? 'wifi-secure.svg' : 'wifi.svg';
                return {
                    icon: `/images/${icon}`,
                    pwdRequired: result.encryption,
                    ssid: result.ssid,
                };
            });
        }
        response.render('wifi-setup', { networks });
    });
}
/**
 * Handle requests to /connecting.
 */
function handleConnecting(request, response) {
    // We assume getHostname is implemented, since this is only used on Raspberry Pi right now.
    const domain = Platform.getHostname();
    const skip = request.body.skip === '1';
    if (skip) {
        console.log('wifi-setup: handleConnecting: wifi setup skipped, stopping the AP.');
        Settings.setSetting('wifiskip', true)
            .catch((e) => {
            console.error('wifi-setup: handleConnecting: failed to store wifiskip:', e);
        })
            .then(() => {
            response.render('connecting', {
                skip: `${skip}`,
                domain,
            });
            stopAP();
            exports.WiFiSetupApp.onConnection();
        });
        return;
    }
    const ssid = request.body.ssid.trim();
    const password = request.body.password.trim();
    // XXX
    // We can come back here from the status page if the user defines
    // more than one network. We always need to call defineNetwork(), but
    // only need to call stopAP() if we're actually in ap mode.
    //
    // Also, if we're not in AP mode, then we should just redirect to
    // /status instead of sending the connecting template.
    response.render('connecting', {
        skip: `${skip}`,
        domain,
    });
    // Wait before switching networks to make sure the response gets through.
    // And also wait to be sure that the access point is fully down before
    // defining the new network. If I only wait two seconds here, it seems
    // like the Edison takes a really long time to bring up the new network
    // but a 5 second wait seems to work better.
    (0, sleep_1.default)(2000)
        .then(() => {
        stopAP();
        return (0, sleep_1.default)(5000);
    })
        .then(() => {
        if (!defineNetwork(ssid, password)) {
            console.error('wifi-setup: handleConnecting: failed to define network');
            throw new Error('failed to define network');
        }
        else {
            return waitForWiFi(20, 3000).then(() => {
                exports.WiFiSetupApp.onConnection();
            });
        }
    })
        .catch((error) => {
        if (error) {
            console.error('wifi-setup: handleConnecting: general error:', error);
        }
    });
}
/**
 * Get the SSID of the hotspot.
 *
 * @returns {string} SSID
 */
function getHotspotSsid() {
    const base = config_1.default.get('wifi.ap.ssid_base');
    const mac = Platform.getMacAddress('wlan0');
    if (!mac) {
        return base;
    }
    // Get the last 2 octets of the MAC and create a simple string, e.g. 9E28
    const id = mac.split(':').slice(4).join('').toUpperCase();
    return `${base} ${id}`;
}
/**
 * Scan for available wifi networks.
 *
 * @returns {Promise<Object[]>} Promise which resolves to the list of networks:
 *                              [
 *                                {
 *                                  ssid: '...',
 *                                  quality: ...,
 *                                  encryption: true|false
 *                                },
 *                                ...
 *                              ]
 */
function scan() {
    const maxAttempts = 5;
    return new Promise(function (resolve) {
        let attempts = 0;
        function tryScan() {
            attempts++;
            const results = Platform.scanWirelessNetworks();
            if (results.length > 0) {
                resolve(results);
            }
            else {
                console.log('wifi-setup: scan: Scan attempt', attempts, 'failed');
                if (attempts >= maxAttempts) {
                    console.error('wifi-setup: scan: Giving up. No scan results available.');
                    resolve([]);
                }
                else {
                    console.log('wifi-setup: scan: Will try again in 3 seconds.');
                    setTimeout(tryScan, 3000);
                }
            }
        }
        tryScan();
    });
}
/**
 * Enable an access point that users can connect to to configure the device.
 *
 * This requires that hostapd and udhcpd are installed on the system but not
 * enabled, so that they do not automatically run when the device boots up.
 * This also requires that hostapd and udhcpd have appropriate config files
 * that define the SSID for the wifi network to be created, for example.
 * Also, the udhcpd config file should be set up to work with the IP address
 * of the device.
 *
 * @param {string} ipaddr - IP address of AP
 * @returns {boolean} Boolean indicating success of the command.
 */
function startAP(ipaddr) {
    const ssid = getHotspotSsid();
    if (!Platform.setWirelessMode(true, 'ap', { ssid, ipaddr })) {
        return false;
    }
    return Platform.setDhcpServerStatus(true);
}
/**
 * Stop the running access point.
 *
 * @returns {boolean} Boolean indicating success of the command.
 */
function stopAP() {
    if (!Platform.setWirelessMode(false, 'ap')) {
        return false;
    }
    return Platform.setDhcpServerStatus(false);
}
/**
 * Define a new network and connect to it.
 *
 * @param {string} ssid - SSID to configure
 * @param {string?} password - PSK to configure
 * @returns {boolean} Boolean indicating success of the command.
 */
function defineNetwork(ssid, password) {
    return Platform.setWirelessMode(true, 'sta', { ssid, key: password });
}
/**
 * Determine whether or not we already have a connection.
 *
 * @returns {Promise} Promise which resolves to true/false, indicating whether
 *                    or not we have a connection.
 */
function isWiFiConfigured() {
    const ensureAPStopped = () => {
        // If the host seems to be in AP mode (e.g. from a previous run), stop it
        if (Platform.getDhcpServerStatus() || Platform.getWirelessMode().mode === 'ap') {
            stopAP();
        }
    };
    return Settings.getSetting('wifiskip')
        .catch(() => false)
        .then((skipped) => {
        if (skipped) {
            ensureAPStopped();
            return Promise.resolve(true);
        }
        // If wifi wasn't skipped, but there is an ethernet connection, just move on
        const addresses = Platform.getNetworkAddresses();
        if (addresses.lan) {
            ensureAPStopped();
            return Promise.resolve(true);
        }
        // Wait until we have a working wifi connection. Retry every 3 seconds up
        // to 20 times. If we never get a wifi connection, go into AP mode.
        return waitForWiFi(20, 3000)
            .then(() => {
            ensureAPStopped();
            return true;
        })
            .catch((err) => {
            if (err) {
                console.error('wifi-setup: isWiFiConfigured: Error waiting:', err);
            }
            console.log('wifi-setup: isWiFiConfigured: No wifi connection found, starting AP');
            if (!startAP(config_1.default.get('wifi.ap.ipaddr'))) {
                console.error('wifi-setup: isWiFiConfigured: failed to start AP');
            }
            return false;
        });
    });
}
exports.isWiFiConfigured = isWiFiConfigured;
/**
 * Wait for a wifi connection.
 *
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} interval - Interval at which to check, in milliseconds
 * @returns {Promise} Promise which resolves when we're connected. If we
 *                    aren't connected after maxAttempts attempts, then the
 *                    promise is rejected.
 */
function waitForWiFi(maxAttempts, interval) {
    return new Promise(function (resolve, reject) {
        let attempts = 0;
        // first, see if any networks are already configured
        const status = Platform.getWirelessMode();
        if (status.options &&
            status.options.networks &&
            status.options.networks.length > 0) {
            // there's at least one wifi network configured. Let's wait to see if it
            // will connect.
            console.log('wifi-setup: waitForWiFi: networks exist:', status.options.networks);
            check();
        }
        else {
            // No wifi network configured. Let's skip the wait and start the setup
            // immediately.
            reject();
        }
        function check() {
            attempts++;
            const status = Platform.getWirelessMode();
            if (status.enabled && status.mode === 'sta') {
                console.log('wifi-setup: waitForWifi: connection found');
                checkForAddress();
            }
            else {
                console.log('wifi-setup: waitForWifi: No wifi connection on attempt', attempts);
                retryOrGiveUp();
            }
        }
        function checkForAddress() {
            const ifaces = os_1.default.networkInterfaces();
            if (ifaces.hasOwnProperty('wlan0')) {
                for (const addr of ifaces.wlan0) {
                    if (addr.family !== 'IPv4' || addr.internal) {
                        continue;
                    }
                    resolve();
                    return;
                }
            }
            retryOrGiveUp();
        }
        function retryOrGiveUp() {
            if (attempts >= maxAttempts) {
                console.error('wifi-setup: waitForWiFi: No wifi available, giving up.');
                reject();
            }
            else {
                setTimeout(check, interval);
            }
        }
    });
}
//# sourceMappingURL=wifi-setup.js.map