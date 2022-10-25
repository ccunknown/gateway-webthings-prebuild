/// <reference types="node" />
/// <reference types="node" />
import './log-timestamps';
import https from 'https';
import http from 'http';
import './plugin/outlet-proxy';
import './plugin/property-proxy';
import './plugin/plugin';
export declare const servers: {
    http: http.Server;
    https: https.Server | null;
};
export declare const serverStartup: {
    promise: Promise<void | unknown>;
};
//# sourceMappingURL=app.d.ts.map