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
const child_process_1 = __importDefault(require("child_process"));
const config_1 = __importDefault(require("config"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const semver_1 = __importDefault(require("semver"));
const Platform = __importStar(require("../platform"));
const Utils = __importStar(require("../utils"));
const package_json_1 = __importDefault(require("../package.json"));
function build() {
    const controller = express_1.default.Router();
    function readVersion(packagePath) {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(packagePath, { encoding: 'utf8' }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const pkgJson = JSON.parse(data);
                    if (!semver_1.default.valid(pkgJson.version)) {
                        reject(new Error(`Invalid gateway semver: ${pkgJson.version}`));
                        return;
                    }
                    resolve(pkgJson.version);
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
    function stat(path) {
        return new Promise((resolve, reject) => {
            fs_1.default.stat(path, (err, stats) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        resolve(null);
                    }
                    else {
                        reject(err);
                    }
                }
                else {
                    resolve(stats);
                }
            });
        });
    }
    const cacheLatest = {
        tag: null,
        time: 0,
        value: { version: null },
    };
    const cacheDuration = 60 * 1000;
    function cacheLatestInsert(response, value) {
        cacheLatest.tag = response.get('etag') || null;
        cacheLatest.time = Date.now();
        cacheLatest.value = value;
    }
    /**
     * Send the client an object describing the latest release
     */
    controller.get('/latest', async (request, response) => {
        const etag = request.get('If-None-Match');
        if (etag) {
            if (cacheLatest.tag === etag && Date.now() - cacheLatest.time < cacheDuration) {
                response.sendStatus(304);
                return;
            }
        }
        const res = await (0, node_fetch_1.default)(config_1.default.get('updates.url'), {
            headers: { 'User-Agent': Utils.getGatewayUserAgent() },
        });
        const releases = await res.json();
        if (!releases || !releases.filter) {
            console.warn('API returned invalid releases, rate limit likely exceeded');
            const value = { version: null };
            response.send(value);
            cacheLatestInsert(response, value);
            return;
        }
        const latestRelease = releases.filter((release) => {
            if (release.prerelease && !config_1.default.get('updates.allowPrerelease')) {
                return false;
            }
            if (release.draft) {
                return false;
            }
            return true;
        })[0];
        if (!latestRelease) {
            console.warn('No releases found');
            const value = { version: null };
            response.send(value);
            cacheLatestInsert(response, value);
            return;
        }
        const releaseVer = latestRelease.tag_name;
        const value = { version: releaseVer };
        response.send(value);
        cacheLatestInsert(response, value);
    });
    /**
     * Send an object describing the update status of the gateway
     */
    controller.get('/status', async (_request, response) => {
        // gateway, gateway_failed, gateway_old
        // oldVersion -> gateway_old's package.json version
        // if (gateway_failed.version > thisversion) {
        //  update failed, last attempt was ctime of gateway_failed
        // }
        const currentVersion = package_json_1.default.version;
        const oldStats = await stat('../gateway_old/package.json');
        let oldVersion = null;
        if (oldStats) {
            try {
                oldVersion = await readVersion('../gateway_old/package.json');
            }
            catch (e) {
                console.error('Failed to read ../gateway_old/package.json:', e);
            }
        }
        const failedStats = await stat('../gateway_failed/package.json');
        let failedVersion = null;
        if (failedStats) {
            try {
                failedVersion = await readVersion('../gateway_failed/package.json');
            }
            catch (e) {
                console.error('Failed to read ../gateway_failed/package.json:', e);
            }
        }
        if (failedVersion && semver_1.default.gt(failedVersion, currentVersion)) {
            response.send({
                success: false,
                version: currentVersion,
                failedVersion,
                timestamp: failedStats.ctime,
            });
        }
        else {
            let timestamp = null;
            if (oldStats) {
                timestamp = oldStats.ctime;
            }
            response.send({
                success: true,
                version: currentVersion,
                oldVersion,
                timestamp,
            });
        }
    });
    controller.post('/update', async (_request, response) => {
        child_process_1.default.exec('sudo systemctl start webthings-gateway.check-for-update.service');
        response.json({});
    });
    controller.get('/self-update', async (_request, response) => {
        if (!Platform.implemented('getSelfUpdateStatus')) {
            response.json({
                available: false,
                enabled: false,
            });
        }
        else {
            response.json(Platform.getSelfUpdateStatus());
        }
    });
    controller.put('/self-update', async (request, response) => {
        if (!request.body || !request.body.hasOwnProperty('enabled')) {
            response.status(400).send('Enabled property not defined');
            return;
        }
        if (!Platform.implemented('setSelfUpdateStatus')) {
            response.status(500).send('Cannot toggle auto updates');
            return;
        }
        if (Platform.setSelfUpdateStatus(request.body.enabled)) {
            response.status(200).json({ enabled: request.body.enabled });
        }
        else {
            response.status(500).send('Failed to toggle auto updates');
        }
    });
    return controller;
}
exports.default = build;
//# sourceMappingURL=updates_controller.js.map