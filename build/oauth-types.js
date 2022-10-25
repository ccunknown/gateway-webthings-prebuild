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
Object.defineProperty(exports, "__esModule", { value: true });
exports.scopeValidSubset = exports.ClientRegistry = void 0;
const Constants = __importStar(require("./constants"));
class ClientRegistry {
    constructor(redirect_uri, id, name, secret, scope) {
        this.redirect_uri = redirect_uri;
        this.id = id;
        this.name = name;
        this.secret = secret;
        this.scope = scope;
    }
    getDescription() {
        return {
            id: this.id,
            name: this.name,
            redirect_uri: this.redirect_uri,
            scope: this.scope,
        };
    }
}
exports.ClientRegistry = ClientRegistry;
function stringToScope(scopeRaw) {
    const scope = {};
    const scopeParts = scopeRaw.split(' ');
    for (const scopePart of scopeParts) {
        const parts = scopePart.split(':');
        const path = parts[0];
        let readwrite = parts[1];
        if (readwrite !== 'read' && readwrite !== 'readwrite') {
            readwrite = 'read';
        }
        scope[path] = readwrite;
    }
    return scope;
}
function scopeValidSubset(clientScopeRaw, requestScopeRaw) {
    if (clientScopeRaw === requestScopeRaw) {
        return true;
    }
    const clientScope = stringToScope(clientScopeRaw);
    const requestScope = stringToScope(requestScopeRaw);
    if (!clientScope || !requestScope) {
        return false;
    }
    for (const requestPath in requestScope) {
        if (!requestPath.startsWith(Constants.THINGS_PATH)) {
            console.warn('Invalid request for out-of-bounds scope', requestScopeRaw);
            return false;
        }
        const requestAccess = requestScope[requestPath];
        let access;
        if (clientScope[requestPath]) {
            access = clientScope[requestPath];
        }
        else {
            access = clientScope[Constants.THINGS_PATH];
        }
        if (!access) {
            return false;
        }
        if (requestAccess === 'readwrite') {
            if (access !== 'readwrite') {
                return false;
            }
        }
    }
    return true;
}
exports.scopeValidSubset = scopeValidSubset;
//# sourceMappingURL=oauth-types.js.map