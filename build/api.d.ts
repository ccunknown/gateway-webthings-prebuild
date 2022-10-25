/**
 * Temporary API for interacting with the server.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
declare class API {
    jwt: string | null;
    isLoggedIn(): boolean;
    /**
     * The default options to use with fetching API calls
     * @return {Object}
     */
    headers(contentType?: string): Record<string, string>;
    getJson(url: string): Promise<Record<string, unknown>>;
    postJson(url: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null>;
    putJson(url: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    putJsonWithEmptyResponse(url: string, data: Record<string, unknown>): Promise<void>;
    patchJson(url: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    delete(url: string): Promise<void>;
    loadImage(url: string): Promise<Blob>;
    userCount(): Promise<number>;
    assertJWT(): void;
    verifyJWT(): Promise<boolean>;
    createUser(name: string, email: string, password: string): Promise<void>;
    getUser(id: number): Promise<Record<string, unknown>>;
    addUser(name: string, email: string, password: string): Promise<Record<string, unknown>>;
    editUser(id: string, name: string, email: string, password: string, newPassword: string): Promise<Record<string, unknown>>;
    userEnableMfa(id: number, totp: string): Promise<Record<string, unknown>>;
    userDisableMfa(id: number): Promise<null>;
    userRegenerateMfaBackupCodes(id: number): Promise<Record<string, unknown>>;
    deleteUser(id: number): Promise<void>;
    getAllUserInfo(): Promise<Record<string, unknown>>;
    login(email: string, password: string, totp?: string): Promise<void>;
    logout(): Promise<void>;
    getInstalledAddons(): Promise<Record<string, unknown>>;
    getAddonConfig(addonId: string): Promise<Record<string, unknown>>;
    setAddonConfig(addonId: string, config: Record<string, unknown>): Promise<Record<string, unknown>>;
    setAddonSetting(addonId: string, enabled: boolean): Promise<Record<string, unknown>>;
    installAddon(addonId: string, addonUrl: string, addonChecksum: string): Promise<Record<string, unknown>>;
    uninstallAddon(addonId: string): Promise<void>;
    updateAddon(addonId: string, addonUrl: string, addonChecksum: string): Promise<Record<string, unknown>>;
    getAddonsInfo(): Promise<Record<string, unknown>>;
    getExperimentSetting(experimentName: string): Promise<boolean>;
    setExperimentSetting(experimentName: string, enabled: boolean): Promise<Record<string, unknown>>;
    getUpdateStatus(): Promise<Record<string, unknown>>;
    getUpdateLatest(): Promise<Record<string, unknown>>;
    getSelfUpdateStatus(): Promise<Record<string, unknown>>;
    setSelfUpdateStatus(enabled: boolean): Promise<Record<string, unknown>>;
    startUpdate(): Promise<Record<string, unknown>>;
    getExtensions(): Promise<Record<string, unknown>>;
    getThings(): Promise<Record<string, unknown>>;
    getThing(thingId: string): Promise<Record<string, unknown>>;
    setThingLayoutIndex(thingId: string, index: number): Promise<Record<string, unknown>>;
    setThingGroup(thingId: string, groupId: string | null): Promise<Record<string, unknown>>;
    setThingGroupAndLayoutIndex(thingId: string, groupId: string | null, index: number): Promise<Record<string, unknown>>;
    setThingFloorplanPosition(thingId: string, x: number, y: number): Promise<Record<string, unknown>>;
    setThingCredentials(thingId: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    addThing(description: Record<string, unknown>): Promise<Record<string, unknown>>;
    addWebThing(url: string): Promise<Record<string, unknown>>;
    removeThing(thingId: string): Promise<void>;
    updateThing(thingId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>;
    getGroups(): Promise<Record<string, unknown>>;
    getGroup(groupId: string): Promise<Record<string, unknown>>;
    setGroupLayoutIndex(groupId: string, index: number): Promise<Record<string, unknown>>;
    addGroup(description: Record<string, unknown>): Promise<Record<string, unknown>>;
    removeGroup(groupId: string): Promise<void>;
    updateGroup(groupId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>;
    getPushKey(): Promise<Record<string, unknown>>;
    pushSubscribe(subscription: Record<string, unknown>): Promise<Record<string, unknown>>;
    getNotifiers(): Promise<Record<string, unknown>>;
    startPairing(timeout: number): Promise<Record<string, unknown>>;
    cancelPairing(actionUrl: string): Promise<void>;
    getRules(): Promise<Record<string, unknown>>;
    getRule(ruleId: string): Promise<Record<string, unknown>>;
    addRule(description: Record<string, unknown>): Promise<Record<string, unknown>>;
    updateRule(ruleId: string, description: Record<string, unknown>): Promise<Record<string, unknown>>;
    deleteRule(ruleId: string): Promise<void>;
    getLogs(): Promise<Record<string, unknown>>;
    addLog(description: Record<string, unknown>): Promise<[boolean, string | Record<string, unknown> | null]>;
    deleteLog(thingId: string, propertyId: string): Promise<void>;
    uploadFloorplan(file: File): Promise<void>;
    setupTunnel(email: string, subdomain: string, reclamationToken: string, optout: boolean): Promise<[boolean, string | Record<string, unknown>]>;
    skipTunnel(): Promise<[boolean, string | Record<string, unknown>]>;
    reclaimDomain(subdomain: string): Promise<Record<string, unknown>>;
    getLanSettings(): Promise<Record<string, unknown>>;
    getWlanSettings(): Promise<Record<string, unknown>>;
    getDhcpSettings(): Promise<Record<string, unknown>>;
    getWirelessNetworks(): Promise<Record<string, unknown>>;
    getNetworkAddresses(): Promise<Record<string, unknown>>;
    setLanSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>>;
    setWlanSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>>;
    setDhcpSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>>;
    getNtpStatus(): Promise<Record<string, unknown>>;
    restartNtpSync(): Promise<Record<string, unknown>>;
    getSshStatus(): Promise<Record<string, unknown>>;
    setSshStatus(enabled: boolean): Promise<Record<string, unknown>>;
    getPlatform(): Promise<Record<string, unknown>>;
    getTunnelInfo(): Promise<Record<string, unknown>>;
    getDomainSettings(): Promise<Record<string, unknown>>;
    setDomainSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>>;
    getAdapters(): Promise<Record<string, unknown>>;
    getAuthorizations(): Promise<Record<string, unknown>>;
    revokeAuthorization(clientId: string): Promise<void>;
    ping(): Promise<void>;
    getCountry(): Promise<Record<string, unknown>>;
    setCountry(country: string): Promise<Record<string, unknown>>;
    getTimezone(): Promise<Record<string, unknown>>;
    setTimezone(zone: string): Promise<Record<string, unknown>>;
    getLanguage(): Promise<Record<string, unknown>>;
    setLanguage(language: string): Promise<Record<string, unknown>>;
    getUnits(): Promise<Record<string, unknown>>;
    setUnits(units: Record<string, unknown>): Promise<Record<string, unknown>>;
}
declare const instance: API;
export default instance;
//# sourceMappingURL=api.d.ts.map