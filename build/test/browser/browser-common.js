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
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.getBrowser = void 0;
const webdriverio_1 = require("webdriverio");
const selenium = __importStar(require("selenium-standalone"));
const common_1 = require("../common");
const seleniumOptions = {
    requestOpts: {
        timeout: 240 * 1000,
    },
    drivers: {
        chrome: {},
    },
    ignoreExtraDrivers: true,
};
const webdriverioOptions = {
    logLevel: 'warn',
    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts: true,
        acceptSslCerts: true,
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu', '--allow-insecure-localhost', '--disable-web-security'],
        },
    },
};
const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
let child = null;
let browser = null;
beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;
    // Starting up and interacting with a browser takes forever
    await new Promise((res, rej) => {
        selenium.install(seleniumOptions, (err) => {
            if (err) {
                rej(err);
            }
            else {
                res();
            }
        });
    });
    child = await new Promise((res, rej) => {
        selenium.start(seleniumOptions, (err, c) => {
            if (err) {
                rej(err);
            }
            else {
                res(c);
            }
        });
    });
    webdriverioOptions.baseUrl = `https://localhost:${common_1.server.address().port}`;
    browser = await (0, webdriverio_1.remote)(webdriverioOptions);
    await browser.setWindowSize(1280, 800);
});
afterAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    if (browser) {
        await browser.deleteSession();
    }
    if (child) {
        child.kill();
    }
});
function getBrowser() {
    return browser;
}
exports.getBrowser = getBrowser;
var common_2 = require("../common");
Object.defineProperty(exports, "server", { enumerable: true, get: function () { return common_2.server; } });
//# sourceMappingURL=browser-common.js.map