/// <reference types="node" />
/// <reference types="node" />
import { MockAdapter } from '../addons-test/mock-adapter/index';
import https from 'https';
export declare const chai: Chai.ChaiStatic;
export declare function mockAdapter(): MockAdapter;
export declare const server: https.Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
//# sourceMappingURL=common.d.ts.map