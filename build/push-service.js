"use strict";
/**
 * Push Service.
 *
 * Manage the Push Service for notifications
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
const web_push_1 = __importDefault(require("web-push"));
const Settings = __importStar(require("./models/settings"));
const db_1 = __importDefault(require("./db"));
class PushService {
    constructor() {
        this.enabled = false;
    }
    /**
     * Initialize the Push Service, generating and storing a VAPID keypair
     * if necessary.
     */
    async init(tunnelDomain) {
        let vapid = await Settings.getSetting('push.vapid');
        if (!vapid) {
            vapid = web_push_1.default.generateVAPIDKeys();
            await Settings.setSetting('push.vapid', vapid);
        }
        const { publicKey, privateKey } = vapid;
        web_push_1.default.setVapidDetails(tunnelDomain, publicKey, privateKey);
        this.enabled = true;
    }
    async getVAPIDKeys() {
        try {
            const vapid = await Settings.getSetting('push.vapid');
            return vapid;
        }
        catch (err) {
            console.error('vapid still not generated');
            return null;
        }
    }
    async createPushSubscription(subscription) {
        return await db_1.default.createPushSubscription(subscription);
    }
    async broadcastNotification(message) {
        if (!this.enabled) {
            return;
        }
        const subscriptions = await db_1.default.getPushSubscriptions();
        for (const subscription of subscriptions) {
            web_push_1.default.sendNotification(subscription, message).catch((err) => {
                console.warn('Push API error', err);
                db_1.default.deletePushSubscription(subscription.id);
            });
        }
    }
}
exports.default = new PushService();
//# sourceMappingURL=push-service.js.map