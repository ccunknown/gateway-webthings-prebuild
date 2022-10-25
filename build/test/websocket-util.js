"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketClose = exports.webSocketSend = exports.webSocketRead = exports.webSocketOpen = void 0;
const event_to_promise_1 = __importDefault(require("event-to-promise"));
const ws_1 = __importDefault(require("ws"));
const common_1 = require("./common");
/**
 * Open a websocket
 * @param {String} path
 * @param {String} jwt
 * @return {WebSocket}
 */
async function webSocketOpen(path, jwt) {
    if (!common_1.server.address()) {
        common_1.server.listen(0);
    }
    const addr = common_1.server.address();
    const socketPath = `wss://127.0.0.1:${addr.port}${path}?jwt=${jwt}`;
    const ws = new ws_1.default(socketPath);
    ws.unreadMessages = [];
    ws.on('message', (message) => {
        ws.unreadMessages.push(message);
    });
    await (0, event_to_promise_1.default)(ws, 'open');
    // Allow the app to handle the websocket open reaaallly slowwwwllllyyyy
    await new Promise((res) => {
        setTimeout(res, 250);
    });
    return ws;
}
exports.webSocketOpen = webSocketOpen;
/**
 * Read a known amount of messages from a websocket
 * @param {WebSocket} ws
 * @param {number} expectedMessages
 * @param {boolean?} ignoreConnected - Whether or not to ignore 'connected'
 *                   messages
 * @return {Array<Object>} read messages
 */
async function webSocketRead(ws, expectedMessages, ignoreConnected = true) {
    const messages = [];
    while (messages.length < expectedMessages) {
        if (ws.unreadMessages.length > 0) {
            const data = ws.unreadMessages.shift();
            const parsed = JSON.parse(data);
            if (ignoreConnected && parsed.messageType === 'connected') {
                continue;
            }
            messages.push(parsed);
        }
        else {
            await (0, event_to_promise_1.default)(ws, 'message');
        }
    }
    return messages;
}
exports.webSocketRead = webSocketRead;
/**
 * Send a JSON message over a websocket
 * @param {WebSocket} ws
 * @param {Object|string} message
 */
async function webSocketSend(ws, message) {
    if (typeof message !== 'string') {
        message = JSON.stringify(message);
    }
    await new Promise((resolve) => {
        ws.send(message, () => {
            resolve();
        });
    });
}
exports.webSocketSend = webSocketSend;
/**
 * Close a WebSocket and wait for it to be closed
 */
async function webSocketClose(ws) {
    ws.close();
    await (0, event_to_promise_1.default)(ws, 'close');
}
exports.webSocketClose = webSocketClose;
//# sourceMappingURL=websocket-util.js.map