"use strict";
/**
 * Thing Model.
 *
 * Represents a Web Thing.
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
const Constants = __importStar(require("../constants"));
const db_1 = __importDefault(require("../db"));
const events_1 = require("events");
const user_profile_1 = __importDefault(require("../user-profile"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
class Thing extends events_1.EventEmitter {
    /**
     * Thing constructor.
     *
     * Create a Thing object from an id and a valid Thing description.
     *
     * @param {String} id Unique ID.
     * @param {Object} description Thing description.
     */
    constructor(id, description, router) {
        var _a, _b;
        super();
        if (!id || !description) {
            throw new Error('id and description needed to create new Thing');
        }
        // Parse the Thing Description
        this.id = id;
        this.title = description.title || description.name || '';
        this['@context'] = description['@context'] || 'https://webthings.io/schemas';
        this['@type'] = description['@type'] || [];
        this.description = description.description || '';
        this.href = `${Constants.THINGS_PATH}/${encodeURIComponent(this.id)}`;
        this.properties = {};
        this.actions = description.actions || {};
        this.events = description.events || {};
        this.connected = false;
        this.eventsDispatched = [];
        this.forms = [];
        let hasWriteableProperties = false;
        if (description.properties) {
            for (const propertyName in description.properties) {
                const property = description.properties[propertyName];
                if (!(property.hasOwnProperty('readOnly') && property.readOnly == true)) {
                    hasWriteableProperties = true;
                }
                if (property.hasOwnProperty('href')) {
                    delete property.href;
                }
                if (property.forms) {
                    property.forms = property.forms.map((form) => {
                        // TODO: webthings proprietary field;
                        // See https://github.com/WebThingsIO/gateway/issues/2832
                        if (form.proxy) {
                            delete form.proxy;
                            form.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${form.href}`;
                        }
                        return form;
                    });
                }
                else {
                    property.forms = [];
                }
                // Give the property a URL
                // Conservative approach do not remove provided forms
                property.forms.push({
                    href: `${this.href}${Constants.PROPERTIES_PATH}/${encodeURIComponent(propertyName)}`,
                });
                this.properties[propertyName] = property;
            }
            // If there are properties, add a top level form for them
            if (Object.keys(description.properties).length > 0) {
                let ops;
                // If there are writable properties then add readallproperties and
                // writemultipleproperties operations as an array
                if (hasWriteableProperties) {
                    ops = [
                        Constants.WoTOperation.READ_ALL_PROPERTIES,
                        Constants.WoTOperation.WRITE_MULTIPLE_PROPERTIES,
                    ];
                }
                else {
                    // Otherwise just add readallproperties operation as a string
                    ops = Constants.WoTOperation.READ_ALL_PROPERTIES;
                }
                this.forms.push({
                    href: `${this.href}${Constants.PROPERTIES_PATH}`,
                    op: ops,
                });
            }
        }
        // If there are actions, add a top level form for them
        if (Object.keys((_a = description.actions) !== null && _a !== void 0 ? _a : {}).length > 0) {
            this.forms.push({
                href: `${this.href}${Constants.ACTIONS_PATH}`,
                op: Constants.WoTOperation.QUERY_ALL_ACTIONS,
            });
        }
        // If there are events, add a top level form for them
        if (Object.keys((_b = description.events) !== null && _b !== void 0 ? _b : {}).length > 0) {
            this.forms.push({
                href: `${this.href}${Constants.EVENTS_PATH}`,
                op: [
                    Constants.WoTOperation.SUBSCRIBE_ALL_EVENTS,
                    Constants.WoTOperation.UNSUBSCRIBE_ALL_EVENTS,
                ],
                subprotocol: 'sse',
            });
        }
        this.floorplanVisibility = description.floorplanVisibility;
        this.floorplanX = description.floorplanX;
        this.floorplanY = description.floorplanY;
        this.layoutIndex = description.layoutIndex;
        this.selectedCapability = description.selectedCapability;
        this.links = [];
        const uiLink = {
            rel: 'alternate',
            type: 'text/html',
            href: this.href,
        };
        if (description.hasOwnProperty('baseHref') && description.baseHref) {
            router.addProxyServer(this.id, description.baseHref);
        }
        if (description.hasOwnProperty('links')) {
            for (const link of description.links) {
                // For backwards compatibility
                if (link.mediaType) {
                    console.warn('The mediaType member of Link is deprecated, please use type instead');
                    link.type = link.mediaType;
                    delete link.mediaType;
                }
                if (link.rel === 'alternate' && link.type === 'text/html') {
                    if (link.proxy) {
                        delete link.proxy;
                        uiLink.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
                    }
                    else {
                        uiLink.href = link.href;
                    }
                }
                else {
                    if (link.proxy) {
                        delete link.proxy;
                        link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
                    }
                    this.links.push(link);
                }
            }
        }
        this.links.push(uiLink);
        for (const actionName in this.actions) {
            const action = this.actions[actionName];
            if (action.hasOwnProperty('href')) {
                delete action.href;
            }
            if (action.forms) {
                action.forms = action.forms.map((form) => {
                    if (form.proxy) {
                        delete form.proxy;
                        form.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${form.href}`;
                    }
                    return form;
                });
            }
            else {
                action.forms = [];
            }
            // Give the action a URL
            action.forms.push({
                href: `${this.href}${Constants.ACTIONS_PATH}/${encodeURIComponent(actionName)}`,
            });
        }
        for (const eventName in this.events) {
            const event = this.events[eventName];
            if (event.hasOwnProperty('href')) {
                delete event.href;
            }
            if (event.forms) {
                event.forms = event.forms.map((form) => {
                    if (form.proxy) {
                        delete form.proxy;
                        form.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${form.href}`;
                    }
                    return form;
                });
            }
            else {
                event.forms = [];
            }
            // Give the event a URL
            event.forms.push({
                href: `${this.href}${Constants.EVENTS_PATH}/${encodeURIComponent(eventName)}`,
                subprotocol: 'sse',
            });
        }
        this.iconHref = null;
        if (description.iconHref) {
            this.iconHref = description.iconHref;
        }
        else if (description.iconData) {
            this.setIcon(description.iconData, false);
        }
        this.group_id = description.group_id || null;
    }
    getId() {
        return this.id;
    }
    getTitle() {
        return this.title;
    }
    getLayoutIndex() {
        return this.layoutIndex;
    }
    getGroup() {
        return this.group_id;
    }
    getHref() {
        return this.href;
    }
    getProperties() {
        return this.properties;
    }
    getActions() {
        return this.actions;
    }
    getEvents() {
        return this.events;
    }
    /**
     * Set the visibility of a Thing on the floorplan.
     *
     * @param {boolean} visibility Whether or not to include in the floorplan view.
     * @return {Promise} A promise which resolves with the description set.
     */
    setFloorplanVisibility(visibility) {
        this.floorplanVisibility = visibility;
        return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
            this.emit(Constants.MODIFIED);
            return descr;
        });
    }
    /**
     * Set the x and y co-ordinates for a Thing on the floorplan.
     *
     * @param {number} x The x co-ordinate on floorplan (0-100).
     * @param {number} y The y co-ordinate on floorplan (0-100).
     * @return {Promise} A promise which resolves with the description set.
     */
    setCoordinates(x, y) {
        this.floorplanX = x;
        this.floorplanY = y;
        return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
            this.emit(Constants.MODIFIED);
            return descr;
        });
    }
    /**
     * Set the layout index for a Thing.
     *
     * @param {number} index The new layout index.
     * @return {Promise} A promise which resolves with the description set.
     */
    setLayoutIndex(index) {
        this.layoutIndex = index;
        return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
            return descr;
        });
    }
    /**
     * Set the title of this Thing.
     *
     * @param {String} title The new title
     * @return {Promise} A promise which resolves with the description set.
     */
    setTitle(title) {
        this.title = title;
        return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
            this.emit(Constants.MODIFIED);
            return descr;
        });
    }
    /**
     * Set the custom icon for this Thing.
     *
     * @param {Object} iconData Base64-encoded icon and its mime-type.
     * @param {Boolean} updateDatabase Whether or not to update the database after
     *                                 setting.
     */
    setIcon(iconData, updateDatabase) {
        if (!iconData.data || !['image/jpeg', 'image/png', 'image/svg+xml'].includes(iconData.mime)) {
            console.error('Invalid icon data:', iconData);
            throw new Error('Invalid icon data');
        }
        if (this.iconHref) {
            try {
                fs_1.default.unlinkSync(path_1.default.join(user_profile_1.default.baseDir, this.iconHref));
            }
            catch (e) {
                console.error('Failed to remove old icon:', e);
                // continue
            }
            this.iconHref = null;
        }
        let extension;
        switch (iconData.mime) {
            case 'image/jpeg':
                extension = '.jpg';
                break;
            case 'image/png':
                extension = '.png';
                break;
            case 'image/svg+xml':
                extension = '.svg';
                break;
        }
        let tempfile;
        try {
            tempfile = tmp_1.default.fileSync({
                mode: parseInt('0644', 8),
                template: `XXXXXX${extension}`,
                tmpdir: user_profile_1.default.uploadsDir,
                detachDescriptor: true,
                keep: true,
            });
            const data = Buffer.from(iconData.data, 'base64');
            fs_1.default.writeFileSync(tempfile.fd, data);
        }
        catch (e) {
            console.error('Failed to write icon:', e);
            if (tempfile) {
                try {
                    fs_1.default.unlinkSync(tempfile.name);
                }
                catch (e) {
                    // pass
                }
            }
            throw new Error('Failed to write icon');
        }
        this.iconHref = path_1.default.join('/uploads', path_1.default.basename(tempfile.name));
        if (updateDatabase) {
            return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
                this.emit(Constants.MODIFIED);
                return descr;
            });
        }
        return Promise.resolve(this.getDescription());
    }
    /**
     * Set the selected capability of this Thing.
     *
     * @param {String} capability The selected capability
     * @return {Promise} A promise which resolves with the description set.
     */
    setSelectedCapability(capability) {
        this.selectedCapability = capability;
        return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
            this.emit(Constants.MODIFIED);
            return descr;
        });
    }
    /**
     * Set the group for a Thing in the overview.
     *
     * @param {string} group_id ID of the group
     * @return {Promise} A promise which resolves with the description set.
     */
    setGroup(group_id) {
        this.group_id = group_id;
        return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
            return descr;
        });
    }
    /**
     * Dispatch an event to all listeners subscribed to the Thing
     * @param {Event} event
     */
    dispatchEvent(event) {
        if (!event.getThingId()) {
            event.setThingId(this.id);
        }
        this.eventsDispatched.push(event);
        this.emit(Constants.EVENT, event);
    }
    /**
     * Add a subscription to the Thing's events
     * @param {Function} callback
     */
    addEventSubscription(callback) {
        this.on(Constants.EVENT, callback);
    }
    /**
     * Remove a subscription to the Thing's events
     * @param {Function} callback
     */
    removeEventSubscription(callback) {
        this.removeListener(Constants.EVENT, callback);
    }
    /**
     * Add a subscription to the Thing's connected state
     * @param {Function} callback
     */
    addConnectedSubscription(callback) {
        this.on(Constants.CONNECTED, callback);
        callback(this.connected);
    }
    /**
     * Remove a subscription to the Thing's connected state
     * @param {Function} callback
     */
    removeConnectedSubscription(callback) {
        this.removeListener(Constants.CONNECTED, callback);
    }
    /**
     * Add a subscription to the Thing's modified state
     * @param {Function} callback
     */
    addModifiedSubscription(callback) {
        this.on(Constants.MODIFIED, callback);
    }
    /**
     * Remove a subscription to the Thing's modified state
     * @param {Function} callback
     */
    removeModifiedSubscription(callback) {
        this.removeListener(Constants.MODIFIED, callback);
    }
    /**
     * Add a subscription to the Thing's removed state
     * @param {Function} callback
     */
    addRemovedSubscription(callback) {
        this.on(Constants.REMOVED, callback);
    }
    /**
     * Remove a subscription to the Thing's removed state
     * @param {Function} callback
     */
    removeRemovedSubscription(callback) {
        this.removeListener(Constants.REMOVED, callback);
    }
    /**
     * Get a JSON Thing Description for this Thing.
     *
     * @param {String} reqHost request host, if coming via HTTP
     * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
     */
    getDescription(reqHost, reqSecure) {
        const desc = {
            title: this.title,
            '@context': this['@context'],
            '@type': this['@type'],
            description: this.description,
            href: this.href,
            properties: this.properties,
            actions: this.actions,
            events: this.events,
            links: JSON.parse(JSON.stringify(this.links)),
            forms: this.forms,
            floorplanVisibility: this.floorplanVisibility,
            floorplanX: this.floorplanX,
            floorplanY: this.floorplanY,
            layoutIndex: this.layoutIndex,
            selectedCapability: this.selectedCapability,
            iconHref: this.iconHref,
            group_id: this.group_id,
        };
        if (typeof reqHost !== 'undefined') {
            const wsLink = {
                rel: 'alternate',
                href: `${reqSecure ? 'wss' : 'ws'}://${reqHost}${this.href}`,
            };
            desc.links.push(wsLink);
            desc.id = `${reqSecure ? 'https' : 'http'}://${reqHost}${this.href}`;
            desc.base = `${reqSecure ? 'https' : 'http'}://${reqHost}/`;
            desc.securityDefinitions = {
                oauth2_sc: {
                    scheme: 'oauth2',
                    flow: 'code',
                    authorization: `${reqSecure ? 'https' : 'http'}://${reqHost}${Constants.OAUTH_PATH}/authorize`,
                    token: `${reqSecure ? 'https' : 'http'}://${reqHost}${Constants.OAUTH_PATH}/token`,
                    scopes: [
                        `${this.href}:readwrite`,
                        this.href,
                        `${Constants.THINGS_PATH}:readwrite`,
                        Constants.THINGS_PATH,
                    ],
                },
            };
            desc.security = 'oauth2_sc';
        }
        return desc;
    }
    /**
     * Remove and clean up the Thing
     */
    remove() {
        if (this.iconHref) {
            try {
                fs_1.default.unlinkSync(path_1.default.join(user_profile_1.default.baseDir, this.iconHref));
            }
            catch (e) {
                console.error('Failed to remove old icon:', e);
                // continue
            }
            this.iconHref = null;
        }
        this.emit(Constants.REMOVED, true);
    }
    /**
     * Add an action
     * @param {Action} action
     * @return {boolean} Whether a known action
     */
    addAction(action) {
        return this.actions.hasOwnProperty(action.getName());
    }
    /**
     * Remove an action
     * @param {Action} action
     * @return {boolean} Whether a known action
     */
    removeAction(action) {
        return this.actions.hasOwnProperty(action.getName());
    }
    /**
     * Update a thing from a description.
     *
     * Thing descriptions can change as new capabilities are developed, so this
     * method allows us to update the stored thing description.
     *
     * @param {Object} description Thing description.
     * @return {Promise} A promise which resolves with the description set.
     */
    updateFromDescription(description, router) {
        var _a, _b;
        const oldDescription = JSON.stringify(this.getDescription());
        // Update @context
        this['@context'] = description['@context'] || 'https://webthings.io/schemas';
        // Update @type
        this['@type'] = description['@type'] || [];
        // Update description
        this.description = description.description || '';
        this.forms = [];
        // Update properties
        this.properties = {};
        let hasWriteableProperties = false;
        if (description.properties) {
            for (const propertyName in description.properties) {
                const property = description.properties[propertyName];
                if (!(property.hasOwnProperty('readOnly') && property.readOnly == true)) {
                    hasWriteableProperties = true;
                }
                if (property.hasOwnProperty('href')) {
                    delete property.href;
                }
                if (property.forms) {
                    property.forms = property.forms.map((form) => {
                        // TODO: WebThingsIO non-standard keyword
                        if (form.proxy) {
                            delete form.proxy;
                            form.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${form.href}`;
                        }
                        return form;
                    });
                }
                else {
                    property.forms = [];
                }
                // Give the property a URL
                // Conservative approach do not remove provided forms
                property.forms.push({
                    href: `${this.href}${Constants.PROPERTIES_PATH}/${encodeURIComponent(propertyName)}`,
                });
                this.properties[propertyName] = property;
            }
            // If there are properties, add a top level form for them
            if (Object.keys(description.properties).length > 0) {
                let ops;
                // If there are writable properties then add readallproperties and
                // writemultipleproperties operations as an array
                if (hasWriteableProperties) {
                    ops = [
                        Constants.WoTOperation.READ_ALL_PROPERTIES,
                        Constants.WoTOperation.WRITE_MULTIPLE_PROPERTIES,
                    ];
                }
                else {
                    // Otherwise just add readallproperties operation as a string
                    ops = Constants.WoTOperation.READ_ALL_PROPERTIES;
                }
                this.forms.push({
                    href: `${this.href}${Constants.PROPERTIES_PATH}`,
                    op: ops,
                });
            }
        }
        // Update actions
        this.actions = description.actions || {};
        for (const actionName in this.actions) {
            const action = this.actions[actionName];
            if (action.hasOwnProperty('href')) {
                delete action.href;
            }
            if (action.forms) {
                action.forms = action.forms.map((form) => {
                    if (form.proxy) {
                        delete form.proxy;
                        form.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${form.href}`;
                    }
                    return form;
                });
            }
            else {
                action.forms = [];
            }
            // Give the action a URL
            action.forms.push({
                href: `${this.href}${Constants.ACTIONS_PATH}/${encodeURIComponent(actionName)}`,
            });
        }
        // Update events
        this.events = description.events || {};
        for (const eventName in this.events) {
            const event = this.events[eventName];
            if (event.hasOwnProperty('href')) {
                delete event.href;
            }
            if (event.forms) {
                event.forms = event.forms.map((form) => {
                    // TODO: webthings proprietary field;
                    // See https://github.com/WebThingsIO/gateway/issues/2832
                    if (form.proxy) {
                        delete form.proxy;
                        form.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${form.href}`;
                    }
                    return form;
                });
            }
            else {
                event.forms = [];
            }
            // Give the event a URL
            event.forms.push({
                href: `${this.href}${Constants.EVENTS_PATH}/${encodeURIComponent(eventName)}`,
                subprotocol: 'sse',
            });
        }
        // If there are actions, add a top level form for them
        if (Object.keys((_a = description.actions) !== null && _a !== void 0 ? _a : {}).length > 0) {
            this.forms.push({
                href: `${this.href}${Constants.ACTIONS_PATH}`,
                op: Constants.WoTOperation.QUERY_ALL_ACTIONS,
            });
        }
        // If there are events, add a top level form for them
        if (Object.keys((_b = description.events) !== null && _b !== void 0 ? _b : {}).length > 0) {
            this.forms.push({
                href: `${this.href}${Constants.EVENTS_PATH}`,
                op: [
                    Constants.WoTOperation.SUBSCRIBE_ALL_EVENTS,
                    Constants.WoTOperation.UNSUBSCRIBE_ALL_EVENTS,
                ],
                subprotocol: 'sse',
            });
        }
        let uiLink = {
            rel: 'alternate',
            type: 'text/html',
            href: this.href,
        };
        for (const link of this.links) {
            if (link.rel === 'alternate' && link.type === 'text/html') {
                uiLink = link;
                break;
            }
        }
        if (description.hasOwnProperty('baseHref') && description.baseHref) {
            router.addProxyServer(this.id, description.baseHref);
        }
        // Update the UI href
        if (description.hasOwnProperty('links')) {
            for (const link of description.links) {
                // For backwards compatibility
                if (link.mediaType) {
                    console.warn('The mediaType member of Link is deprecated, please use type instead');
                    link.type = link.mediaType;
                    delete link.mediaType;
                }
                if (link.rel === 'alternate' && link.type === 'text/html') {
                    if (link.proxy) {
                        delete link.proxy;
                        uiLink.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
                    }
                    else {
                        uiLink.href = link.href;
                    }
                }
                else {
                    if (link.proxy) {
                        delete link.proxy;
                        link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
                    }
                    this.links.push(link);
                }
            }
        }
        // If the previously selected capability is no longer present, reset it.
        if (this.selectedCapability && !this['@type'].includes(this.selectedCapability)) {
            this.selectedCapability = '';
        }
        return db_1.default.updateThing(this.id, this.getDescription()).then((descr) => {
            const newDescription = JSON.stringify(this.getDescription());
            if (newDescription !== oldDescription) {
                this.emit(Constants.MODIFIED);
            }
            return descr;
        });
    }
    /**
     * Set the connected state of this thing.
     *
     * @param {boolean} connected - Whether or not the thing is connected
     */
    setConnected(connected) {
        this.connected = connected;
        this.emit(Constants.CONNECTED, connected);
    }
}
exports.default = Thing;
//# sourceMappingURL=thing.js.map