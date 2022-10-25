"use strict";
/**
 * Uploads Controller.
 *
 * Manages file uploads.
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Constants = __importStar(require("../constants"));
const user_profile_1 = __importDefault(require("../user-profile"));
const UPLOADS_PATH = user_profile_1.default.uploadsDir;
const FLOORPLAN_PATH = path_1.default.join(UPLOADS_PATH, 'floorplan.svg');
const FALLBACK_FLOORPLAN_PATH = path_1.default.join(Constants.STATIC_PATH, 'images', 'floorplan.svg');
// On startup, copy the default floorplan, if necessary.
if (!fs_1.default.existsSync(FLOORPLAN_PATH)) {
    try {
        fs_1.default.copyFileSync(FALLBACK_FLOORPLAN_PATH, FLOORPLAN_PATH);
    }
    catch (err) {
        console.error(`Failed to copy floorplan: ${err}`);
    }
}
function build() {
    const controller = express_1.default.Router();
    /**
     * Upload a file.
     */
    controller.post('/', (req, response) => {
        const request = req;
        if (!request.files || !request.files.file) {
            response.status(500).send('No file provided for upload');
            return;
        }
        try {
            if (fs_1.default.existsSync(FLOORPLAN_PATH)) {
                fs_1.default.unlinkSync(FLOORPLAN_PATH);
            }
        }
        catch (err) {
            response.status(500).send(`Failed to unlink old floorplan: ${err}`);
            return;
        }
        const file = request.files.file;
        file.mv(FLOORPLAN_PATH, (error) => {
            if (error) {
                // On error, try to copy the fallback.
                try {
                    fs_1.default.copyFileSync(FALLBACK_FLOORPLAN_PATH, FLOORPLAN_PATH);
                }
                catch (err) {
                    console.error(`Failed to copy floorplan: ${err}`);
                }
                response.status(500).send(`Failed to save uploaded file: ${error}`);
                return;
            }
            response.status(201).send('Successfully uploaded file');
        });
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=uploads_controller.js.map