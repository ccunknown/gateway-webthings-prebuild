"use strict";
/**
 * Groups Controller.
 *
 * Manages HTTP requests to /groups.
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
const express_1 = __importDefault(require("express"));
const groups_1 = __importDefault(require("../models/groups"));
const things_1 = __importDefault(require("../models/things"));
const uuid_1 = require("uuid");
const ws_1 = __importDefault(require("ws"));
function build() {
    const controller = express_1.default.Router();
    controller.ws('/', websocketHandler);
    /**
     * Get a list of Groups.
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
                    scope.split(':')[0] === Constants.GROUPS_PATH) {
                    groups_1.default.getGroupDescriptions().then((groups) => {
                        response.status(200).json(groups);
                    });
                }
                else {
                    // Get hrefs of groups in scope
                    const paths = scope.split(' ');
                    const hrefs = new Array(0);
                    for (const path of paths) {
                        const parts = path.split(':');
                        hrefs.push(parts[0]);
                    }
                    groups_1.default.getListGroupDescriptions(hrefs).then((groups) => {
                        response.status(200).json(groups);
                    });
                }
            }
        }
        else {
            groups_1.default.getGroupDescriptions().then((groups) => {
                response.status(200).json(groups);
            });
        }
    });
    /**
     * Handle creating a new group.
     */
    controller.post('/', async (request, response) => {
        const description = request.body;
        const id = (0, uuid_1.v4)();
        try {
            // If the group already exists, bail out.
            await groups_1.default.getGroup(id);
            const err = 'Group already added';
            console.log(err, id);
            response.status(400).send(err);
            return;
        }
        catch (_e) {
            // Do nothing, this is what we want.
        }
        try {
            const group = await groups_1.default.createGroup(id, description);
            console.log(`Successfully created new group ${group.title}`);
            response.status(201).send(group);
        }
        catch (error) {
            console.error('Error saving new group', id, description);
            console.error(error);
            response.status(500).send(error);
        }
    });
    /**
     * Get a Group.
     */
    controller.get('/:groupId', (request, response) => {
        const id = request.params.groupId;
        groups_1.default.getGroupDescription(id)
            .then((group) => {
            response.status(200).json(group);
        })
            .catch((error) => {
            console.error(`Error getting group description for group with id ${id}:`, error);
            response.status(404).send(error);
        });
    });
    /**
     * Get things in a Group.
     */
    controller.get('/:groupId/things', (request, response) => {
        const id = request.params.groupId;
        things_1.default.getThingDescriptions(request.get('Host'), request.secure)
            .then((things) => {
            const filteredThings = Array.from(things.values()).filter((thing) => {
                return thing.group_id == id;
            });
            response.status(200).json(filteredThings);
        })
            .catch((error) => {
            console.error(`Error getting things in group ${id}:`, error);
            response.status(404).send(error);
        });
    });
    /**
     * Modify a Group's layout index.
     */
    controller.patch('/:groupId', async (request, response) => {
        const groupId = request.params.groupId;
        if (!request.body) {
            response.status(400).send('request body missing');
            return;
        }
        let group;
        try {
            group = await groups_1.default.getGroup(groupId);
        }
        catch (e) {
            response.status(404).send('group not found');
            return;
        }
        try {
            if (request.body.hasOwnProperty('layoutIndex')) {
                await groups_1.default.setGroupLayoutIndex(group, request.body.layoutIndex);
            }
            else {
                response.status(400).send('request body missing required parameters');
                return;
            }
            response.status(200).json(group.getDescription());
        }
        catch (e) {
            response.status(500).send(`Failed to update group ${groupId}: ${e}`);
        }
    });
    /**
     * Modify a Group.
     */
    controller.put('/:groupId', async (request, response) => {
        const groupId = request.params.groupId;
        if (!request.body || !request.body.hasOwnProperty('title')) {
            response.status(400).send('title parameter required');
            return;
        }
        const title = request.body.title.trim();
        if (title.length === 0) {
            response.status(400).send('Invalid title');
            return;
        }
        let group;
        try {
            group = await groups_1.default.getGroup(groupId);
        }
        catch (e) {
            response.status(500).send(`Failed to retrieve group ${groupId}: ${e}`);
            return;
        }
        let description;
        try {
            description = await group.setTitle(title);
        }
        catch (e) {
            response.status(500).send(`Failed to update group ${groupId}: ${e}`);
            return;
        }
        response.status(200).json(description);
    });
    /**
     * Remove a Group.
     */
    controller.delete('/:groupId', (request, response) => {
        const groupId = request.params.groupId;
        groups_1.default.removeGroup(groupId)
            .then(() => {
            console.log(`Successfully deleted ${groupId} from database.`);
            response.sendStatus(204);
        })
            .catch((e) => {
            response.status(500).send(`Failed to remove group ${groupId}: ${e}`);
        });
    });
    function websocketHandler(websocket, _request) {
        // Since the Gateway have the asynchronous express middlewares, there is a
        // possibility that the WebSocket have been closed.
        if (websocket.readyState !== ws_1.default.OPEN) {
            return;
        }
        function sendMessage(message) {
            websocket.send(JSON.stringify(message), (err) => {
                if (err) {
                    console.error(`WebSocket sendMessage failed: ${err}`);
                }
            });
        }
        let groupCleanups = {};
        function addGroup(group) {
            const onModified = () => {
                sendMessage({
                    id: group.getId(),
                    messageType: Constants.GROUP_MODIFIED,
                    data: {},
                });
            };
            group.addModifiedSubscription(onModified);
            const groupCleanup = () => {
                group.removeModifiedSubscription(onModified);
            };
            groupCleanups[group.getId()] = groupCleanup;
        }
        function onGroupAdded(group) {
            sendMessage({
                id: group.getId(),
                messageType: Constants.GROUP_ADDED,
                data: {},
            });
            addGroup(group);
        }
        function onGroupRemoved(group) {
            if (groupCleanups[group.getId()]) {
                groupCleanups[group.getId()]();
                delete groupCleanups[group.getId()];
            }
            sendMessage({
                id: group.getId(),
                messageType: Constants.GROUP_REMOVED,
                data: {},
            });
        }
        groups_1.default.getGroups().then((groups) => {
            groups.forEach(addGroup);
        });
        function onLayoutModified() {
            sendMessage({
                messageType: Constants.LAYOUT_MODIFIED,
                data: {},
            });
        }
        groups_1.default.on(Constants.LAYOUT_MODIFIED, onLayoutModified);
        groups_1.default.on(Constants.GROUP_ADDED, onGroupAdded);
        groups_1.default.on(Constants.GROUP_REMOVED, onGroupRemoved);
        const heartbeatInterval = setInterval(() => {
            try {
                websocket.ping();
            }
            catch (e) {
                // Do nothing. Let cleanup() handle groups if necessary.
                websocket.terminate();
            }
        }, 30 * 1000);
        const cleanup = () => {
            groups_1.default.removeListener(Constants.GROUP_ADDED, onGroupAdded);
            for (const id in groupCleanups) {
                groupCleanups[id]();
            }
            groupCleanups = {};
            clearInterval(heartbeatInterval);
        };
        websocket.on('error', cleanup);
        websocket.on('close', cleanup);
        websocket.on('message', (_requestText) => {
            sendMessage({
                messageType: Constants.ERROR,
                data: {
                    code: 400,
                    status: '400 Bad Request',
                    message: `Invalid request`,
                },
            });
        });
    }
    return controller;
}
exports.default = build;
//# sourceMappingURL=groups_controller.js.map