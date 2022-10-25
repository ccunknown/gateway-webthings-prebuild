"use strict";
/**
 * @module NotifierProxy base class.
 *
 * Manages Notifier data model and business logic.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deferred_1 = __importDefault(require("../deferred"));
const gateway_addon_1 = require("gateway-addon");
const outlet_proxy_1 = __importDefault(require("./outlet-proxy"));
const MessageType = gateway_addon_1.Constants.MessageType;
/**
 * Class used to describe a notifier from the perspective of the gateway.
 */
class NotifierProxy extends gateway_addon_1.Notifier {
    constructor(addonManager, notifierId, name, packageName, plugin) {
        super(addonManager, notifierId, packageName);
        this.plugin = plugin;
        this.unloadCompletedPromise = null;
        this.setName(name);
    }
    sendMsg(methodType, data, deferred) {
        data.notifierId = this.getId();
        return this.plugin.sendMsg(methodType, data, deferred);
    }
    /**
     * Unloads a notifier.
     *
     * @returns a promise which resolves when the notifier has finished unloading.
     */
    unload() {
        if (this.unloadCompletedPromise) {
            console.error('NotifierProxy: unload already in progress');
            return Promise.reject();
        }
        this.unloadCompletedPromise = new deferred_1.default();
        this.sendMsg(MessageType.NOTIFIER_UNLOAD_REQUEST, {});
        return this.unloadCompletedPromise.getPromise();
    }
    addOutlet(outletId, outletDescription) {
        this.getOutlets()[outletId] = new outlet_proxy_1.default(this, outletDescription);
    }
}
exports.default = NotifierProxy;
//# sourceMappingURL=notifier-proxy.js.map