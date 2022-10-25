"use strict";
/**
 * Temporary API for interacting with the server.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor() {
        this.jwt = localStorage.getItem('jwt');
    }
    isLoggedIn() {
        return !!this.jwt;
    }
    /**
     * The default options to use with fetching API calls
     * @return {Object}
     */
    headers(contentType) {
        const headers = {
            Accept: 'application/json',
        };
        if (this.jwt) {
            headers.Authorization = `Bearer ${this.jwt}`;
        }
        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        return headers;
    }
    getJson(url) {
        const opts = {
            method: 'GET',
            headers: this.headers(),
        };
        return fetch(url, opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
            return res.json();
        });
    }
    postJson(url, data) {
        const opts = {
            method: 'POST',
            headers: this.headers('application/json'),
            body: JSON.stringify(data),
        };
        return fetch(url, opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
            if (res.status !== 204) {
                return res.json();
            }
            return null;
        });
    }
    putJson(url, data) {
        const opts = {
            method: 'PUT',
            headers: this.headers('application/json'),
            body: JSON.stringify(data),
        };
        return fetch(url, opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
            return res.json();
        });
    }
    putJsonWithEmptyResponse(url, data) {
        const opts = {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${this.jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        return fetch(url, opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
        });
    }
    patchJson(url, data) {
        const opts = {
            method: 'PATCH',
            headers: this.headers('application/json'),
            body: JSON.stringify(data),
        };
        return fetch(url, opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
            return res.json();
        });
    }
    delete(url) {
        const opts = {
            method: 'DELETE',
            headers: this.headers(),
        };
        return fetch(url, opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
        });
    }
    loadImage(url) {
        const opts = {
            headers: {
                Authorization: `Bearer ${this.jwt}`,
            },
            cache: 'reload',
        };
        return fetch(url, opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
            return res.blob();
        });
    }
    userCount() {
        return this.getJson('/users/count')
            .then((body) => {
            return body.count;
        })
            .catch(() => {
            throw new Error('Failed to get user count.');
        });
    }
    assertJWT() {
        if (!this.jwt) {
            throw new Error('No JWT go login..');
        }
    }
    verifyJWT() {
        return fetch('/things', { headers: this.headers() }).then((res) => res.ok);
    }
    createUser(name, email, password) {
        return this.postJson('/users', { name, email, password })
            .then((body) => {
            const jwt = body.jwt;
            localStorage.setItem('jwt', jwt);
            this.jwt = jwt;
        })
            .catch(() => {
            throw new Error('Repeating signup not permitted');
        });
    }
    getUser(id) {
        return this.getJson(`/users/${encodeURIComponent(id)}`);
    }
    async addUser(name, email, password) {
        return (await this.postJson('/users', { name, email, password }));
    }
    editUser(id, name, email, password, newPassword) {
        return this.putJson(`/users/${encodeURIComponent(id)}`, {
            id,
            name,
            email,
            password,
            newPassword,
        });
    }
    async userEnableMfa(id, totp) {
        const body = {
            enable: true,
        };
        if (totp) {
            body.mfa = { totp };
        }
        return (await this.postJson(`/users/${encodeURIComponent(id)}/mfa`, body));
    }
    async userDisableMfa(id) {
        await this.postJson(`/users/${encodeURIComponent(id)}/mfa`, { enable: false });
        return null;
    }
    userRegenerateMfaBackupCodes(id) {
        return this.putJson(`/users/${encodeURIComponent(id)}/mfa/codes`, { generate: true });
    }
    deleteUser(id) {
        return this.delete(`/users/${encodeURIComponent(id)}`);
    }
    getAllUserInfo() {
        return this.getJson('/users/info');
    }
    login(email, password, totp) {
        const body = {
            email,
            password,
        };
        if (totp) {
            body.mfa = { totp };
        }
        const opts = {
            method: 'POST',
            headers: this.headers('application/json'),
            body: JSON.stringify(body),
        };
        return fetch('/login', opts).then((res) => {
            if (!res.ok) {
                if (res.status === 401) {
                    return res.text().then((body) => {
                        throw new Error(body);
                    });
                }
                else {
                    throw new Error(`${res.status}`);
                }
            }
            return res.json().then((body) => {
                const jwt = body.jwt;
                localStorage.setItem('jwt', jwt);
                this.jwt = jwt;
            });
        });
    }
    async logout() {
        this.assertJWT();
        localStorage.removeItem('jwt');
        try {
            await this.postJson('/log-out', {});
        }
        catch (e) {
            console.error('Logout failed:', e);
        }
    }
    getInstalledAddons() {
        return this.getJson('/addons');
    }
    getAddonConfig(addonId) {
        return this.getJson(`/addons/${encodeURIComponent(addonId)}/config`);
    }
    setAddonConfig(addonId, config) {
        return this.putJson(`/addons/${encodeURIComponent(addonId)}/config`, { config });
    }
    setAddonSetting(addonId, enabled) {
        return this.putJson(`/addons/${encodeURIComponent(addonId)}`, { enabled });
    }
    async installAddon(addonId, addonUrl, addonChecksum) {
        return (await this.postJson('/addons', {
            id: addonId,
            url: addonUrl,
            checksum: addonChecksum,
        }));
    }
    uninstallAddon(addonId) {
        return this.delete(`/addons/${encodeURIComponent(addonId)}`);
    }
    updateAddon(addonId, addonUrl, addonChecksum) {
        return this.patchJson(`/addons/${encodeURIComponent(addonId)}`, {
            url: addonUrl,
            checksum: addonChecksum,
        });
    }
    getAddonsInfo() {
        return this.getJson('/settings/addonsInfo');
    }
    getExperimentSetting(experimentName) {
        return this.getJson(`/settings/experiments/${encodeURIComponent(experimentName)}`)
            .then((json) => {
            return json.enabled;
        })
            .catch((e) => {
            if (e.message === '404') {
                return false;
            }
            throw new Error(`Error getting ${experimentName}`);
        });
    }
    setExperimentSetting(experimentName, enabled) {
        return this.putJson(`/settings/experiments/${encodeURIComponent(experimentName)}`, { enabled });
    }
    getUpdateStatus() {
        return this.getJson('/updates/status');
    }
    getUpdateLatest() {
        return this.getJson('/updates/latest');
    }
    getSelfUpdateStatus() {
        return this.getJson('/updates/self-update');
    }
    setSelfUpdateStatus(enabled) {
        return this.putJson('/updates/self-update', { enabled });
    }
    async startUpdate() {
        return (await this.postJson('/updates/update', {}));
    }
    getExtensions() {
        return this.getJson('/extensions');
    }
    getThings() {
        return this.getJson('/things');
    }
    getThing(thingId) {
        return this.getJson(`/things/${encodeURIComponent(thingId)}`);
    }
    setThingLayoutIndex(thingId, index) {
        return this.patchJson(`/things/${encodeURIComponent(thingId)}`, { layoutIndex: index });
    }
    setThingGroup(thingId, groupId) {
        groupId = groupId || '';
        return this.patchJson(`/things/${encodeURIComponent(thingId)}`, { group: groupId });
    }
    setThingGroupAndLayoutIndex(thingId, groupId, index) {
        groupId = groupId || '';
        return this.patchJson(`/things/${encodeURIComponent(thingId)}`, {
            group: groupId,
            layoutIndex: index,
        });
    }
    setThingFloorplanPosition(thingId, x, y) {
        return this.patchJson(`/things/${encodeURIComponent(thingId)}`, {
            floorplanX: x,
            floorplanY: y,
        });
    }
    setThingCredentials(thingId, data) {
        const body = {
            thingId,
        };
        if (data.hasOwnProperty('pin')) {
            body.pin = data.pin;
        }
        else {
            body.username = data.username;
            body.password = data.password;
        }
        return this.patchJson('/things', body);
    }
    async addThing(description) {
        return (await this.postJson('/things', description));
    }
    async addWebThing(url) {
        return (await this.postJson('/new_things', { url }));
    }
    removeThing(thingId) {
        return this.delete(`/things/${encodeURIComponent(thingId)}`);
    }
    updateThing(thingId, updates) {
        return this.putJson(`/things/${encodeURIComponent(thingId)}`, updates);
    }
    getGroups() {
        return this.getJson('/groups');
    }
    getGroup(groupId) {
        return this.getJson(`/groups/${encodeURIComponent(groupId)}`);
    }
    setGroupLayoutIndex(groupId, index) {
        return this.patchJson(`/groups/${encodeURIComponent(groupId)}`, {
            layoutIndex: index,
        });
    }
    async addGroup(description) {
        return (await this.postJson('/groups', description));
    }
    removeGroup(groupId) {
        return this.delete(`/groups/${encodeURIComponent(groupId)}`);
    }
    updateGroup(groupId, updates) {
        return this.putJson(`/groups/${encodeURIComponent(groupId)}`, updates);
    }
    getPushKey() {
        return this.getJson('/push/vapid-public-key');
    }
    async pushSubscribe(subscription) {
        return (await this.postJson('/push/register', subscription));
    }
    getNotifiers() {
        return this.getJson('/notifiers');
    }
    async startPairing(timeout) {
        return (await this.postJson('/actions', {
            pair: {
                input: {
                    timeout,
                },
            },
        }));
    }
    cancelPairing(actionUrl) {
        return this.delete(actionUrl);
    }
    getRules() {
        return this.getJson('/rules');
    }
    getRule(ruleId) {
        return this.getJson(`/rules/${encodeURIComponent(ruleId)}`);
    }
    async addRule(description) {
        return (await this.postJson('/rules', description));
    }
    updateRule(ruleId, description) {
        return this.putJson(`/rules/${encodeURIComponent(ruleId)}`, description);
    }
    deleteRule(ruleId) {
        return this.delete(`/rules/${encodeURIComponent(ruleId)}`);
    }
    getLogs() {
        return this.getJson('/logs/.schema');
    }
    async addLog(description) {
        const opts = {
            method: 'POST',
            headers: this.headers('application/json'),
            body: JSON.stringify(description),
        };
        try {
            const res = await fetch('/logs', opts);
            if (!res.ok) {
                return [false, await res.text()];
            }
            return [true, await res.json()];
        }
        catch (_) {
            return [false, null];
        }
    }
    deleteLog(thingId, propertyId) {
        return this.delete(`/logs/things/${encodeURIComponent(thingId)}/properties/${encodeURIComponent(propertyId)}`);
    }
    uploadFloorplan(file) {
        const formData = new FormData();
        formData.append('file', file);
        const opts = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.jwt}`,
            },
            body: formData,
        };
        return fetch('/uploads', opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
        });
    }
    setupTunnel(email, subdomain, reclamationToken, optout) {
        const opts = {
            method: 'POST',
            headers: this.headers('application/json'),
            body: JSON.stringify({ email, subdomain, reclamationToken, optout }),
        };
        return fetch('/settings/subscribe', opts).then((res) => {
            if (!res.ok) {
                return [false, res.statusText];
            }
            return res.json().then((body) => [true, body]);
        });
    }
    skipTunnel() {
        const opts = {
            method: 'POST',
            headers: this.headers('application/json'),
            body: JSON.stringify({}),
        };
        return fetch('/settings/skiptunnel', opts).then((res) => {
            if (!res.ok) {
                return [false, res.statusText];
            }
            return res.json().then((body) => [true, body]);
        });
    }
    async reclaimDomain(subdomain) {
        return (await this.postJson('/settings/reclaim', { subdomain }));
    }
    getLanSettings() {
        return this.getJson('/settings/network/lan');
    }
    getWlanSettings() {
        return this.getJson('/settings/network/wireless');
    }
    getDhcpSettings() {
        return this.getJson('/settings/network/dhcp');
    }
    getWirelessNetworks() {
        return this.getJson('/settings/network/wireless/networks');
    }
    getNetworkAddresses() {
        return this.getJson('/settings/network/addresses');
    }
    setLanSettings(settings) {
        return this.putJson('/settings/network/lan', settings);
    }
    setWlanSettings(settings) {
        return this.putJson('/settings/network/wireless', settings);
    }
    setDhcpSettings(settings) {
        return this.putJson('/settings/network/dhcp', settings);
    }
    getNtpStatus() {
        return this.getJson('/settings/system/ntp');
    }
    async restartNtpSync() {
        return (await this.postJson('/settings/system/ntp', {}));
    }
    getSshStatus() {
        return this.getJson('/settings/system/ssh');
    }
    setSshStatus(enabled) {
        return this.putJson('/settings/system/ssh', { enabled });
    }
    getPlatform() {
        return this.getJson('/settings/system/platform');
    }
    getTunnelInfo() {
        return this.getJson('/settings/tunnelinfo');
    }
    getDomainSettings() {
        return this.getJson('/settings/domain');
    }
    setDomainSettings(settings) {
        return this.putJson('/settings/domain', settings);
    }
    getAdapters() {
        return this.getJson('/adapters');
    }
    getAuthorizations() {
        return this.getJson('/authorizations');
    }
    revokeAuthorization(clientId) {
        return this.delete(`/authorizations/${encodeURIComponent(clientId)}`);
    }
    ping() {
        const opts = {
            method: 'GET',
            headers: this.headers(),
        };
        return fetch('/ping', opts).then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
        });
    }
    getCountry() {
        return this.getJson('/settings/localization/country');
    }
    setCountry(country) {
        return this.putJson('/settings/localization/country', { country });
    }
    getTimezone() {
        return this.getJson('/settings/localization/timezone');
    }
    setTimezone(zone) {
        return this.putJson('/settings/localization/timezone', { zone });
    }
    getLanguage() {
        return this.getJson('/settings/localization/language');
    }
    setLanguage(language) {
        return this.putJson('/settings/localization/language', { language });
    }
    getUnits() {
        return this.getJson('/settings/localization/units');
    }
    setUnits(units) {
        return this.putJson('/settings/localization/units', units);
    }
}
const instance = new API();
// Elevate this to the window level.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.API = instance;
exports.default = instance;
//# sourceMappingURL=api.js.map