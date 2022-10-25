"use strict";
/**
 * test-adapter.ts - Adapter for testing portions of AddonManager.loadAddons.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const gateway_addon_1 = require("gateway-addon");
const fs_1 = __importDefault(require("fs"));
class TestAdapter extends gateway_addon_1.Adapter {
    constructor(addonManager, packageName) {
        super(addonManager, packageName, packageName);
        addonManager.addAdapter(this);
    }
}
function loadTestAdapter(addonManager) {
    const manifest = JSON.parse(fs_1.default.readFileSync('./manifest.json', 'utf8'));
    new TestAdapter(addonManager, manifest.id);
}
module.exports = loadTestAdapter;
//# sourceMappingURL=index.js.map