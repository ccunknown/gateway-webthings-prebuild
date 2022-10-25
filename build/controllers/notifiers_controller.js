"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gateway_addon_1 = require("gateway-addon");
const addon_manager_1 = __importDefault(require("../addon-manager"));
function build() {
    const controller = express_1.default.Router();
    /**
     * Helper function to cut down on unnecessary API round trips
     * @param {Notifier} notifier
     * @return {Object}
     */
    function notifierAsDictWithOutlets(notifier) {
        const notifierDict = Object.assign(notifier.asDict(), { outlets: [] });
        const outlets = notifier.getOutlets();
        notifierDict.outlets = Array.from(Object.values(outlets)).map((outlet) => {
            return outlet.asDict();
        });
        return notifierDict;
    }
    controller.get('/', async (_request, response) => {
        const notifiers = addon_manager_1.default.getNotifiers();
        const notifierList = Array.from(notifiers.values()).map(notifierAsDictWithOutlets);
        response.status(200).json(notifierList);
    });
    controller.get('/:notifierId', async (request, response) => {
        const notifierId = request.params.notifierId;
        const notifier = addon_manager_1.default.getNotifier(notifierId);
        if (notifier) {
            response.status(200).send(notifierAsDictWithOutlets(notifier));
        }
        else {
            response.status(404).send(`Notifier "${notifierId}" not found.`);
        }
    });
    controller.get('/:notifierId/outlets', async (request, response) => {
        const notifierId = request.params.notifierId;
        const notifier = addon_manager_1.default.getNotifier(notifierId);
        if (!notifier) {
            response.status(404).send(`Notifier "${notifierId}" not found.`);
            return;
        }
        const outlets = notifier.getOutlets();
        const outletList = Array.from(Object.values(outlets)).map((outlet) => {
            return outlet.asDict();
        });
        response.status(200).json(outletList);
    });
    /**
     * Create a new notification with the title, message, and level contained in
     * the request body
     */
    controller.post(`/:notifierId/outlets/:outletId/notification`, async (request, response) => {
        const notifierId = request.params.notifierId;
        const outletId = request.params.outletId;
        const notifier = addon_manager_1.default.getNotifier(notifierId);
        if (!notifier) {
            response.status(404).send(`Notifier "${notifierId}" not found.`);
            return;
        }
        const outlet = notifier.getOutlet(outletId);
        if (!outlet) {
            response.status(404).send(`Outlet "${outletId}" of notifier "${notifierId}" not found.`);
            return;
        }
        const { title, message, level } = request.body;
        if (typeof title !== 'string' || typeof message !== 'string') {
            response.status(400).send(`Title and message must be strings`);
            return;
        }
        const levels = Object.values(gateway_addon_1.Constants.NotificationLevel);
        if (!levels.includes(level)) {
            response.status(400).send(`Level must be one of ${JSON.stringify(levels)}`);
            return;
        }
        try {
            await outlet.notify(title, message, level);
            response.status(201);
        }
        catch (e) {
            response.status(500).send(e);
        }
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=notifiers_controller.js.map