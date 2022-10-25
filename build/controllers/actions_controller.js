"use strict";
/**
 * Actions Controller.
 *
 * Manages the top level actions queue for the gateway and things.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const action_1 = __importDefault(require("../models/action"));
const actions_1 = __importDefault(require("../models/actions"));
const things_1 = __importDefault(require("../models/things"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
function build() {
    const controller = express_1.default.Router({ mergeParams: true });
    /**
     * Handle creating a new action.
     */
    controller.post('/', async (request, response) => {
        const keys = Object.keys(request.body);
        if (keys.length != 1) {
            const err = 'Incorrect number of parameters.';
            console.log(err, request.body);
            response.status(400).send(err);
            return;
        }
        const actionName = keys[0];
        if (!Object.prototype.hasOwnProperty.call(request.body[actionName], 'input')) {
            response.status(400).send('Missing input');
            return;
        }
        const actionParams = request.body[actionName].input;
        const thingId = request.params.thingId;
        let action = null;
        if (thingId) {
            try {
                const thing = await things_1.default.getThing(thingId);
                action = new action_1.default(actionName, actionParams, thing);
            }
            catch (e) {
                console.error('Thing does not exist', thingId, e);
                response.status(404).send(e);
                return;
            }
        }
        else {
            action = new action_1.default(actionName, actionParams);
        }
        try {
            if (thingId) {
                await addon_manager_1.default.requestAction(thingId, action.getId(), actionName, actionParams);
            }
            await actions_1.default.add(action);
            response.status(201).json({ [actionName]: action.getDescription() });
        }
        catch (e) {
            console.error('Creating action', actionName, 'failed');
            console.error(e);
            response.status(400).send(e);
        }
    });
    /**
     * Handle getting a list of actions.
     */
    controller.get('/', (request, response) => {
        if (request.params.thingId) {
            response.status(200).json(actions_1.default.getByThing(request.params.thingId));
        }
        else {
            response.status(200).json(actions_1.default.getGatewayActions());
        }
    });
    /**
     * Handle getting a list of actions.
     */
    controller.get('/:actionName', (request, response) => {
        const actionName = request.params.actionName;
        if (request.params.thingId) {
            response.status(200).json(actions_1.default.getByThing(request.params.thingId, actionName));
        }
        else {
            response.status(200).json(actions_1.default.getGatewayActions(actionName));
        }
    });
    /**
     * Handle creating a new action.
     */
    controller.post('/:actionName', async (request, response) => {
        const actionName = request.params.actionName;
        const input = request.body;
        const thingId = request.params.thingId;
        let action = null;
        if (thingId) {
            try {
                const thing = await things_1.default.getThing(thingId);
                action = new action_1.default(actionName, input, thing);
            }
            catch (e) {
                console.error('Thing does not exist', thingId, e);
                return;
                response.status(404).send(e);
            }
        }
        else {
            action = new action_1.default(actionName, input);
        }
        try {
            if (thingId) {
                await addon_manager_1.default.requestAction(thingId, action.getId(), actionName, input);
            }
            await actions_1.default.add(action);
            response.status(201).json({ [actionName]: action.getDescription() });
        }
        catch (e) {
            console.error('Creating action', actionName, 'failed');
            console.error(e);
            response.status(400).send(e);
        }
    });
    /**
     * Handle getting a particular action.
     */
    controller.get('/:actionName/:actionId', (request, response) => {
        const actionId = request.params.actionId;
        const action = actions_1.default.get(actionId);
        if (action) {
            response.status(200).json({ [action.getName()]: action.getDescription() });
        }
        else {
            const error = `Action "${actionId}" not found`;
            console.error(error);
            response.status(404).send(error);
        }
    });
    /**
     * Handle cancelling an action.
     */
    controller.delete('/:actionName/:actionId', async (request, response) => {
        const actionName = request.params.actionName;
        const actionId = request.params.actionId;
        const thingId = request.params.thingId;
        if (thingId) {
            try {
                await addon_manager_1.default.removeAction(thingId, actionId, actionName);
            }
            catch (e) {
                console.error('Removing action', actionId, 'failed');
                console.error(e);
                response.status(400).send(e);
                return;
            }
        }
        try {
            actions_1.default.remove(actionId);
        }
        catch (e) {
            console.error('Removing action', actionId, 'failed');
            console.error(e);
            response.status(404).send(e);
            return;
        }
        response.sendStatus(204);
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=actions_controller.js.map