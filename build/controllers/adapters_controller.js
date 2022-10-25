"use strict";
/**
 * Adapter Controller.
 *
 * Manages HTTP requests to /adapters.
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
const addon_manager_1 = __importDefault(require("../addon-manager"));
function build() {
    const controller = express_1.default.Router();
    /**
     * Return a list of adapters
     */
    controller.get('/', (_request, response) => {
        const adapters = addon_manager_1.default.getAdapters();
        const adapterList = Array.from(adapters.values()).map((adapter) => {
            return adapter.asDict();
        });
        response.json(adapterList);
    });
    /**
     * Get a particular adapter.
     */
    controller.get('/:adapterId/', (request, response) => {
        const adapterId = request.params.adapterId;
        const adapter = addon_manager_1.default.getAdapter(adapterId);
        if (adapter) {
            response.json(adapter.asDict());
        }
        else {
            response.status(404).send(`Adapter "${adapterId}" not found.`);
        }
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=adapters_controller.js.map