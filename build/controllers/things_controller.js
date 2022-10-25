"use strict";
/**
 * Things Controller.
 *
 * Manages HTTP requests to /things.
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
const action_1 = __importDefault(require("../models/action"));
const actions_1 = __importDefault(require("../models/actions"));
const actions_controller_1 = __importDefault(require("./actions_controller"));
const Constants = __importStar(require("../constants"));
const events_controller_1 = __importDefault(require("./events_controller"));
const express_1 = __importDefault(require("express"));
const Settings = __importStar(require("../models/settings"));
const ws_1 = __importDefault(require("ws"));
const things_1 = __importDefault(require("../models/things"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
const utils_1 = require("../utils");
function build() {
    const controller = express_1.default.Router();
    /**
     * Connect to receive messages from a Thing or all Things
     *
     * Note that these must precede the normal routes to allow express-ws to work
     */
    controller.ws('/:thingId/', websocketHandler);
    controller.ws('/', websocketHandler);
    /**
     * Get a list of Things.
     */
    controller.get('/', (req, response) => {
        const request = req;
        if (request.jwt.getPayload().role !== Constants.USER_TOKEN) {
            if (!request.jwt.getPayload().scope) {
                response.status(400).send('Token must contain scope');
            }
            else {
                const scope = request.jwt.getPayload().scope;
                if (!scope.includes(' ') &&
                    scope.indexOf('/') == 0 &&
                    scope.split('/').length == 2 &&
                    scope.split(':')[0] === Constants.THINGS_PATH) {
                    things_1.default.getThingDescriptions(request.get('Host'), request.secure).then((things) => {
                        response.status(200).json(things);
                    });
                }
                else {
                    // Get hrefs of things in scope
                    const paths = scope.split(' ');
                    const hrefs = new Array(0);
                    for (const path of paths) {
                        const parts = path.split(':');
                        hrefs.push(parts[0]);
                    }
                    things_1.default.getListThingDescriptions(hrefs, request.get('Host'), request.secure).then((things) => {
                        response.status(200).json(things);
                    });
                }
            }
        }
        else {
            things_1.default.getThingDescriptions(request.get('Host'), request.secure).then((things) => {
                response.status(200).json(things);
            });
        }
    });
    controller.patch('/', async (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('thingId') || !request.body.thingId) {
            response.status(400).send('Invalid request');
            return;
        }
        const thingId = request.body.thingId;
        if (request.body.hasOwnProperty('pin') && request.body.pin.length > 0) {
            const pin = request.body.pin;
            try {
                const device = await addon_manager_1.default.setPin(thingId, pin);
                response.status(200).json(device);
            }
            catch (e) {
                console.error(`Failed to set PIN for ${thingId}: ${e}`);
                response.status(400).send(e);
            }
        }
        else if (request.body.hasOwnProperty('username') &&
            request.body.username.length > 0 &&
            request.body.hasOwnProperty('password') &&
            request.body.password.length > 0) {
            const username = request.body.username;
            const password = request.body.password;
            try {
                const device = await addon_manager_1.default.setCredentials(thingId, username, password);
                response.status(200).json(device);
            }
            catch (e) {
                console.error(`Failed to set credentials for ${thingId}: ${e}`);
                response.status(400).send(e);
            }
        }
        else {
            response.status(400).send('Invalid request');
        }
    });
    /**
     * Handle creating a new thing.
     */
    controller.post('/', async (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('id')) {
            response.status(400).send('No id in thing description');
            return;
        }
        const description = request.body;
        const id = description.id;
        delete description.id;
        try {
            // If the thing already exists, bail out.
            await things_1.default.getThing(id);
            const err = 'Web thing already added';
            console.log(err, id);
            response.status(400).send(err);
            return;
        }
        catch (_e) {
            // Do nothing, this is what we want.
        }
        const isWotAdapterInstalled = addon_manager_1.default.isAddonInstalled('wot-adapter');
        const isThingUrlInstalled = addon_manager_1.default.isAddonInstalled('thing-url-adapter');
        // If we're adding a native webthing, we need to update the config for
        // thing-url-adapter or wot-adpater so that it knows about it.
        let webthing = false;
        let adapterToBeReloaded = 'thing-url-adapter';
        if (description.hasOwnProperty('webthingUrl')) {
            webthing = true;
            try {
                if (isThingUrlInstalled && !(0, utils_1.isW3CThingDescription)(description)) {
                    await loadThingInThingUrlAdapter(description);
                    adapterToBeReloaded = 'thing-url-adapter';
                }
                else if (isWotAdapterInstalled) {
                    // thing-url-adapter is not installed or the ThingDescription was
                    // recognized as a w3c thing description.
                    await loadThingInWotAdpater(description);
                    adapterToBeReloaded = 'wot-adapter';
                }
            }
            catch (e) {
                console.error('Failed to update settings for thing-url-adapter');
                console.error(e);
                response.status(400).send(e);
                return;
            }
            delete description.webthingUrl;
        }
        try {
            const thing = await things_1.default.createThing(id, description);
            console.log(`Successfully created new thing ${thing.title}`);
            response.status(201).send(thing);
        }
        catch (error) {
            console.error('Error saving new thing', id, description);
            console.error(error);
            response.status(500).send(error);
        }
        // If this is a web thing, we need to restart the adpater
        if (webthing) {
            try {
                await addon_manager_1.default.unloadAddon(adapterToBeReloaded, true);
                await addon_manager_1.default.loadAddon(adapterToBeReloaded);
            }
            catch (e) {
                console.error(`Failed to restart ${adapterToBeReloaded}`);
                console.error(e);
            }
        }
    });
    /**
     * Get a Thing.
     */
    controller.get('/:thingId', (request, response) => {
        const id = request.params.thingId;
        things_1.default.getThingDescription(id, request.get('Host'), request.secure)
            .then((thing) => {
            response.status(200).json(thing);
        })
            .catch((error) => {
            console.error(`Error getting thing description for thing with id ${id}:`, error);
            response.status(404).send(error);
        });
    });
    /**
     * Get the properties of a Thing.
     */
    controller.get('/:thingId/properties', async (request, response) => {
        const thingId = request.params.thingId;
        let thing;
        try {
            thing = await things_1.default.getThing(thingId);
        }
        catch (e) {
            console.error('Failed to get thing:', e);
            response.status(404).send(e);
            return;
        }
        const result = {};
        for (const name in thing.getProperties()) {
            try {
                const value = await addon_manager_1.default.getProperty(thingId, name);
                result[name] = value;
            }
            catch (e) {
                console.error(`Failed to get property ${name}:`, e);
            }
        }
        response.status(200).json(result);
    });
    /**
     * Set multiple properties of a Thing.
     */
    controller.put('/:thingId/properties', async (request, response) => {
        const thingId = request.params.thingId;
        if (!(typeof request.body === 'object') || request.body === null) {
            response.sendStatus(400);
            return;
        }
        // An array of promises to set each property
        const promises = [];
        for (const propertyName of Object.keys(request.body)) {
            promises.push(things_1.default.setThingProperty(thingId, propertyName, request.body[propertyName]));
        }
        Promise.all(promises)
            .then(() => {
            // Respond with success code if all properties set successfully
            response.sendStatus(204);
        })
            .catch((err) => {
            // Otherwise send an error response
            console.error('Error setting property:', err);
            response.sendStatus(500);
        });
    });
    /**
     * Get a property of a Thing.
     */
    controller.get('/:thingId/properties/:propertyName', async (request, response) => {
        const thingId = request.params.thingId;
        const propertyName = request.params.propertyName;
        try {
            const value = await things_1.default.getThingProperty(thingId, propertyName);
            response.status(200).json(value);
        }
        catch (err) {
            response.status(err.code).send(err.message);
        }
    });
    /**
     * Set a property of a Thing.
     */
    controller.put('/:thingId/properties/:propertyName', async (request, response) => {
        const thingId = request.params.thingId;
        const propertyName = request.params.propertyName;
        if (typeof request.body === 'undefined') {
            response.sendStatus(400);
            return;
        }
        const value = request.body;
        try {
            await things_1.default.setThingProperty(thingId, propertyName, value);
            response.sendStatus(204);
        }
        catch (err) {
            console.error('Error setting property:', err);
            response
                .status(err.code || 500)
                .send(err.message);
        }
    });
    /**
     * Use an ActionsController to handle each thing's actions.
     */
    controller.use(`/:thingId${Constants.ACTIONS_PATH}`, (0, actions_controller_1.default)());
    /**
     * Use an EventsController to handle each thing's events.
     */
    controller.use(`/:thingId${Constants.EVENTS_PATH}`, (0, events_controller_1.default)());
    /**
     * Modify a Thing's floorplan position, layout index or group.
     */
    controller.patch('/:thingId', async (request, response) => {
        const thingId = request.params.thingId;
        if (!request.body) {
            response.status(400).send('request body missing');
            return;
        }
        let thing;
        try {
            thing = await things_1.default.getThing(thingId);
        }
        catch (e) {
            response.status(404).send('thing not found');
            return;
        }
        try {
            if (request.body.hasOwnProperty('floorplanX') && request.body.hasOwnProperty('floorplanY')) {
                await thing.setCoordinates(request.body.floorplanX, request.body.floorplanY);
            }
            else if (request.body.hasOwnProperty('layoutIndex') &&
                request.body.hasOwnProperty('group')) {
                await things_1.default.setThingGroupAndLayoutIndex(thing, request.body.group, request.body.layoutIndex);
            }
            else if (request.body.hasOwnProperty('layoutIndex')) {
                await things_1.default.setThingLayoutIndex(thing, request.body.layoutIndex);
            }
            else if (request.body.hasOwnProperty('group')) {
                await things_1.default.setThingGroup(thing, request.body.group);
            }
            else {
                response.status(400).send('request body missing required parameters');
                return;
            }
            response.status(200).json(thing.getDescription());
        }
        catch (e) {
            response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
        }
    });
    /**
     * Modify a Thing.
     */
    controller.put('/:thingId', async (request, response) => {
        const thingId = request.params.thingId;
        if (!request.body || !request.body.hasOwnProperty('title')) {
            response.status(400).send('title parameter required');
            return;
        }
        const title = request.body.title.trim();
        if (title.length === 0) {
            response.status(400).send('Invalid title');
            return;
        }
        let thing;
        try {
            thing = await things_1.default.getThing(thingId);
        }
        catch (e) {
            response.status(500).send(`Failed to retrieve thing ${thingId}: ${e}`);
            return;
        }
        if (request.body.selectedCapability) {
            try {
                await thing.setSelectedCapability(request.body.selectedCapability);
            }
            catch (e) {
                response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
                return;
            }
        }
        if (request.body.iconData) {
            try {
                await thing.setIcon(request.body.iconData, true);
            }
            catch (e) {
                response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
                return;
            }
        }
        if (request.body.hasOwnProperty('floorplanVisibility')) {
            await thing.setFloorplanVisibility(request.body.floorplanVisibility);
        }
        let description;
        try {
            description = await thing.setTitle(title);
        }
        catch (e) {
            response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
            return;
        }
        response.status(200).json(description);
    });
    /**
     * Remove a Thing.
     */
    controller.delete('/:thingId', (request, response) => {
        const thingId = request.params.thingId;
        const _finally = () => {
            things_1.default.removeThing(thingId)
                .then(() => {
                console.log(`Successfully deleted ${thingId} from database.`);
                response.sendStatus(204);
            })
                .catch((e) => {
                response.status(500).send(`Failed to remove thing ${thingId}: ${e}`);
            });
        };
        addon_manager_1.default.removeThing(thingId).then(_finally, _finally);
    });
    function websocketHandler(websocket, request) {
        // Since the Gateway have the asynchronous express middlewares, there is a
        // possibility that the WebSocket have been closed.
        if (websocket.readyState !== ws_1.default.OPEN) {
            return;
        }
        const thingId = request.params.thingId;
        const subscribedEventNames = {};
        function sendMessage(message) {
            websocket.send(JSON.stringify(message), (err) => {
                if (err) {
                    console.error(`WebSocket sendMessage failed: ${err}`);
                }
            });
        }
        function onPropertyChanged(property) {
            if (typeof thingId !== 'undefined' && property.getDevice().getId() !== thingId) {
                return;
            }
            property.getValue().then((value) => {
                sendMessage({
                    id: property.getDevice().getId(),
                    messageType: Constants.PROPERTY_STATUS,
                    data: {
                        [property.getName()]: value,
                    },
                });
            });
        }
        function onActionStatus(action) {
            if (action.hasOwnProperty('thingId') &&
                action.getThingId() !== null &&
                action.getThingId() !== thingId) {
                return;
            }
            const message = {
                messageType: Constants.ACTION_STATUS,
                data: {
                    [action.getName()]: action.getDescription(),
                },
            };
            if (action.getThingId() !== null) {
                message.id = action.getThingId();
            }
            sendMessage(message);
        }
        function onEvent(event) {
            if (typeof thingId !== 'undefined' && event.getThingId() !== thingId) {
                return;
            }
            if (!subscribedEventNames[event.getName()]) {
                return;
            }
            sendMessage({
                id: event.getThingId(),
                messageType: Constants.EVENT,
                data: {
                    [event.getName()]: event.getDescription(),
                },
            });
        }
        let thingCleanups = {};
        function addThing(thing) {
            thing.addEventSubscription(onEvent);
            function onConnected(connected) {
                sendMessage({
                    id: thing.getId(),
                    messageType: Constants.CONNECTED,
                    data: connected,
                });
            }
            thing.addConnectedSubscription(onConnected);
            const onRemoved = () => {
                if (thingCleanups[thing.getId()]) {
                    thingCleanups[thing.getId()]();
                    delete thingCleanups[thing.getId()];
                }
                if (typeof thingId !== 'undefined' &&
                    (websocket.readyState === ws_1.default.OPEN || websocket.readyState === ws_1.default.CONNECTING)) {
                    websocket.close();
                }
                else {
                    sendMessage({
                        id: thing.getId(),
                        messageType: Constants.THING_REMOVED,
                        data: {},
                    });
                }
            };
            thing.addRemovedSubscription(onRemoved);
            const onModified = () => {
                sendMessage({
                    id: thing.getId(),
                    messageType: Constants.THING_MODIFIED,
                    data: {},
                });
            };
            thing.addModifiedSubscription(onModified);
            const thingCleanup = () => {
                thing.removeEventSubscription(onEvent);
                thing.removeConnectedSubscription(onConnected);
                thing.removeRemovedSubscription(onRemoved);
                thing.removeModifiedSubscription(onModified);
            };
            thingCleanups[thing.getId()] = thingCleanup;
            // send initial property values
            for (const name in thing.getProperties()) {
                addon_manager_1.default.getProperty(thing.getId(), name)
                    .then((value) => {
                    sendMessage({
                        id: thing.getId(),
                        messageType: Constants.PROPERTY_STATUS,
                        data: {
                            [name]: value,
                        },
                    });
                })
                    .catch((e) => {
                    console.error(`Failed to get property ${name}:`, e);
                });
            }
        }
        function onThingAdded(thing) {
            sendMessage({
                id: thing.getId(),
                messageType: Constants.THING_ADDED,
                data: {},
            });
            addThing(thing);
        }
        if (typeof thingId !== 'undefined') {
            things_1.default.getThing(thingId)
                .then((thing) => {
                addThing(thing);
            })
                .catch(() => {
                console.error('WebSocket opened on nonexistent thing', thingId);
                sendMessage({
                    messageType: Constants.ERROR,
                    data: {
                        code: 404,
                        status: '404 Not Found',
                        message: `Thing ${thingId} not found`,
                    },
                });
                websocket.close();
            });
        }
        else {
            things_1.default.getThings().then((things) => {
                things.forEach(addThing);
            });
            things_1.default.on(Constants.THING_ADDED, onThingAdded);
        }
        function onLayoutModified() {
            sendMessage({
                messageType: Constants.LAYOUT_MODIFIED,
                data: {},
            });
        }
        things_1.default.on(Constants.LAYOUT_MODIFIED, onLayoutModified);
        addon_manager_1.default.on(Constants.PROPERTY_CHANGED, onPropertyChanged);
        actions_1.default.on(Constants.ACTION_STATUS, onActionStatus);
        const heartbeatInterval = setInterval(() => {
            try {
                websocket.ping();
            }
            catch (e) {
                // Do nothing. Let cleanup() handle things if necessary.
                websocket.terminate();
            }
        }, 30 * 1000);
        const cleanup = () => {
            things_1.default.removeListener(Constants.THING_ADDED, onThingAdded);
            addon_manager_1.default.removeListener(Constants.PROPERTY_CHANGED, onPropertyChanged);
            actions_1.default.removeListener(Constants.ACTION_STATUS, onActionStatus);
            for (const id in thingCleanups) {
                thingCleanups[id]();
            }
            thingCleanups = {};
            clearInterval(heartbeatInterval);
        };
        websocket.on('error', cleanup);
        websocket.on('close', cleanup);
        websocket.on('message', (requestText) => {
            let request;
            try {
                request = JSON.parse(requestText);
            }
            catch (e) {
                sendMessage({
                    messageType: Constants.ERROR,
                    data: {
                        code: 400,
                        status: '400 Bad Request',
                        message: 'Parsing request failed',
                    },
                });
                return;
            }
            const id = request.id || thingId;
            if (typeof id === 'undefined') {
                sendMessage({
                    messageType: Constants.ERROR,
                    data: {
                        code: 400,
                        status: '400 Bad Request',
                        message: 'Missing thing id',
                        request,
                    },
                });
                return;
            }
            const device = addon_manager_1.default.getDevice(id);
            if (!device) {
                sendMessage({
                    messageType: Constants.ERROR,
                    data: {
                        code: 400,
                        status: '400 Bad Request',
                        message: `Thing ${id} not found`,
                        request,
                    },
                });
                return;
            }
            switch (request.messageType) {
                case Constants.SET_PROPERTY: {
                    const setRequests = Object.keys(request.data).map((property) => {
                        const value = request.data[property];
                        return device.setProperty(property, value);
                    });
                    Promise.all(setRequests).catch((err) => {
                        // If any set fails, send an error
                        sendMessage({
                            messageType: Constants.ERROR,
                            data: {
                                code: 400,
                                status: '400 Bad Request',
                                message: err,
                                request,
                            },
                        });
                    });
                    break;
                }
                case Constants.ADD_EVENT_SUBSCRIPTION: {
                    for (const eventName in request.data) {
                        subscribedEventNames[eventName] = true;
                    }
                    break;
                }
                case Constants.REQUEST_ACTION: {
                    for (const actionName in request.data) {
                        const actionParams = request.data[actionName].input;
                        things_1.default.getThing(id)
                            .then((thing) => {
                            const action = new action_1.default(actionName, actionParams, thing);
                            return actions_1.default.add(action).then(() => {
                                return addon_manager_1.default.requestAction(id, action.getId(), actionName, actionParams !== null && actionParams !== void 0 ? actionParams : null);
                            });
                        })
                            .catch((err) => {
                            sendMessage({
                                messageType: Constants.ERROR,
                                data: {
                                    code: 400,
                                    status: '400 Bad Request',
                                    message: err.message,
                                    request,
                                },
                            });
                        });
                    }
                    break;
                }
                default: {
                    sendMessage({
                        messageType: Constants.ERROR,
                        data: {
                            code: 400,
                            status: '400 Bad Request',
                            message: `Unknown messageType: ${request.messageType}`,
                            request,
                        },
                    });
                    break;
                }
            }
        });
    }
    return controller;
}
async function loadThingInThingUrlAdapter(description) {
    const key = 'addons.config.thing-url-adapter';
    const config = await Settings.getSetting(key);
    if (typeof config === 'undefined') {
        throw new Error('Setting is undefined.');
    }
    config.urls.push(description.webthingUrl);
    await Settings.setSetting(key, config);
}
async function loadThingInWotAdpater(description) {
    var _a;
    const key = 'addons.config.wot-adapter';
    const config = await Settings.getSetting(key);
    if (typeof config === 'undefined') {
        throw new Error('Setting is undefined.');
    }
    (_a = config.endpoints) !== null && _a !== void 0 ? _a : (config.endpoints = []);
    config.endpoints.push({ url: description.webthingUrl });
    await Settings.setSetting(key, config);
}
exports.default = build;
//# sourceMappingURL=things_controller.js.map