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
const config_1 = __importDefault(require("config"));
const nock_1 = __importDefault(require("nock"));
const url_1 = require("url");
const common_1 = require("../common");
const Constants = __importStar(require("../../constants"));
const user_1 = require("../user");
const releases = [
    {
        prerelease: false,
        draft: true,
        tag_name: '0.1.2',
    },
    {
        prerelease: true,
        draft: false,
        tag_name: '0.1.1',
    },
    {
        prerelease: false,
        draft: false,
        tag_name: '0.1.0',
    },
    {
        prerelease: false,
        draft: false,
        tag_name: '0.0.19',
    },
];
const updateUrl = new url_1.URL(config_1.default.get('updates.url'));
describe('updates/', () => {
    let jwt;
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    it('should get /latest with a normal response', async () => {
        (0, nock_1.default)(updateUrl.origin).get(updateUrl.pathname).reply(200, releases);
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.UPDATES_PATH}/latest`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        console.log(res.body);
        expect(res.body.version).toEqual('0.1.0');
    });
    it('should get /latest with no good releases', async () => {
        (0, nock_1.default)(updateUrl.origin).get(updateUrl.pathname).reply(200, releases.slice(0, 2));
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.UPDATES_PATH}/latest`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body.version).toBeFalsy();
    });
    it('should get /latest with a strange error', async () => {
        (0, nock_1.default)(updateUrl.origin).get(updateUrl.pathname).reply(200, { error: true });
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.UPDATES_PATH}/latest`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body.version).toBeFalsy();
    });
    it('GET /status', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.UPDATES_PATH}/status`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('success');
        expect(res.body).toHaveProperty('version');
    });
});
//# sourceMappingURL=updates-test.js.map