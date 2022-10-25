"use strict";
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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const glob_to_regexp_1 = __importDefault(require("glob-to-regexp"));
const path_1 = __importDefault(require("path"));
const gateway_addon_1 = require("gateway-addon");
const user_profile_1 = __importDefault(require("../user-profile"));
const jwtMiddleware = __importStar(require("../jwt-middleware"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
function build() {
    const auth = jwtMiddleware.middleware();
    const controller = express_1.default.Router();
    controller.get('/', auth, (_request, response) => {
        const map = {};
        for (const [key, value] of Object.entries(addon_manager_1.default.getExtensions())) {
            map[key] = value.extensions;
        }
        response.status(200).json(map);
    });
    /**
     * Extension API handler.
     */
    controller.all('/:extensionId/api/*', auth, async (request, response) => {
        const extensionId = request.params.extensionId;
        const apiHandler = addon_manager_1.default.getAPIHandler(extensionId);
        if (!apiHandler) {
            response.status(404).send(`Extension "${extensionId}" not found.`);
            return;
        }
        const req = new gateway_addon_1.APIRequest({
            method: request.method,
            path: `/${request.path.split('/').slice(3).join('/')}`,
            query: request.query || {},
            body: request.body || {},
        });
        try {
            /*
            const rsp = await apiHandler.handleRequest(req);
            response.status(rsp.getStatus());
            if (rsp.getContentType() &&
                rsp.getContent() !== null &&
                typeof rsp.getContent() !== 'undefined') {
                response.type(rsp.getContentType());
                response.send(rsp.getContent());
            }
            */
            const rsp = await apiHandler.handleRequest(req);
            response.status(rsp.status);
            if (rsp.contentType &&
                rsp.content !== null &&
                typeof rsp.content !== 'undefined') {
                response.type(rsp.contentType);
                response.send(rsp.content);
            }
            else {
                response.end();
            }
        }
        catch (e) {
            console.error('Error calling API handler:', e);
            response.status(500).send(e);
        }
    });
    /**
     * Static resource handler for extensions. This is intentionally
     * unauthenticated, since we're just loading static content.
     */
    controller.get('/:extensionId/*', (request, response) => {
        const extensionId = request.params.extensionId;
        const relPath = request.path.split('/').slice(2).join('/');
        // make sure the extension is installed and enabled
        const extensions = addon_manager_1.default.getExtensions();
        if (!extensions.hasOwnProperty(extensionId)) {
            response.status(404).send();
            return;
        }
        // make sure the requested resource is listed in the extension's
        // web_accessible_resources array
        let matched = false;
        const resources = extensions[extensionId].resources;
        for (const resource of resources) {
            const re = (0, glob_to_regexp_1.default)(resource);
            if (re.test(relPath)) {
                matched = true;
                break;
            }
        }
        if (!matched) {
            response.status(404).send();
            return;
        }
        // make sure the file actually exists
        const fullPath = path_1.default.join(user_profile_1.default.addonsDir, extensionId, relPath);
        if (!fs_1.default.existsSync(fullPath)) {
            response.status(404).send();
            return;
        }
        // finally, send the file
        response.sendFile(fullPath);
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=extensions_controller.js.map
