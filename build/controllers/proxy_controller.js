"use strict";
/**
 * Proxy Controller.
 *
 * Handles proxied resources.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_proxy_1 = __importDefault(require("http-proxy"));
const express_1 = __importDefault(require("express"));
function build() {
    const proxies = new Map();
    function addProxyServer(thingId, server) {
        proxies.set(thingId, server);
    }
    function removeProxyServer(thingId) {
        proxies.delete(thingId);
    }
    const controller = Object.assign(express_1.default.Router(), {
        addProxyServer,
        removeProxyServer,
    });
    const proxy = http_proxy_1.default.createProxyServer({
        changeOrigin: true,
    });
    proxy.on('error', (e) => {
        console.debug('Proxy error:', e);
    });
    /**
     * Proxy the request, if configured.
     */
    controller.all('/:thingId/*', (request, response) => {
        const thingId = request.params.thingId;
        if (!proxies.has(thingId)) {
            response.sendStatus(404);
            return;
        }
        request.url = request.url.substring(thingId.length + 1);
        proxy.web(request, response, { target: proxies.get(thingId) });
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=proxy_controller.js.map