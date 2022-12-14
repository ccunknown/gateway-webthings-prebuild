"use strict";
/**
 * Certificate Manager.
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
exports.renew = exports.register = void 0;
const acme = __importStar(require("acme-client"));
const config_1 = __importDefault(require("config"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Settings = __importStar(require("./models/settings"));
const sleep_1 = __importDefault(require("./sleep"));
const url_1 = require("url");
const user_profile_1 = __importDefault(require("./user-profile"));
const DEBUG = false || process.env.NODE_ENV === 'test';
const DIRECTORY_URL = acme.directory.letsencrypt.production;
// For test purposes, uncomment the following:
// const DIRECTORY_URL = acme.directory.letsencrypt.staging;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/**
 * Write certificates generated by registration/renewal to disk.
 *
 * @param {string} certificate - The generated certificate
 * @param {string} privateKey - The generated private key
 * @param {string} chain - The generated certificate chain
 */
function writeCertificates(certificate, privateKey, chain) {
    fs_1.default.writeFileSync(path_1.default.join(user_profile_1.default.sslDir, 'certificate.pem'), certificate);
    fs_1.default.writeFileSync(path_1.default.join(user_profile_1.default.sslDir, 'privatekey.pem'), privateKey);
    fs_1.default.writeFileSync(path_1.default.join(user_profile_1.default.sslDir, 'chain.pem'), chain);
}
/**
 * Register domain with Let's Encrypt and get certificates.
 *
 * @param {string} email - User's email address
 * @param {string?} reclamationToken - Reclamation token, if applicable
 * @param {string} subdomain - The subdomain being registered
 * @param {string} fulldomain - The full domain being registered
 * @param {boolean} optout - Whether or not the user opted out of emails
 * @param {function} callback - Callback function
 */
