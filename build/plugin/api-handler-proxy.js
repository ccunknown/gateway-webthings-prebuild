"use strict";
/**
 * @module APIHandlerProxy base class.
 *
 * Manages API handler data model and business logic.
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
const MessageType = gateway_addon_1.Constants.MessageType;
/**
 * Class used to describe an API handler from the perspective of the gateway.
 */
class APIHandlerProxy extends gateway_addon_1.APIHandler {
    constructor(addonManager, packageName, plugin) {
        super(addonManager, packageName);
        this.plugin = plugin;
        this.unloadCompletedPromise = null;
    }
    sendMsg(methodType, data, deferred) {
        data.packageName = this.getPackageName();
        return this.plugin.sendMsg(methodType, data, deferred);
    }
    handleRequest(request) {
        return new Promise((resolve, reject) => {
            const deferred = new deferred_1.default();
            deferred
                .getPromise()
                .then((response) => {
                resolve(response);
            })
                .catch(() => {
                reject();
            });
            this.sendMsg(MessageType.API_HANDLER_API_REQUEST, {
                packageName: this.getPackageName(),
                request,
            }, deferred);
        });
    }
    /**
     * Unloads the handler.
     *
     * @returns a promise which resolves when the handler has finished unloading.
     */
    unload() {
        if (this.unloadCompletedPromise) {
            console.error('APIHandlerProxy: unload already in progress');
            return Promise.reject();
        }
        this.unloadCompletedPromise = new deferred_1.default();
        this.sendMsg(MessageType.API_HANDLER_UNLOAD_REQUEST, {});
        return this.unloadCompletedPromise.getPromise();
    }
}
exports.default = APIHandlerProxy;
//# sourceMappingURL=api-handler-proxy.js.map