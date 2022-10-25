"use strict";
/**
 * Events Controller.
 *
 * Manages events endpoints for the gateway and things.
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
const things_1 = __importDefault(require("../models/things"));
const events_1 = __importDefault(require("../models/events"));
function build() {
    const controller = express_1.default.Router({ mergeParams: true });
    /**
     * Handle getting events of all types.
     */
    controller.get('/', (request, response) => {
        // Serve either an event stream or a log depending on requested content type
        if (request.accepts('text/event-stream')) {
            openEventStream(request, response);
        }
        else {
            sendEventLog(request, response);
        }
    });
    /**
     * Handle getting events of a specific type.
     */
    controller.get('/:eventName', (request, response) => {
        // Serve either an event stream or a log depending on requested content type
        if (request.accepts('text/event-stream')) {
            openEventStream(request, response);
        }
        else {
            sendEventLog(request, response);
        }
    });
    /**
     * Open a Server-Sent Events event stream to push events to the client.
     *
     * @param {express.Request} request
     * @param {express.Response} response
     * @return {Promise}
     */
    async function openEventStream(request, response) {
        const thingID = request.params.thingId;
        const eventName = request.params.eventName;
        let thing;
        // Don't allow event streams for events not associated with a Thing
        if (!thingID) {
            response.status(406).send();
            return;
        }
        // Check requested thing exists
        try {
            thing = await things_1.default.getThing(thingID);
        }
        catch (error) {
            console.error(`Thing not found ${error}`);
            response.status(404).send();
            return;
        }
        // Check that requested event type (if any) exists
        if (eventName && !thing.getEvents()[eventName]) {
            response.status(404).send();
            return;
        }
        // Keep the socket open
        request.socket.setKeepAlive(true);
        // Prevent Nagle's algorithm from trying to optimise throughput
        request.socket.setNoDelay(true);
        // Disable inactivity timeout on the socket
        request.socket.setTimeout(0);
        // Set event stream content type
        response.setHeader('Content-Type', 'text/event-stream');
        // Disable caching and compression
        response.setHeader('Cache-Control', 'no-cache,no-transform');
        // Tell client to keep the connection alive
        response.setHeader('Connection', 'keep-alive');
        // Set 200 OK response
        response.status(200);
        // Send headers to complete the connection, but don't end the response
        response.flushHeaders();
        /**
         * Handle an event emitted by a Thing
         *
         * @param {Event} event
         */
        function onEvent(event) {
            // If subscribed to a particular event, filter others out
            if (eventName && eventName != event.getName()) {
                return;
            }
            // Generate an ID for the event
            const eventId = Date.now();
            // Push event to client via event stream
            response.write(`id: ${eventId}\n`);
            response.write(`event: ${event.getName()}\n`);
            response.write(`data: ${JSON.stringify(event.getData())}\n\n`);
        }
        // Subscribe to events from the specified Thing
        thing.addEventSubscription(onEvent);
        // Unsubscribe from events if the connection is closed
        response.on('close', function () {
            thing.removeEventSubscription(onEvent);
        });
    }
    /**
     * Respond with a log of events.
     *
     * @param {express.Request} request
     * @param {express.Response} response
     */
    function sendEventLog(request, response) {
        const eventName = request.params.eventName;
        if (request.params.thingId) {
            response.status(200).json(events_1.default.getByThing(request.params.thingId, eventName));
        }
        else {
            response.status(200).json(events_1.default.getGatewayEvents(eventName));
        }
    }
    return controller;
}
exports.default = build;
//# sourceMappingURL=events_controller.js.map