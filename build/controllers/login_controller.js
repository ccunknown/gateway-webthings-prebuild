"use strict";
/**
 * Login Controller.
 *
 * Handles user login.
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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const Constants = __importStar(require("../constants"));
const Passwords = __importStar(require("../passwords"));
const Users = __importStar(require("../models/users"));
const jsonwebtoken_1 = __importDefault(require("../models/jsonwebtoken"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function build() {
    const controller = express_1.default.Router();
    const loginRoot = path_1.default.join(Constants.BUILD_STATIC_PATH, 'login');
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 10,
        skipSuccessfulRequests: true,
    });
    /**
     * Serve the static login page
     */
    controller.get('/', async (_request, response) => {
        response.sendFile('index.html', { root: loginRoot });
    });
    /**
     * Handle login request.
     */
    controller.post('/', limiter, async (request, response) => {
        const { body } = request;
        if (!body || !body.email || !body.password) {
            response.status(400).send('User requires email and password');
            return;
        }
        const user = await Users.getUser(body.email.toLowerCase());
        if (!user) {
            response.sendStatus(401);
            return;
        }
        const passwordMatch = await Passwords.compare(body.password, user.getPassword());
        if (!passwordMatch) {
            response.sendStatus(401);
            return;
        }
        if (user.getMfaEnrolled()) {
            if (!body.mfa) {
                response.status(401).json({ mfaRequired: true });
                return;
            }
            if (!Passwords.verifyMfaToken(user.getMfaSharedSecret(), body.mfa)) {
                let backupMatch = false;
                if (body.mfa.totp.length === 12) {
                    let index = 0;
                    for (const backup of user.getMfaBackupCodes()) {
                        backupMatch = await Passwords.compare(body.mfa.totp, backup);
                        if (backupMatch) {
                            break;
                        }
                        ++index;
                    }
                    if (backupMatch) {
                        user.getMfaBackupCodes().splice(index, 1);
                        await Users.editUser(user);
                    }
                }
                if (!backupMatch) {
                    response.status(401).json({ mfaRequired: true });
                    return;
                }
            }
        }
        // Issue a new JWT for this user.
        const jwt = await jsonwebtoken_1.default.issueToken(user.getId());
        limiter.resetKey(request.ip);
        response.status(200).json({ jwt });
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=login_controller.js.map