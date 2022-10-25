import WebSocket from 'ws';
interface WithUnreadMessages {
    unreadMessages?: string[];
}
/**
 * Open a websocket
 * @param {String} path
 * @param {String} jwt
 * @return {WebSocket}
 */
export declare function webSocketOpen(path: string, jwt: string): Promise<WebSocket & WithUnreadMessages>;
/**
 * Read a known amount of messages from a websocket
 * @param {WebSocket} ws
 * @param {number} expectedMessages
 * @param {boolean?} ignoreConnected - Whether or not to ignore 'connected'
 *                   messages
 * @return {Array<Object>} read messages
 */
export declare function webSocketRead(ws: WebSocket & WithUnreadMessages, expectedMessages: number, ignoreConnected?: boolean): Promise<Record<string, unknown>[]>;
/**
 * Send a JSON message over a websocket
 * @param {WebSocket} ws
 * @param {Object|string} message
 */
export declare function webSocketSend(ws: WebSocket, message: unknown): Promise<void>;
/**
 * Close a WebSocket and wait for it to be closed
 */
export declare function webSocketClose(ws: WebSocket): Promise<void>;
export {};
//# sourceMappingURL=websocket-util.d.ts.map