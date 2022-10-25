/// <reference types="node" />
import { URL } from 'url';
import { ClientRegistry } from '../oauth-types';
declare class OAuthClients {
    private clients;
    register(client: ClientRegistry): void;
    get(id: string, redirectUri?: URL): ClientRegistry | null;
    getAuthorized(userId: number): Promise<Array<ClientRegistry>>;
    revokeClientAuthorization(userId: number, clientId: string): Promise<void>;
}
declare const oauthClients: OAuthClients;
export default oauthClients;
//# sourceMappingURL=oauthclients.d.ts.map