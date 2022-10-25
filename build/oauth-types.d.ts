/// <reference types="node" />
import { URL } from 'url';
declare type Read = 'read';
declare type ReadWrite = 'readwrite';
export declare type ScopeAccess = Read | ReadWrite;
export declare type Scope = {
    [path: string]: ScopeAccess;
};
export declare type ScopeRaw = string;
export declare type ClientId = string;
export declare class ClientRegistry {
    redirect_uri: URL;
    id: ClientId;
    name: string;
    secret: string;
    scope: ScopeRaw;
    constructor(redirect_uri: URL, id: ClientId, name: string, secret: string, scope: ScopeRaw);
    getDescription(): {
        id: ClientId;
        name: string;
        redirect_uri: URL;
        scope: ScopeRaw;
    };
}
export declare function scopeValidSubset(clientScopeRaw: ScopeRaw, requestScopeRaw: ScopeRaw): boolean;
export {};
//# sourceMappingURL=oauth-types.d.ts.map