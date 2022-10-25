"use strict";
/*
 * WebThings Gateway Constants.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROUP_MODIFIED = exports.GROUP_ADDED = exports.THING_REMOVED = exports.THING_MODIFIED = exports.THING_ADDED = exports.SET_PROPERTY = exports.REQUEST_ACTION = exports.REMOVED = exports.PROPERTY_STATUS = exports.PROPERTY_CHANGED = exports.PAIRING_TIMEOUT = exports.OUTLET_REMOVED = exports.OUTLET_ADDED = exports.NOTIFIER_ADDED = exports.MODIFIED = exports.EVENT = exports.ERROR = exports.CONNECTED = exports.API_HANDLER_ADDED = exports.ADD_EVENT_SUBSCRIPTION = exports.ADAPTER_ADDED = exports.ACTION_STATUS = exports.VIEWS_PATH = exports.BUILD_STATIC_PATH = exports.STATIC_PATH = exports.EXTENSIONS_PATH = exports.PROXY_PATH = exports.PING_PATH = exports.PUSH_PATH = exports.LOGS_PATH = exports.INTERNAL_LOGS_PATH = exports.OAUTHCLIENTS_PATH = exports.OAUTH_PATH = exports.RULES_PATH = exports.MEDIA_PATH = exports.UPLOADS_PATH = exports.UPDATES_PATH = exports.SETTINGS_PATH = exports.LOG_OUT_PATH = exports.LOGIN_PATH = exports.EVENTS_PATH = exports.ACTIONS_PATH = exports.NOTIFIERS_PATH = exports.ADDONS_PATH = exports.ADAPTERS_PATH = exports.NEW_THINGS_PATH = exports.PROPERTIES_PATH = exports.GROUPS_PATH = exports.THINGS_PATH = exports.USERS_PATH = void 0;
exports.DEVICE_REMOVAL_TIMEOUT = exports.UNLOAD_PLUGIN_KILL_DELAY = exports.WoTOperation = exports.LogSeverity = exports.READ = exports.READWRITE = exports.USER_TOKEN = exports.AUTHORIZATION_CODE = exports.ACCESS_TOKEN = exports.LAYOUT_MODIFIED = exports.GROUP_REMOVED = void 0;
const path_1 = __importDefault(require("path"));
// Web server routes
exports.USERS_PATH = '/users';
exports.THINGS_PATH = '/things';
exports.GROUPS_PATH = '/groups';
exports.PROPERTIES_PATH = '/properties';
exports.NEW_THINGS_PATH = '/new_things';
exports.ADAPTERS_PATH = '/adapters';
exports.ADDONS_PATH = '/addons';
exports.NOTIFIERS_PATH = '/notifiers';
exports.ACTIONS_PATH = '/actions';
exports.EVENTS_PATH = '/events';
exports.LOGIN_PATH = '/login';
exports.LOG_OUT_PATH = '/log-out';
exports.SETTINGS_PATH = '/settings';
exports.UPDATES_PATH = '/updates';
exports.UPLOADS_PATH = '/uploads';
exports.MEDIA_PATH = '/media';
exports.RULES_PATH = '/rules';
exports.OAUTH_PATH = '/oauth';
exports.OAUTHCLIENTS_PATH = '/authorizations';
exports.INTERNAL_LOGS_PATH = '/internal-logs';
exports.LOGS_PATH = '/logs';
exports.PUSH_PATH = '/push';
exports.PING_PATH = '/ping';
exports.PROXY_PATH = '/proxy';
exports.EXTENSIONS_PATH = '/extensions';
// Remember we end up in the build/* directory so these paths looks slightly
// different than you might expect const
exports.STATIC_PATH = path_1.default.join(__dirname, '../static');
exports.BUILD_STATIC_PATH = path_1.default.join(__dirname, '../build/static');
exports.VIEWS_PATH = path_1.default.join(__dirname, '../build/views');
// Plugin and REST/websocket API things
exports.ACTION_STATUS = 'actionStatus';
exports.ADAPTER_ADDED = 'adapterAdded';
exports.ADD_EVENT_SUBSCRIPTION = 'addEventSubscription';
exports.API_HANDLER_ADDED = 'apiHandlerAdded';
exports.CONNECTED = 'connected';
exports.ERROR = 'error';
exports.EVENT = 'event';
exports.MODIFIED = 'modified';
exports.NOTIFIER_ADDED = 'notifierAdded';
exports.OUTLET_ADDED = 'outletAdded';
exports.OUTLET_REMOVED = 'outletRemoved';
exports.PAIRING_TIMEOUT = 'pairingTimeout';
exports.PROPERTY_CHANGED = 'propertyChanged';
exports.PROPERTY_STATUS = 'propertyStatus';
exports.REMOVED = 'removed';
exports.REQUEST_ACTION = 'requestAction';
exports.SET_PROPERTY = 'setProperty';
exports.THING_ADDED = 'thingAdded';
exports.THING_MODIFIED = 'thingModified';
exports.THING_REMOVED = 'thingRemoved';
exports.GROUP_ADDED = 'groupAdded';
exports.GROUP_MODIFIED = 'groupModified';
exports.GROUP_REMOVED = 'groupRemoved';
exports.LAYOUT_MODIFIED = 'layoutModified';
// OAuth things
exports.ACCESS_TOKEN = 'access_token';
exports.AUTHORIZATION_CODE = 'authorization_code';
exports.USER_TOKEN = 'user_token';
exports.READWRITE = 'readwrite';
exports.READ = 'read';
// Logging
var LogSeverity;
(function (LogSeverity) {
    LogSeverity[LogSeverity["DEBUG"] = 0] = "DEBUG";
    LogSeverity[LogSeverity["INFO"] = 1] = "INFO";
    LogSeverity[LogSeverity["WARNING"] = 2] = "WARNING";
    LogSeverity[LogSeverity["ERROR"] = 3] = "ERROR";
    LogSeverity[LogSeverity["PROMPT"] = 4] = "PROMPT";
})(LogSeverity = exports.LogSeverity || (exports.LogSeverity = {}));
var WoTOperation;
(function (WoTOperation) {
    WoTOperation["READ_ALL_PROPERTIES"] = "readallproperties";
    WoTOperation["WRITE_MULTIPLE_PROPERTIES"] = "writemultipleproperties";
    WoTOperation["SUBSCRIBE_ALL_EVENTS"] = "subscribeallevents";
    WoTOperation["UNSUBSCRIBE_ALL_EVENTS"] = "unsubscribeallevents";
    WoTOperation["QUERY_ALL_ACTIONS"] = "queryallactions";
})(WoTOperation = exports.WoTOperation || (exports.WoTOperation = {}));
exports.UNLOAD_PLUGIN_KILL_DELAY = 3000;
exports.DEVICE_REMOVAL_TIMEOUT = 30000;
//# sourceMappingURL=constants.js.map