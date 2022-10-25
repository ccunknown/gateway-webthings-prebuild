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
exports.escapeHtmlForIdClass = exports.setProperty = exports.getProperty = exports.addThing = exports.getAddons = void 0;
const Constants = __importStar(require("../../constants"));
const common_1 = require("../common");
const browser_common_1 = require("./browser-common");
const user_1 = require("../user");
let jwt;
beforeEach(async () => {
    const browser = (0, browser_common_1.getBrowser)();
    jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    await browser.url('/');
    const email = await browser.$('#email');
    const password = await browser.$('#password');
    const loginButton = await browser.$('#login-button');
    await email.waitForExist({ timeout: 5000 });
    await email.setValue(user_1.TEST_USER.email);
    await password.setValue(user_1.TEST_USER.password);
    await loginButton.click();
});
async function getAddons() {
    const res = await common_1.chai
        .request(common_1.server)
        .keepOpen()
        .get(`${Constants.ADDONS_PATH}`)
        .set('Accept', 'application/json')
        .set(...(0, user_1.headerAuth)(jwt));
    const installedAddons = new Map();
    // Store a map of name->version.
    for (const s of res.body) {
        installedAddons.set(s.id, s);
    }
    return installedAddons;
}
exports.getAddons = getAddons;
async function addThing(desc) {
    const { id } = desc;
    if (desc.hasOwnProperty('@type') &&
        desc['@type'].length > 0 &&
        !desc.hasOwnProperty('selectedCapability')) {
        desc.selectedCapability = desc['@type'][0];
    }
    await common_1.chai
        .request(common_1.server)
        .keepOpen()
        .post(Constants.THINGS_PATH)
        .set('Accept', 'application/json')
        .set(...(0, user_1.headerAuth)(jwt))
        .send(desc);
    await (0, common_1.mockAdapter)().addDevice(id, desc);
}
exports.addThing = addThing;
async function getProperty(id, property) {
    const res = await common_1.chai
        .request(common_1.server)
        .keepOpen()
        .get(`${Constants.THINGS_PATH}/${id}/properties/${property}`)
        .set('Accept', 'application/json')
        .set(...(0, user_1.headerAuth)(jwt));
    return res.body;
}
exports.getProperty = getProperty;
async function setProperty(id, property, value) {
    await common_1.chai
        .request(common_1.server)
        .keepOpen()
        .put(`${Constants.THINGS_PATH}/${id}/properties/${property}`)
        .type('json')
        .set(...(0, user_1.headerAuth)(jwt))
        .send(JSON.stringify(value));
}
exports.setProperty = setProperty;
function escapeHtmlForIdClass(text) {
    if (typeof text !== 'string') {
        text = `${text}`;
    }
    text = text.replace(/[^_a-zA-Z0-9-]/g, '_');
    if (/^[0-9-]/.test(text)) {
        text = `_${text}`;
    }
    return text;
}
exports.escapeHtmlForIdClass = escapeHtmlForIdClass;
//# sourceMappingURL=test-utils.js.map