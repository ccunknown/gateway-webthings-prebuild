"use strict";
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Settings = __importStar(require("../models/settings"));
const user_profile_1 = __importDefault(require("../user-profile"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
function build() {
    const controller = express_1.default.Router();
    controller.get('/', async (_request, response) => {
        response.status(200).json(Array.from(addon_manager_1.default.getInstalledAddons().values()));
    });
    controller.get('/:addonId/license', async (request, response) => {
        const addonId = request.params.addonId;
        const addonDir = path_1.default.join(user_profile_1.default.addonsDir, addonId);
        fs_1.default.readdir(addonDir, (err, files) => {
            if (err) {
                response.status(404).send(err);
                return;
            }
            const licenses = files.filter((f) => {
                return /^LICENSE(\..*)?$/.test(f) && fs_1.default.lstatSync(path_1.default.join(addonDir, f)).isFile();
            });
            if (licenses.length === 0) {
                response.status(404).send('License not found');
                return;
            }
            fs_1.default.readFile(path_1.default.join(addonDir, licenses[0]), { encoding: 'utf8' }, (err, data) => {
                if (err) {
                    response.status(404).send(err);
                    return;
                }
                response.status(200).type('text/plain').send(data);
            });
        });
    });
    controller.put('/:addonId', async (request, response) => {
        const addonId = request.params.addonId;
        if (!request.body || !request.body.hasOwnProperty('enabled')) {
            response.status(400).send('Enabled property not defined');
            return;
        }
        const enabled = request.body.enabled;
        try {
            if (enabled) {
                await addon_manager_1.default.enableAddon(addonId);
            }
            else {
                await addon_manager_1.default.disableAddon(addonId, true);
            }
            response.status(200).json({ enabled });
        }
        catch (e) {
            console.error(`Failed to toggle add-on ${addonId}`);
            console.error(e);
            response.status(400).send(e);
        }
    });
    controller.get('/:addonId/config', async (request, response) => {
        const addonId = request.params.addonId;
        const key = `addons.config.${addonId}`;
        try {
            const config = await Settings.getSetting(key);
            response.status(200).json(config || {});
        }
        catch (e) {
            console.error(`Failed to get config for add-on ${addonId}`);
            console.error(e);
            response.status(400).send(e);
        }
    });
    controller.put('/:addonId/config', async (request, response) => {
        const addonId = request.params.addonId;
        if (!request.body || !request.body.hasOwnProperty('config')) {
            response.status(400).send('Config property not defined');
            return;
        }
        const config = request.body.config;
        const key = `addons.config.${addonId}`;
        try {
            await Settings.setSetting(key, config);
        }
        catch (e) {
            console.error(`Failed to set config for add-on ${addonId}`);
            console.error(e);
            response.status(400).send(e);
            return;
        }
        try {
            await addon_manager_1.default.unloadAddon(addonId, true);
            if (await addon_manager_1.default.addonEnabled(addonId)) {
                await addon_manager_1.default.loadAddon(addonId);
            }
            response.status(200).json({ config });
        }
        catch (e) {
            console.error(`Failed to restart add-on ${addonId}`);
            console.error(e);
            response.status(400).send(e);
        }
    });
    controller.post('/', async (request, response) => {
        if (!request.body ||
            !request.body.hasOwnProperty('id') ||
            !request.body.hasOwnProperty('url') ||
            !request.body.hasOwnProperty('checksum')) {
            response.status(400).send('Missing required parameter(s).');
            return;
        }
        const id = request.body.id;
        const url = request.body.url;
        const checksum = request.body.checksum;
        try {
            await addon_manager_1.default.installAddonFromUrl(id, url, checksum, true);
            const key = `addons.${id}`;
            const obj = await Settings.getSetting(key);
            response.status(200).json(obj);
        }
        catch (e) {
            response.status(400).send(e);
        }
    });
    controller.patch('/:addonId', async (request, response) => {
        const id = request.params.addonId;
        if (!request.body ||
            !request.body.hasOwnProperty('url') ||
            !request.body.hasOwnProperty('checksum')) {
            response.status(400).send('Missing required parameter(s).');
            return;
        }
        const url = request.body.url;
        const checksum = request.body.checksum;
        try {
            await addon_manager_1.default.installAddonFromUrl(id, url, checksum, false);
            const key = `addons.${id}`;
            const obj = await Settings.getSetting(key);
            response.status(200).json(obj);
        }
        catch (e) {
            console.error(`Failed to update add-on: ${id}\n${e}`);
            response.status(400).send(e);
        }
    });
    controller.delete('/:addonId', async (request, response) => {
        const addonId = request.params.addonId;
        try {
            await addon_manager_1.default.uninstallAddon(addonId, false, true);
            response.sendStatus(204);
        }
        catch (e) {
            console.error(`Failed to uninstall add-on: ${addonId}\n${e}`);
            response.status(400).send(e);
        }
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=addons_controller.js.map