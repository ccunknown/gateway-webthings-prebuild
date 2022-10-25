"use strict";
/**
 * Logs Controller.
 *
 * Manages HTTP requests to /logs.
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
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const Constants = __importStar(require("../constants"));
const logs_1 = __importDefault(require("../models/logs"));
function build() {
    const controller = express_1.default.Router();
    /**
     * Get a list of all currently logged properties
     */
    controller.get('/.schema', async (_request, response) => {
        const schema = await logs_1.default.getSchema();
        response.status(200).json(schema);
    });
    /**
     * Register a new metric
     */
    controller.post('/', async (request, response) => {
        const descr = request.body.descr;
        const maxAge = request.body.maxAge;
        if (!descr || typeof maxAge !== 'number') {
            response.status(400).send('Invalid descr or maxAge property');
            return;
        }
        let normalizedDescr;
        switch (descr.type) {
            case 'property':
                normalizedDescr = logs_1.default.propertyDescr(descr.thing, descr.property);
                break;
            case 'action':
                normalizedDescr = logs_1.default.actionDescr(descr.thing, descr.action);
                break;
            case 'event':
                normalizedDescr = logs_1.default.eventDescr(descr.thing, descr.event);
                break;
            default:
                response.status(400).send('Invalid descr type');
                return;
        }
        try {
            const id = await logs_1.default.registerMetric(normalizedDescr, maxAge);
            if (id === null) {
                response.status(400).send('Log already exists');
                return;
            }
            response.status(200).send({
                descr: normalizedDescr,
            });
        }
        catch (e) {
            console.error('Failed to register log:', e.message);
            response.status(500).send(`Error registering: ${e.message}`);
        }
    });
    /**
     * Get all the values of the currently logged properties
     */
    controller.get('/', async (request, response) => {
        // if (request.jwt.payload.role !== Constants.USER_TOKEN) {
        //   if (!request.jwt.payload.scope) {
        //     response.status(400).send('Token must contain scope');
        //   } else {
        //     const scope = request.jwt.payload.scope;
        //     if (scope.indexOf(' ') === -1 && scope.indexOf('/') == 0 &&
        //       scope.split('/').length == 2 &&
        //       scope.split(':')[0] === Constants.THINGS_PATH) {
        //       Things.getThingDescriptions(request.get('Host'), request.secure)
        //         .then((things) => {
        //           response.status(200).json(things);
        //         });
        //     } else {
        //       // Get hrefs of things in scope
        //       const paths = scope.split(' ');
        //       const hrefs = new Array(0);
        //       for (const path of paths) {
        //         const parts = path.split(':');
        //         hrefs.push(parts[0]);
        //       }
        //       Things.getListThingDescriptions(hrefs,
        //                                       request.get('Host'),
        //                                       request.secure)
        //         .then((things) => {
        //           response.status(200).json(things);
        //         });
        //     }
        //   }
        // } else
        const start = 'start' in request.query ? parseInt(`${request.query.start}`, 10) : null;
        const end = 'end' in request.query ? parseInt(`${request.query.end}`, 10) : null;
        try {
            const logs = await logs_1.default.getAll(start, end);
            response.status(200).json(logs);
        }
        catch (e) {
            console.error('Failed to get logs:', e);
            response.status(500).send(`Internal error: ${e}`);
        }
    });
    /**
     * Get a historical list of the values of all a Thing's properties
     */
    controller.get(`${Constants.THINGS_PATH}/:thingId`, async (request, response) => {
        const id = request.params.thingId;
        const start = 'start' in request.query ? parseInt(`${request.query.start}`, 10) : null;
        const end = 'end' in request.query ? parseInt(`${request.query.end}`, 10) : null;
        try {
            const logs = await logs_1.default.get(id, start, end);
            response.status(200).json(logs);
        }
        catch (error) {
            console.error(`Error getting logs for thing with id ${id}`);
            console.error(`Error: ${error}`);
            response.status(404).send(error);
        }
    });
    const missingPropertyPath = `${Constants.THINGS_PATH}/:thingId${Constants.PROPERTIES_PATH}`;
    // eslint-disable-next-line max-len
    const singlePropertyPath = `${Constants.THINGS_PATH}/:thingId${Constants.PROPERTIES_PATH}/:propertyName`;
    /**
     * Get a historical list of the values of a Thing's property
     */
    controller.get([missingPropertyPath, singlePropertyPath], async (request, response) => {
        const thingId = request.params.thingId;
        const propertyName = request.params.propertyName || '';
        const start = 'start' in request.query ? parseInt(`${request.query.start}`, 10) : null;
        const end = 'end' in request.query ? parseInt(`${request.query.end}`, 10) : null;
        try {
            const values = await logs_1.default.getProperty(thingId, propertyName, start, end);
            response.status(200).json(values || []);
        }
        catch (err) {
            response.status(404).send(err);
        }
    });
    controller.delete([missingPropertyPath, singlePropertyPath], async (request, response) => {
        const thingId = request.params.thingId;
        const propertyName = request.params.propertyName || '';
        const normalizedDescr = logs_1.default.propertyDescr(thingId, propertyName);
        try {
            await logs_1.default.unregisterMetric(normalizedDescr);
            response.status(200).send({
                descr: normalizedDescr,
            });
        }
        catch (e) {
            console.error('Failed to delete log:', e);
            response.status(500).send(`Internal error: ${e}`);
        }
    });
    controller.ws('/', (websocket) => {
        if (websocket.readyState !== ws_1.default.OPEN) {
            return;
        }
        const heartbeat = setInterval(() => {
            try {
                websocket.ping();
            }
            catch (e) {
                websocket.terminate();
            }
        }, 30 * 1000);
        function streamMetric(metrics) {
            if (!metrics || metrics.length === 0) {
                return;
            }
            try {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                websocket.send(JSON.stringify(metrics), () => { });
            }
            catch (_e) {
                // Just don't let it crash anything
            }
        }
        const cleanup = () => {
            clearInterval(heartbeat);
        };
        logs_1.default.streamAll(streamMetric, null, null).then(() => {
            cleanup();
            // Eventually send dynamic property value updates for the graphs to update
            // in real time
            websocket.close();
        });
        websocket.on('error', cleanup);
        websocket.on('close', cleanup);
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=logs_controller.js.map