"use strict";
/**
 * Push API Controller.
 *
 * Implements the Push API for notifications to use
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const push_service_1 = __importDefault(require("../push-service"));
function build() {
    const controller = express_1.default.Router();
    /**
     * Handle requests for the public key
     */
    controller.get('/vapid-public-key', async (_request, response) => {
        const vapid = await push_service_1.default.getVAPIDKeys();
        if (!vapid) {
            response.status(500).json({ error: 'vapid not configured' });
            return;
        }
        response.status(200).json({ publicKey: vapid.publicKey });
    });
    controller.post('/register', async (request, response) => {
        const subscription = request.body.subscription;
        try {
            await push_service_1.default.createPushSubscription(subscription);
        }
        catch (err) {
            console.error(`controller: Failed to register ${subscription}`, err);
            response.status(500).json({ error: 'register failed' });
            return;
        }
        response.status(200).json({});
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=push_controller.js.map