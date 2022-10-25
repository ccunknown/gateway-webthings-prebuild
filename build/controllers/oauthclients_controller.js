"use strict";
/**
 * OAuthClients Controller.
 *
 * Lists and revokes oauth client authorizations
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
const oauthclients_1 = __importDefault(require("../models/oauthclients"));
function build() {
    const controller = express_1.default.Router();
    /**
     * Get the currently authorized clients
     */
    controller.get('/', async (req, response) => {
        const request = req;
        const user = request.jwt.getUser();
        const clients = await oauthclients_1.default.getAuthorized(user);
        response.json(clients.map((client) => {
            return client.getDescription();
        }));
    });
    controller.delete('/:clientId', async (req, response) => {
        const request = req;
        const clientId = request.params.clientId;
        if (!oauthclients_1.default.get(clientId)) {
            response.status(404).send('Client not found');
            return;
        }
        const user = request.jwt.getUser();
        await oauthclients_1.default.revokeClientAuthorization(user, clientId);
        response.sendStatus(204);
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=oauthclients_controller.js.map