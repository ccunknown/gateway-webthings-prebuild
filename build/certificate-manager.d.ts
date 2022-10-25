/**
 * Certificate Manager.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { Server } from 'https';
export interface TunnelToken {
    name: string;
    token: string;
    base: string;
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
export declare function register(email: string, reclamationToken: string | null, subdomain: string, fulldomain: string, optout: boolean, callback: (err?: string) => void): Promise<void>;
/**
 * Try to renew the certificates associated with this domain.
 *
 * @param {Object} server - HTTPS server handle
 */
export declare function renew(server: Server): Promise<void>;
//# sourceMappingURL=certificate-manager.d.ts.map