"use strict";
/**
 * settings-adapter.ts - Adapter for testing portions of the the
 *                       settings-controller.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const gateway_addon_1 = require("gateway-addon");
const manifest_json_1 = __importDefault(require("./manifest.json"));
class SettingsTestAdapter extends gateway_addon_1.Adapter {
    constructor(addonManager, packageName) {
        super(addonManager, packageName, packageName);
        addonManager.addAdapter(this);
    }
}
function loadSettingsTestAdapter(addonManager) {
    new SettingsTestAdapter(addonManager, manifest_json_1.default.id);
}
module.exports = loadSettingsTestAdapter;
//# sourceMappingURL=index.js.map