async function register(email, reclamationToken, subdomain, fulldomain, optout, callback) {
    if (DEBUG) {
        console.debug('Starting registration:', email, reclamationToken, subdomain, fulldomain, optout);
    }
    else {
        console.log('Starting registration');
    }
    const endpoint = config_1.default.get('ssltunnel.registration_endpoint');
    let token;
    // First, try to register the subdomain with the registration server.
    try {
        const params = new url_1.URLSearchParams();
        params.set('name', subdomain);
        params.set('email', email);
        if (reclamationToken) {
            params.set('reclamationToken', reclamationToken.trim());
        }
        const subscribeUrl = `${endpoint}/subscribe?${params.toString()}`;
        const res = await (0, node_fetch_1.default)(subscribeUrl);
        const jsonToken = await res.json();
        if (DEBUG) {
            console.debug('Sent subscription to registration server:', jsonToken);
        }
        else {
            console.log('Sent subscription to registration server');
        }
        if (jsonToken.error) {
            console.log('Error received from registration server:', jsonToken.error);
            callback(jsonToken.error);
            return;
        }
        jsonToken.base = config_1.default.get('ssltunnel.domain');
        token = jsonToken.token;
        // Store the token in the db
        await Settings.setSetting('tunneltoken', jsonToken);
    }
    catch (e) {
        console.error('Failed to subscribe:', e);
        callback(e.message);
        return;
    }
    // Now we associate user's email with the subdomain, unless it was reclaimed
    if (!reclamationToken) {
        const params = new url_1.URLSearchParams();
        params.set('token', token);
        params.set('email', email);
        params.set('optout', optout ? '1' : '0');
        try {
            await (0, node_fetch_1.default)(`${endpoint}/setemail?${params.toString()}`);
            console.log('Set email on server.');
        }
        catch (e) {
            console.error('Failed to set email on server:', e);
            callback(e.message);
            return;
        }
    }
    /**
     * Function used to satisfy an ACME challenge
     *
     * @param {object} authz Authorization object
     * @param {object} challenge Selected challenge
     * @param {string} keyAuthorization Authorization key
     * @returns {Promise}
     */
    const challengeCreateFn = async (_authz, _challenge, keyAuthorization) => {
        const params = new url_1.URLSearchParams();
        params.set('token', token);
        params.set('challenge', keyAuthorization);
        // Now that we have a challenge, we call our registration server to
        // setup the TXT record
        const response = await (0, node_fetch_1.default)(`${endpoint}/dnsconfig?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to set DNS token on server: ${response.status}`);
        }
        console.log('Set DNS token on registration server');
        // Let's wait a few seconds for changes to propagate on the registration
        // server and its database.
        await (0, sleep_1.default)(2500);
    };
    /**
     * Function used to remove an ACME challenge response
     *
     * @param {object} authz Authorization object
     * @param {object} challenge Selected challenge
     * @param {string} keyAuthorization Authorization key
     * @returns {Promise}
     */
    const challengeRemoveFn = async () => {
        // do nothing for now
    };
    try {
        // create an ACME client
        const client = new acme.Client({
            directoryUrl: DIRECTORY_URL,
            accountKey: await acme.forge.createPrivateKey(),
        });
        // create a CSR
        const [key, csr] = await acme.forge.createCsr({
            commonName: fulldomain,
        });
        // run the ACME registration
        const cert = await client.auto({
            csr,
            email: config_1.default.get('ssltunnel.certemail'),
            termsOfServiceAgreed: true,
            skipChallengeVerification: true,
            challengePriority: ['dns-01'],
            challengeCreateFn,
            challengeRemoveFn,
        });
        if (DEBUG) {
            console.debug('Private Key:', key.toString());
            console.debug('CSR:', csr.toString());
            console.debug('Certificate(s):', cert.toString());
        }
        else {
            // eslint-disable-next-line @typescript-eslint/quotes
            console.log("Received certificate from Let's Encrypt");
        }
        const chain = cert
            .toString()
            .trim()
            .split(/[\r\n]{2,}/g)
            .map((s) => `${s}\n`);
        writeCertificates(chain[0], key.toString(), chain.join('\n'));
        console.log('Wrote certificates to file system');
    }
    catch (e) {
        console.error('Failed to generate certificate:', e);
        callback(e.message);
        return;
    }
    try {
        await (0, node_fetch_1.default)(`${endpoint}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                subscribe: !optout,
            }),
        });
    }
    catch (e) {
        console.error('Failed to subscribe to newsletter:', e);
    }
    console.log('Registration success!');
    callback();
}
exports.register = register;
/**
 * Try to renew the certificates associated with this domain.
 *
 * @param {Object} server - HTTPS server handle
 */
async function renew(server) {
    console.log('Starting certificate renewal.');
    // Check if we need to renew yet
    try {
        const oldCert = fs_1.default.readFileSync(path_1.default.join(user_profile_1.default.sslDir, 'certificate.pem'));
        const info = await acme.forge.readCertificateInfo(oldCert);
        const now = new Date().getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (info.notAfter.getTime() - now >= oneWeek) {
            console.log('Certificate not yet due for renewal.');
            return;
        }
    }
    catch (_e) {
        // pass. move on to renewal.
    }
    let tunnelToken;
    try {
        tunnelToken = await Settings.getSetting('tunneltoken');
    }
    catch (e) {
        console.error('Tunnel token not set!');
        return;
    }
    /**
     * Function used to satisfy an ACME challenge
     *
     * @param {object} authz Authorization object
     * @param {object} challenge Selected challenge
     * @param {string} keyAuthorization Authorization key
     * @returns {Promise}
     */
    const challengeCreateFn = async (_authz, _challenge, keyAuthorization) => {
        const params = new url_1.URLSearchParams();
        params.set('token', tunnelToken.token);
        params.set('challenge', keyAuthorization);
        // Now that we have a challenge, we call our registration server to
        // setup the TXT record
        const endpoint = config_1.default.get('ssltunnel.registration_endpoint');
        const response = await (0, node_fetch_1.default)(`${endpoint}/dnsconfig?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to set DNS token on server: ${response.status}`);
        }
        console.log('Set DNS token on registration server');
        // Let's wait a few seconds for changes to propagate on the registration
        // server and its database.
        await (0, sleep_1.default)(2500);
    };
    /**
     * Function used to remove an ACME challenge response
     *
     * @param {object} authz Authorization object
     * @param {object} challenge Selected challenge
     * @param {string} keyAuthorization Authorization key
     * @returns {Promise}
     */
    const challengeRemoveFn = async () => {
        // do nothing for now
    };
    const domain = `${tunnelToken.name}.${tunnelToken.base}`;
    try {
        // create an ACME client
        const client = new acme.Client({
            directoryUrl: DIRECTORY_URL,
            accountKey: await acme.forge.createPrivateKey(),
        });
        // create a CSR
        const [key, csr] = await acme.forge.createCsr({
            commonName: domain,
        });
        // run the ACME registration
        const cert = await client.auto({
            csr,
            email: config_1.default.get('ssltunnel.certemail'),
            termsOfServiceAgreed: true,
            skipChallengeVerification: true,
            challengePriority: ['dns-01'],
            challengeCreateFn,
            challengeRemoveFn,
        });
        if (DEBUG) {
            console.debug('Private Key:', key.toString());
            console.debug('CSR:', csr.toString());
            console.debug('Certificate(s):', cert.toString());
        }
        else {
            // eslint-disable-next-line @typescript-eslint/quotes
            console.log("Received certificate from Let's Encrypt");
        }
        const chain = cert
            .toString()
            .trim()
            .split(/[\r\n]{2,}/g)
            .map((s) => `${s}\n`);
        writeCertificates(chain[0], key.toString(), chain.join('\n'));
        console.log('Wrote certificates to file system');
        if (server) {
            const ctx = (server._sharedCreds.context);
            ctx.setCert(chain[0]);
            ctx.setKey(key.toString());
            ctx.addCACert(chain.join('\n'));
        }
    }
    catch (e) {
        console.error('Failed to renew certificate:', e);
        return;
    }
    console.log('Renewal success!');
}
exports.renew = renew;
//# sourceMappingURL=certificate-manager.js.map