"use strict";
/**
 * OutletProxy - Gateway side representation of an outlet when using
 *               a notifier plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gateway_addon_1 = require("gateway-addon");
const deferred_1 = __importDefault(require("../deferred"));
const MessageType = gateway_addon_1.Constants.MessageType;
class OutletProxy extends gateway_addon_1.Outlet {
    constructor(notifier, outletDict) {
        super(notifier, outletDict.id);
        this.setName(outletDict.name);
    }
    notify(title, message, level) {
        return new Promise((resolve, reject) => {
            console.log('OutletProxy: notify title:', title, 'message:', message, 'level:', level, 'for:', this.getId());
            const deferredSet = new deferred_1.default();
            deferredSet
                .getPromise()
                .then(() => {
                resolve();
            })
                .catch(() => {
                reject();
            });
            this.getNotifier().sendMsg(MessageType.OUTLET_NOTIFY_REQUEST, {
                outletId: this.getId(),
                title,
                message,
                level,
            }, deferredSet);
        });
    }
}
exports.default = OutletProxy;
//# sourceMappingURL=outlet-proxy.js.map