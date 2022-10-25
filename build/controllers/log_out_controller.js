"use strict";
/**
 * LogOut Controller.
 *
 * Handles logging out the user.
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
const jsonwebtoken_1 = __importDefault(require("../models/jsonwebtoken"));
function build() {
    const controller = express_1.default.Router();
    /**
     * Log out the user
     */
    controller.post('/', async (req, response) => {
        const request = req;
        await jsonwebtoken_1.default.revokeToken(request.jwt.getKeyId());
        response.status(200).json({});
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=log_out_controller.js.map