import express from 'express';
export declare const WiFiSetupApp: {
    onConnection: (() => void) | null;
    onRequest: express.Express;
};
/**
 * Determine whether or not we already have a connection.
 *
 * @returns {Promise} Promise which resolves to true/false, indicating whether
 *                    or not we have a connection.
 */
export declare function isWiFiConfigured(): Promise<boolean>;
//# sourceMappingURL=wifi-setup.d.ts.map