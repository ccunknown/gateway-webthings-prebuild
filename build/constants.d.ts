export declare const USERS_PATH = "/users";
export declare const THINGS_PATH = "/things";
export declare const GROUPS_PATH = "/groups";
export declare const PROPERTIES_PATH = "/properties";
export declare const NEW_THINGS_PATH = "/new_things";
export declare const ADAPTERS_PATH = "/adapters";
export declare const ADDONS_PATH = "/addons";
export declare const NOTIFIERS_PATH = "/notifiers";
export declare const ACTIONS_PATH = "/actions";
export declare const EVENTS_PATH = "/events";
export declare const LOGIN_PATH = "/login";
export declare const LOG_OUT_PATH = "/log-out";
export declare const SETTINGS_PATH = "/settings";
export declare const UPDATES_PATH = "/updates";
export declare const UPLOADS_PATH = "/uploads";
export declare const MEDIA_PATH = "/media";
export declare const RULES_PATH = "/rules";
export declare const OAUTH_PATH = "/oauth";
export declare const OAUTHCLIENTS_PATH = "/authorizations";
export declare const INTERNAL_LOGS_PATH = "/internal-logs";
export declare const LOGS_PATH = "/logs";
export declare const PUSH_PATH = "/push";
export declare const PING_PATH = "/ping";
export declare const PROXY_PATH = "/proxy";
export declare const EXTENSIONS_PATH = "/extensions";
export declare const STATIC_PATH: string;
export declare const BUILD_STATIC_PATH: string;
export declare const VIEWS_PATH: string;
export declare const ACTION_STATUS = "actionStatus";
export declare const ADAPTER_ADDED = "adapterAdded";
export declare const ADD_EVENT_SUBSCRIPTION = "addEventSubscription";
export declare const API_HANDLER_ADDED = "apiHandlerAdded";
export declare const CONNECTED = "connected";
export declare const ERROR = "error";
export declare const EVENT = "event";
export declare const MODIFIED = "modified";
export declare const NOTIFIER_ADDED = "notifierAdded";
export declare const OUTLET_ADDED = "outletAdded";
export declare const OUTLET_REMOVED = "outletRemoved";
export declare const PAIRING_TIMEOUT = "pairingTimeout";
export declare const PROPERTY_CHANGED = "propertyChanged";
export declare const PROPERTY_STATUS = "propertyStatus";
export declare const REMOVED = "removed";
export declare const REQUEST_ACTION = "requestAction";
export declare const SET_PROPERTY = "setProperty";
export declare const THING_ADDED = "thingAdded";
export declare const THING_MODIFIED = "thingModified";
export declare const THING_REMOVED = "thingRemoved";
export declare const GROUP_ADDED = "groupAdded";
export declare const GROUP_MODIFIED = "groupModified";
export declare const GROUP_REMOVED = "groupRemoved";
export declare const LAYOUT_MODIFIED = "layoutModified";
export declare const ACCESS_TOKEN = "access_token";
export declare const AUTHORIZATION_CODE = "authorization_code";
export declare const USER_TOKEN = "user_token";
export declare const READWRITE = "readwrite";
export declare const READ = "read";
export declare enum LogSeverity {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3,
    PROMPT = 4
}
export declare enum WoTOperation {
    READ_ALL_PROPERTIES = "readallproperties",
    WRITE_MULTIPLE_PROPERTIES = "writemultipleproperties",
    SUBSCRIBE_ALL_EVENTS = "subscribeallevents",
    UNSUBSCRIBE_ALL_EVENTS = "unsubscribeallevents",
    QUERY_ALL_ACTIONS = "queryallactions"
}
export interface LogMessage {
    severity: LogSeverity;
    message: string;
    url?: string;
}
export declare const UNLOAD_PLUGIN_KILL_DELAY = 3000;
export declare const DEVICE_REMOVAL_TIMEOUT = 30000;
//# sourceMappingURL=constants.d.ts.map