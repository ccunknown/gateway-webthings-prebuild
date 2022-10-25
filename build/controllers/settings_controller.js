"use strict";
/**
 * Settings Controller.
 *
 * Manages gateway settings.
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
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Constants = __importStar(require("../constants"));
const index_1 = __importDefault(require("../iso-639/index"));
const jwtMiddleware = __importStar(require("../jwt-middleware"));
const Platform = __importStar(require("../platform"));
const Settings = __importStar(require("../models/settings"));
const tunnel_service_1 = __importDefault(require("../tunnel-service"));
const CertificateManager = __importStar(require("../certificate-manager"));
const package_json_1 = __importDefault(require("../package.json"));
const errors_1 = require("../errors");
function build() {
    const auth = jwtMiddleware.middleware();
    const controller = express_1.default.Router();
    /**
     * Set an experiment setting.
     */
    controller.put('/experiments/:experimentName', auth, async (request, response) => {
        const experimentName = request.params.experimentName;
        if (!request.body || !request.body.hasOwnProperty('enabled')) {
            response.status(400).send('Enabled property not defined');
            return;
        }
        const enabled = request.body.enabled;
        try {
            const result = await Settings.setSetting(`experiments.${experimentName}.enabled`, enabled);
            response.status(200).json({ enabled: result });
        }
        catch (e) {
            console.error(`Failed to set setting experiments.${experimentName}`);
            console.error(e);
            response.status(400).send(e);
        }
    });
    /**
     * Get an experiment setting.
     */
    controller.get('/experiments/:experimentName', auth, async (request, response) => {
        const experimentName = request.params.experimentName;
        try {
            const result = await Settings.getSetting(`experiments.${experimentName}.enabled`);
            if (typeof result === 'undefined') {
                response.status(404).send('Setting not found');
            }
            else {
                response.status(200).json({ enabled: result });
            }
        }
        catch (e) {
            console.error(`Failed to get setting experiments.${experimentName}`);
            console.error(e);
            response.status(400).send(e);
        }
    });
    controller.post('/reclaim', async (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('subdomain')) {
            response.statusMessage = 'Subdomain missing from request';
            response.status(400).end();
            return;
        }
        const subdomain = request.body.subdomain;
        try {
            await (0, node_fetch_1.default)(`${config_1.default.get('ssltunnel.registration_endpoint')}/reclaim?name=${subdomain}`);
            response.status(200).json({});
        }
        catch (e) {
            console.error(e);
            response.statusMessage = `Error reclaiming domain - ${e}`;
            response.status(400).end();
        }
    });
    controller.post('/subscribe', async (request, response, next) => {
        if (!request.body ||
            !request.body.hasOwnProperty('email') ||
            !request.body.hasOwnProperty('subdomain') ||
            !request.body.hasOwnProperty('optout')) {
            response.statusMessage = 'Invalid request';
            response.status(400).end();
            return;
        }
        // increase the timeout for this request, as registration can take a while
        request.setTimeout(5 * 60 * 1000, () => {
            next(new errors_1.HttpErrorWithCode('Request Timeout', 408));
        });
        const email = request.body.email.trim().toLowerCase();
        const reclamationToken = request.body.reclamationToken.trim().toLowerCase();
        const subdomain = request.body.subdomain.trim().toLowerCase();
        const fulldomain = `${subdomain}.${config_1.default.get('ssltunnel.domain')}`;
        const optout = request.body.optout;
        function cb(err) {
            if (err) {
                response.statusMessage = `Error issuing certificate - ${err}`;
                response.status(400).end();
            }
            else {
                const endpoint = {
                    url: `https://${fulldomain}`,
                };
                tunnel_service_1.default.start(response, endpoint);
                tunnel_service_1.default.switchToHttps();
            }
        }
        await CertificateManager.register(email, reclamationToken, subdomain, fulldomain, optout, cb);
    });
    controller.post('/skiptunnel', async (_request, response) => {
        try {
            await Settings.setSetting('notunnel', true);
            response.status(200).json({});
        }
        catch (e) {
            console.error('Failed to set notunnel setting.');
            console.error(e);
            response.status(400).send(e);
        }
    });
    controller.get('/tunnelinfo', auth, async (_request, response) => {
        try {
            const tunnelDomain = await Settings.getTunnelInfo();
            response.status(200).json({ tunnelDomain });
        }
        catch (e) {
            console.error('Failed to retrieve default settings for tunneltoken:', e);
            response.status(400).send(e);
        }
    });
    controller.get('/domain', auth, async (_request, response) => {
        try {
            let hostname = '';
            if (Platform.implemented('getHostname')) {
                hostname = Platform.getHostname();
            }
            let enabled = false;
            if (Platform.implemented('getMdnsServerStatus')) {
                enabled = Platform.getMdnsServerStatus();
            }
            response.status(200).json({ hostname, enabled });
        }
        catch (e) {
            console.error('Failed to get domain settings:', e);
            response.status(400).end();
        }
    });
    /* This is responsible for controlling dynamically the local domain name
     * settings (via mDNS) and changing or updating tunnel endpoints.
     * The /domain endpoint is invoked from:
     *   MainMenu -> Settings -> Doamin
     *
     * JSON data: {
     *                enabled: boolean,
     *                hostname: string, - e.g. MyHome
     *            }
     */
    controller.put('/domain', auth, async (request, response) => {
        if (!request.body) {
            response.statusMessage = 'Invalid request.';
            response.status(400).end();
            return;
        }
        try {
            if (request.body.hasOwnProperty('hostname')) {
                const hostname = request.body.hostname;
                if (!Platform.implemented('setHostname') || !Platform.setHostname(hostname)) {
                    response.sendStatus(500);
                    return;
                }
            }
            else if (request.body.hasOwnProperty('enabled')) {
                const enabled = request.body.enabled;
                if (!Platform.implemented('setMdnsServerStatus') ||
                    !Platform.setMdnsServerStatus(enabled)) {
                    response.sendStatus(500);
                    return;
                }
            }
            else {
                response.statusMessage = 'Invalid request.';
                response.status(400).end();
                return;
            }
            let protocol, port;
            if (request.secure) {
                protocol = 'https';
                port = config_1.default.get('ports.https');
            }
            else {
                protocol = 'http';
                port = config_1.default.get('ports.http');
            }
            let domain = '';
            if (Platform.implemented('getHostname')) {
                domain = Platform.getHostname();
            }
            let state = false;
            if (Platform.implemented('getMdnsServerStatus')) {
                state = Platform.getMdnsServerStatus();
            }
            const url = `${protocol}://${domain}.local:${port}`;
            const localDomainSettings = {
                localDomain: url,
                update: true,
                enabled: state,
            };
            response.status(200).json(localDomainSettings);
        }
        catch (err) {
            console.error(`Failed setting domain with: ${err} `);
            let domain = '';
            if (Platform.implemented('getHostname')) {
                domain = Platform.getHostname();
            }
            let state = false;
            if (Platform.implemented('getMdnsServerStatus')) {
                state = Platform.getMdnsServerStatus();
            }
            const localDomainSettings = {
                localDomain: domain,
                update: false,
                enabled: state,
                error: err.message,
            };
            response.status(400).json(localDomainSettings);
        }
    });
    controller.get('/addonsInfo', auth, (_request, response) => {
        response.json({
            urls: config_1.default.get('addonManager.listUrls'),
            architecture: Platform.getArchitecture(),
            version: package_json_1.default.version,
            nodeVersion: Platform.getNodeVersion(),
            pythonVersions: Platform.getPythonVersions(),
            testAddons: config_1.default.get('addonManager.testAddons'),
        });
    });
    controller.get('/system/platform', auth, (_request, response) => {
        response.json({
            architecture: Platform.getArchitecture(),
            os: Platform.getOS(),
        });
    });
    controller.get('/system/ssh', auth, (_request, response) => {
        const toggleImplemented = Platform.implemented('setSshServerStatus');
        let enabled = false;
        if (Platform.implemented('getSshServerStatus')) {
            enabled = Platform.getSshServerStatus();
        }
        response.json({
            toggleImplemented,
            enabled,
        });
    });
    controller.put('/system/ssh', auth, (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('enabled')) {
            response.status(400).send('Enabled property not defined');
            return;
        }
        const toggleImplemented = Platform.implemented('setSshServerStatus');
        if (toggleImplemented) {
            const enabled = request.body.enabled;
            if (Platform.setSshServerStatus(enabled)) {
                response.status(200).json({ enabled });
            }
            else {
                response.status(400).send('Failed to toggle SSH');
            }
        }
        else {
            response.status(500).send('Toggle SSH not implemented');
        }
    });
    controller.post('/system/actions', auth, (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('action')) {
            response.status(400).send('Action property not defined');
            return;
        }
        const action = request.body.action;
        switch (action) {
            case 'restartGateway':
                if (Platform.implemented('restartGateway')) {
                    if (Platform.restartGateway()) {
                        response.status(200).json({});
                    }
                    else {
                        response.status(500).send('Failed to restart gateway');
                    }
                }
                else {
                    response.status(500).send('Restart gateway not implemented');
                }
                break;
            case 'restartSystem':
                if (Platform.implemented('restartSystem')) {
                    if (Platform.restartSystem()) {
                        response.status(200).json({});
                    }
                    else {
                        response.status(500).send('Failed to restart system');
                    }
                }
                else {
                    response.status(500).send('Restart system not implemented');
                }
                break;
            default:
                response.status(400).send('Unsupported action');
                break;
        }
    });
    controller.get('/system/ntp', (_request, response) => {
        const statusImplemented = Platform.implemented('getNtpStatus');
        let synchronized = false;
        if (statusImplemented) {
            synchronized = Platform.getNtpStatus();
        }
        response.json({
            statusImplemented,
            synchronized,
        });
    });
    controller.post('/system/ntp', (_request, response) => {
        if (Platform.implemented('restartNtpSync')) {
            if (Platform.restartNtpSync()) {
                response.status(200).json({});
            }
            else {
                response.status(500).send('Failed to restart NTP sync');
            }
        }
        else {
            response.status(500).send('Restart NTP sync not implemented');
        }
    });
    controller.get('/network/dhcp', auth, (_request, response) => {
        if (Platform.implemented('getDhcpServerStatus')) {
            response.json({ enabled: Platform.getDhcpServerStatus() });
        }
        else {
            response.status(500).send('DHCP status not implemented');
        }
    });
    controller.put('/network/dhcp', auth, (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('enabled')) {
            response.status(400).send('Missing enabled property');
            return;
        }
        const enabled = request.body.enabled;
        if (Platform.implemented('setDhcpServerStatus')) {
            if (Platform.setDhcpServerStatus(enabled)) {
                response.status(200).json({});
            }
            else {
                response.status(500).send('Failed to toggle DHCP');
            }
        }
        else {
            response.status(500).send('Toggle DHCP not implemented');
        }
    });
    controller.get('/network/lan', auth, (_request, response) => {
        if (Platform.implemented('getLanMode')) {
            response.json(Platform.getLanMode());
        }
        else {
            response.status(500).send('LAN mode not implemented');
        }
    });
    controller.put('/network/lan', auth, (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('mode')) {
            response.status(400).send('Missing mode property');
            return;
        }
        const mode = request.body.mode;
        const options = request.body.options;
        if (Platform.implemented('setLanMode')) {
            if (Platform.setLanMode(mode, options)) {
                response.status(200).json({});
            }
            else {
                response.status(500).send('Failed to update LAN configuration');
            }
        }
        else {
            response.status(500).send('Setting LAN mode not implemented');
        }
    });
    controller.get('/network/wireless', auth, (_request, response) => {
        if (Platform.implemented('getWirelessMode')) {
            response.json(Platform.getWirelessMode());
        }
        else {
            response.status(500).send('Wireless mode not implemented');
        }
    });
    controller.get('/network/wireless/networks', auth, (_request, response) => {
        if (Platform.implemented('scanWirelessNetworks')) {
            response.json(Platform.scanWirelessNetworks());
        }
        else {
            response.status(500).send('Wireless scanning not implemented');
        }
    });
    controller.put('/network/wireless', auth, (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('enabled')) {
            response.status(400).send('Missing enabled property');
            return;
        }
        const enabled = request.body.enabled;
        const mode = request.body.mode;
        const options = request.body.options;
        if (Platform.implemented('setWirelessMode')) {
            if (Platform.setWirelessMode(enabled, mode, options)) {
                response.status(200).json({});
            }
            else {
                response.status(500).send('Failed to update wireless configuration');
            }
        }
        else {
            response.status(500).send('Setting wireless mode not implemented');
        }
    });
    controller.get('/network/addresses', auth, (_request, response) => {
        if (Platform.implemented('getNetworkAddresses')) {
            response.json(Platform.getNetworkAddresses());
        }
        else {
            response.status(500).send('Network addresses not implemented');
        }
    });
    controller.get('/localization/country', auth, (_request, response) => {
        let valid = [];
        if (Platform.implemented('getValidWirelessCountries')) {
            valid = Platform.getValidWirelessCountries();
        }
        let current = '';
        if (Platform.implemented('getWirelessCountry')) {
            current = Platform.getWirelessCountry();
        }
        const setImplemented = Platform.implemented('setWirelessCountry');
        response.json({ valid, current, setImplemented });
    });
    controller.put('/localization/country', auth, (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('country')) {
            response.status(400).send('Missing country property');
            return;
        }
        if (Platform.implemented('setWirelessCountry')) {
            if (Platform.setWirelessCountry(request.body.country)) {
                response.status(200).json({});
            }
            else {
                response.status(500).send('Failed to update country');
            }
        }
        else {
            response.status(500).send('Setting country not implemented');
        }
    });
    controller.get('/localization/timezone', auth, (_request, response) => {
        let valid = [];
        if (Platform.implemented('getValidTimezones')) {
            valid = Platform.getValidTimezones();
        }
        let current = '';
        if (Platform.implemented('getTimezone')) {
            current = Platform.getTimezone();
        }
        const setImplemented = Platform.implemented('setTimezone');
        response.json({ valid, current, setImplemented });
    });
    controller.put('/localization/timezone', auth, (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('zone')) {
            response.status(400).send('Missing zone property');
            return;
        }
        if (Platform.implemented('setTimezone')) {
            if (Platform.setTimezone(request.body.zone)) {
                response.status(200).json({});
            }
            else {
                response.status(500).send('Failed to update timezone');
            }
        }
        else {
            response.status(500).send('Setting timezone not implemented');
        }
    });
    controller.get('/localization/language', auth, async (_request, response) => {
        const fluentDir = path_1.default.join(Constants.BUILD_STATIC_PATH, 'fluent');
        const valid = [];
        try {
            for (const dirname of fs_1.default.readdirSync(fluentDir)) {
                const name = (0, index_1.default)(dirname);
                if (!name) {
                    console.error('Unknown language code:', dirname);
                    continue;
                }
                valid.push({
                    code: dirname,
                    name,
                });
            }
            valid.sort((a, b) => a.name.localeCompare(b.name));
        }
        catch (e) {
            console.log(e);
            response.status(500).send('Failed to retrieve list of languages');
            return;
        }
        try {
            const current = await Settings.getSetting('localization.language');
            response.json({ valid, current });
        }
        catch (_) {
            response.status(500).send('Failed to get current language');
        }
    });
    controller.put('/localization/language', auth, async (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('language')) {
            response.status(400).send('Missing language property');
            return;
        }
        try {
            await Settings.setSetting('localization.language', request.body.language);
            response.json({});
        }
        catch (_) {
            response.status(500).send('Failed to set language');
        }
    });
    controller.get('/localization/units', auth, async (_request, response) => {
        let temperature;
        try {
            temperature = await Settings.getSetting('localization.units.temperature');
        }
        catch (e) {
            // pass
        }
        response.json({
            temperature: temperature || 'degree celsius',
        });
    });
    controller.put('/localization/units', auth, async (request, response) => {
        for (const [key, value] of Object.entries(request.body)) {
            try {
                await Settings.setSetting(`localization.units.${key}`, value);
            }
            catch (_) {
                response.status(500).send('Failed to set unit');
                return;
            }
        }
        response.json({});
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=settings_controller.js.map