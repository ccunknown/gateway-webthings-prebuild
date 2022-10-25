"use strict";
/**
 * WebThings Gateway user profile migration.
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
process.env.ALLOW_CONFIG_MUTATIONS = 'true';
const config_1 = __importDefault(require("config"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const ncp_1 = require("ncp");
const rimraf_1 = __importStar(require("rimraf"));
const user_profile_1 = __importDefault(require("./user-profile"));
const db_1 = __importDefault(require("./db"));
const Settings = __importStar(require("./models/settings"));
const Users = __importStar(require("./models/users"));
/**
 * Manually copy, then unlink, to prevent issues with cross-device renames.
 */
function renameFile(src, dst) {
    fs_1.default.copyFileSync(src, dst);
    fs_1.default.unlinkSync(src);
}
/**
 * Manually copy, then remove, to prevent issues with cross-device renames.
 */
function renameDir(src, dst) {
    return new Promise((resolve, reject) => {
        (0, ncp_1.ncp)(src, dst, (e) => {
            if (e) {
                reject(e);
                return;
            }
            (0, rimraf_1.default)(src, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}
/**
 * Migrate from old locations to new ones
 * @return {Promise} resolved when migration is complete
 */
function migrate() {
    const pending = [];
    // Create all required profile directories.
    if (!fs_1.default.existsSync(user_profile_1.default.configDir)) {
        mkdirp_1.default.sync(user_profile_1.default.configDir);
    }
    if (!fs_1.default.existsSync(user_profile_1.default.dataDir)) {
        mkdirp_1.default.sync(user_profile_1.default.dataDir);
    }
    if (!fs_1.default.existsSync(user_profile_1.default.sslDir)) {
        mkdirp_1.default.sync(user_profile_1.default.sslDir);
    }
    if (!fs_1.default.existsSync(user_profile_1.default.uploadsDir)) {
        mkdirp_1.default.sync(user_profile_1.default.uploadsDir);
    }
    if (!fs_1.default.existsSync(user_profile_1.default.logDir)) {
        mkdirp_1.default.sync(user_profile_1.default.logDir);
    }
    if (!fs_1.default.existsSync(user_profile_1.default.addonsDir)) {
        mkdirp_1.default.sync(user_profile_1.default.addonsDir);
    }
    // Relocate the database, if necessary, before opening it.
    const dbPath = path_1.default.join(user_profile_1.default.configDir, 'db.sqlite3');
    const oldDbPath = path_1.default.join(user_profile_1.default.gatewayDir, 'db.sqlite3');
    if (fs_1.default.existsSync(oldDbPath)) {
        renameFile(oldDbPath, dbPath);
    }
    // Open the database.
    db_1.default.open();
    // Normalize user email addresses
    pending.push(Users.getUsers().then((users) => {
        users.forEach((user) => {
            // Call editUser with the same user, as it will normalize the email
            // for us and save it.
            Users.editUser(user);
        });
    }));
    // Move the tunneltoken into the database.
    const ttPath = path_1.default.join(user_profile_1.default.gatewayDir, 'tunneltoken');
    if (fs_1.default.existsSync(ttPath)) {
        const token = JSON.parse(fs_1.default.readFileSync(ttPath, 'utf8'));
        pending.push(Settings.setSetting('tunneltoken', token).then(() => {
            fs_1.default.unlinkSync(ttPath);
        }));
    }
    // Move the notunnel setting into the database.
    const ntPath = path_1.default.join(user_profile_1.default.gatewayDir, 'notunnel');
    if (fs_1.default.existsSync(ntPath)) {
        pending.push(Settings.setSetting('notunnel', true).then(() => {
            fs_1.default.unlinkSync(ntPath);
        }));
    }
    // Move the wifiskip setting into the database.
    const wsPath = path_1.default.join(user_profile_1.default.configDir, 'wifiskip');
    if (fs_1.default.existsSync(wsPath)) {
        pending.push(Settings.setSetting('wifiskip', true).then(() => {
            fs_1.default.unlinkSync(wsPath);
        }));
    }
    // Move certificates, if necessary.
    const pkPath1 = path_1.default.join(user_profile_1.default.gatewayDir, 'privatekey.pem');
    const pkPath2 = path_1.default.join(user_profile_1.default.gatewayDir, 'ssl', 'privatekey.pem');
    if (fs_1.default.existsSync(pkPath1)) {
        renameFile(pkPath1, path_1.default.join(user_profile_1.default.sslDir, 'privatekey.pem'));
    }
    else if (fs_1.default.existsSync(pkPath2)) {
        renameFile(pkPath2, path_1.default.join(user_profile_1.default.sslDir, 'privatekey.pem'));
    }
    const certPath1 = path_1.default.join(user_profile_1.default.gatewayDir, 'certificate.pem');
    const certPath2 = path_1.default.join(user_profile_1.default.gatewayDir, 'ssl', 'certificate.pem');
    if (fs_1.default.existsSync(certPath1)) {
        renameFile(certPath1, path_1.default.join(user_profile_1.default.sslDir, 'certificate.pem'));
    }
    else if (fs_1.default.existsSync(certPath2)) {
        renameFile(certPath2, path_1.default.join(user_profile_1.default.sslDir, 'certificate.pem'));
    }
    const chainPath1 = path_1.default.join(user_profile_1.default.gatewayDir, 'chain.pem');
    const chainPath2 = path_1.default.join(user_profile_1.default.gatewayDir, 'ssl', 'chain.pem');
    if (fs_1.default.existsSync(chainPath1)) {
        renameFile(chainPath1, path_1.default.join(user_profile_1.default.sslDir, 'chain.pem'));
    }
    else if (fs_1.default.existsSync(chainPath2)) {
        renameFile(chainPath2, path_1.default.join(user_profile_1.default.sslDir, 'chain.pem'));
    }
    const csrPath1 = path_1.default.join(user_profile_1.default.gatewayDir, 'csr.pem');
    const csrPath2 = path_1.default.join(user_profile_1.default.gatewayDir, 'ssl', 'csr.pem');
    if (fs_1.default.existsSync(csrPath1)) {
        renameFile(csrPath1, path_1.default.join(user_profile_1.default.sslDir, 'csr.pem'));
    }
    else if (fs_1.default.existsSync(csrPath2)) {
        renameFile(csrPath2, path_1.default.join(user_profile_1.default.sslDir, 'csr.pem'));
    }
    const oldSslDir = path_1.default.join(user_profile_1.default.gatewayDir, 'ssl');
    if (fs_1.default.existsSync(oldSslDir)) {
        (0, rimraf_1.sync)(oldSslDir);
    }
    // Move old uploads, if necessary.
    const oldUploadsDir = path_1.default.join(user_profile_1.default.gatewayDir, 'static', 'uploads');
    if (fs_1.default.existsSync(oldUploadsDir) && fs_1.default.lstatSync(oldUploadsDir).isDirectory()) {
        const fnames = fs_1.default.readdirSync(oldUploadsDir);
        for (const fname of fnames) {
            renameFile(path_1.default.join(oldUploadsDir, fname), path_1.default.join(user_profile_1.default.uploadsDir, fname));
        }
        fs_1.default.rmdirSync(oldUploadsDir);
    }
    // Create a user config if one doesn't exist.
    const oldUserConfigPath = path_1.default.join(user_profile_1.default.configDir, 'local.js');
    const oldLocalConfigPath = path_1.default.join(user_profile_1.default.gatewayDir, 'config', 'local.js');
    const userConfigPath = path_1.default.join(user_profile_1.default.configDir, 'local.json');
    if (!fs_1.default.existsSync(userConfigPath)) {
        if (fs_1.default.existsSync(oldUserConfigPath)) {
            const oldConfig = config_1.default.util.parseFile(oldUserConfigPath);
            fs_1.default.writeFileSync(userConfigPath, JSON.stringify(oldConfig, null, 2));
        }
        else {
            fs_1.default.writeFileSync(userConfigPath, '{\n}');
        }
    }
    if (fs_1.default.existsSync(oldUserConfigPath)) {
        fs_1.default.unlinkSync(oldUserConfigPath);
    }
    if (fs_1.default.existsSync(oldLocalConfigPath)) {
        fs_1.default.unlinkSync(oldLocalConfigPath);
    }
    // Handle any config migrations
    if (fs_1.default.existsSync(userConfigPath)) {
        const cfg = JSON.parse(fs_1.default.readFileSync(userConfigPath, 'utf8'));
        let changed = false;
        // addonManager.listUrl -> addonManager.listUrls
        if (cfg.hasOwnProperty('addonManager') && cfg.addonManager.hasOwnProperty('listUrl')) {
            if (cfg.addonManager.hasOwnProperty('listUrls')) {
                cfg.addonManager.listUrls.push(cfg.addonManager.listUrl);
                cfg.addonManager.listUrls = Array.from(new Set(cfg.addonManager.listUrls));
            }
            else {
                cfg.addonManager.listUrls = [cfg.addonManager.listUrl];
            }
            delete cfg.addonManager.listUrl;
            changed = true;
        }
        if (changed) {
            fs_1.default.writeFileSync(userConfigPath, JSON.stringify(cfg, null, 2));
        }
    }
    const localConfig = config_1.default.util.parseFile(userConfigPath);
    if (localConfig) {
        config_1.default.util.extendDeep(config_1.default, localConfig);
    }
    // Move add-ons.
    if (process.env.NODE_ENV !== 'test') {
        const oldAddonsDir = path_1.default.join(user_profile_1.default.gatewayDir, 'build', 'addons');
        if (fs_1.default.existsSync(oldAddonsDir) && fs_1.default.lstatSync(oldAddonsDir).isDirectory()) {
            const fnames = fs_1.default.readdirSync(oldAddonsDir);
            for (const fname of fnames) {
                const oldFname = path_1.default.join(oldAddonsDir, fname);
                const newFname = path_1.default.join(user_profile_1.default.addonsDir, fname);
                const lstat = fs_1.default.lstatSync(oldFname);
                if (fname !== 'plugin' && lstat.isDirectory()) {
                    // Move existing add-ons.
                    pending.push(renameDir(oldFname, newFname));
                }
            }
        }
    }
    return Promise.all(pending);
}
exports.default = migrate;
//# sourceMappingURL=migrate.js.map