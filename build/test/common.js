"use strict";
/*
 * WebThings Gateway common test setup.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.server = exports.mockAdapter = exports.chai = void 0;
process.env.NODE_ENV = 'test';
const db_1 = __importDefault(require("../db"));
const actions_1 = __importDefault(require("../models/actions"));
const events_1 = __importDefault(require("../models/events"));
const logs_1 = __importDefault(require("../models/logs"));
const things_1 = __importDefault(require("../models/things"));
const user_profile_1 = __importDefault(require("../user-profile"));
const event_to_promise_1 = __importDefault(require("event-to-promise"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = __importDefault(require("./chai"));
exports.chai = chai_1.default;
global.chai = exports.chai;
expect.extend({
    assert(value, message = 'expected condition to be truthy') {
        const pass = !!value;
        return {
            pass,
            message,
        };
    },
});
const app_1 = require("../app");
global.server = app_1.servers.https;
const addon_manager_1 = __importDefault(require("../addon-manager"));
function mockAdapter() {
    const adapter = addon_manager_1.default.getAdapter('mock-adapter');
    expect(adapter).not.toBeUndefined();
    return adapter;
}
exports.mockAdapter = mockAdapter;
global.mockAdapter = mockAdapter;
function removeTestManifest() {
    const testManifestJsonFilename = path_1.default.join(user_profile_1.default.addonsDir, 'test-adapter', 'manifest.json');
    if (fs_1.default.existsSync(testManifestJsonFilename)) {
        console.log('Removing', testManifestJsonFilename);
        fs_1.default.unlinkSync(testManifestJsonFilename);
    }
    else {
        console.log('No need to remove', testManifestJsonFilename);
    }
}
beforeAll(async () => {
    removeTestManifest();
    // The server may not be done with reading tunneltoken and related settings
    await app_1.serverStartup.promise;
    console.log(app_1.servers.http.address(), app_1.servers.https.address());
    // If the mock adapter is a plugin, then it may not be available
    // immediately, so wait for it to be available.
    await addon_manager_1.default.waitForAdapter('mock-adapter');
});
afterEach(async () => {
    // This is all potentially brittle.
    const adapter = addon_manager_1.default.getAdapter('mock-adapter');
    if (adapter) {
        await adapter.clearState();
    }
    actions_1.default.clearState();
    events_1.default.clearState();
    things_1.default.clearState();
    await db_1.default.deleteEverything();
});
afterAll(async () => {
    logs_1.default.close();
    await addon_manager_1.default.unloadAddons();
    if (app_1.servers.https) {
        app_1.servers.https.close();
        await (0, event_to_promise_1.default)(app_1.servers.https, 'close');
    }
    app_1.servers.http.close();
    await (0, event_to_promise_1.default)(app_1.servers.http, 'close');
    removeTestManifest();
});
// Some tests take really long if Travis is having a bad day
jest.setTimeout(60000);
exports.server = app_1.servers.https;
exports.httpServer = app_1.servers.http;
//# sourceMappingURL=common.js.map