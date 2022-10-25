"use strict";
/**
 * Internal logs Controller.
 *
 * Allows user to download current set of internal log files.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const archiver_1 = __importDefault(require("archiver"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ws_1 = __importDefault(require("ws"));
const Constants = __importStar(require("../constants"));
const jwtMiddleware = __importStar(require("../jwt-middleware"));
const user_profile_1 = __importDefault(require("../user-profile"));
const Utils = __importStar(require("../utils"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
function build() {
    const controller = express_1.default.Router();
    /**
     * Generate an index of log files.
     */
    controller.get('/', async (request, response) => {
        const jwt = jwtMiddleware.extractJWTHeader(request) || jwtMiddleware.extractJWTQS(request);
        const files = fs_1.default
            .readdirSync(user_profile_1.default.logDir)
            .filter((f) => !f.startsWith('.') && f !== 'logs.sqlite3');
        files.sort();
        let content = '<!DOCTYPE html>' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="utf-8">' +
            '<title>Logs - WebThings Gateway</title>' +
            '</head>' +
            '<body>' +
            '<ul>';
        for (const name of files) {
            if (fs_1.default.lstatSync(path_1.default.join(user_profile_1.default.logDir, name)).isFile()) {
                content += `${'<li>' +
                    `<a href="${Constants.INTERNAL_LOGS_PATH}/files/${encodeURIComponent(name)}?jwt=${jwt}">`}${Utils.escapeHtml(name)}</a></li>`;
            }
        }
        content += '</ul></body></html>';
        response.send(content);
    });
    /**
     * Static handler for log files.
     */
    controller.use('/files', express_1.default.static(user_profile_1.default.logDir, {
        setHeaders: (res, filepath) => {
            const base = path_1.default.basename(filepath);
            if (base.startsWith('run-app.log')) {
                res.set('Content-Type', 'text/plain');
            }
        },
    }));
    /**
     * Handle request for logs.zip.
     */
    controller.get('/zip', async (_request, response) => {
        const archive = (0, archiver_1.default)('zip');
        archive.on('error', (err) => {
            response.status(500).send(err.message);
        });
        response.attachment('logs.zip');
        archive.pipe(response);
        fs_1.default.readdirSync(user_profile_1.default.logDir).map((f) => {
            const fullPath = path_1.default.join(user_profile_1.default.logDir, f);
            if (!f.startsWith('.') && fs_1.default.lstatSync(fullPath).isFile() && f !== 'logs.sqlite3') {
                archive.file(fullPath, { name: path_1.default.join('logs', f) });
            }
        });
        archive.finalize();
    });
    controller.ws('/', (websocket) => {
        if (websocket.readyState !== ws_1.default.OPEN) {
            return;
        }
        const heartbeat = setInterval(() => {
            try {
                websocket.ping();
            }
            catch (e) {
                websocket.terminate();
            }
        }, 30 * 1000);
        function onLog(message) {
            websocket.send(JSON.stringify(message), (err) => {
                if (err) {
                    console.error('WebSocket sendMessage failed:', err);
                }
            });
        }
        const pluginServer = addon_manager_1.default.getPluginServer();
        if (pluginServer) {
            pluginServer.on('log', onLog);
            const cleanup = () => {
                pluginServer.removeListener('log', onLog);
                clearInterval(heartbeat);
            };
            websocket.on('error', cleanup);
            websocket.on('close', cleanup);
        }
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=internal_logs_controller.js.map