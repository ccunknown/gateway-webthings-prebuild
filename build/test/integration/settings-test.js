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
const common_1 = require("../common");
const db_1 = __importDefault(require("../../db"));
const Platform = __importStar(require("../../platform"));
const user_1 = require("../user");
const Constants = __importStar(require("../../constants"));
describe('settings/', () => {
    let jwt;
    beforeEach(async () => {
        // Clear settings storage
        await db_1.default.deleteEverything();
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    it('Fail to get a setting that hasnt been set', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.SETTINGS_PATH}/experiments/foo`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
    it('Fail to set a setting when missing data', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.SETTINGS_PATH}/experiments/bar`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send();
        expect(err.status).toEqual(400);
    });
    it('Set a setting', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.SETTINGS_PATH}/experiments/bar`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ enabled: true });
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('enabled');
        expect(res.body.enabled).toEqual(true);
    });
    it('Get a setting', async () => {
        const putRes = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.SETTINGS_PATH}/experiments/bar`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ enabled: true });
        expect(putRes.status).toEqual(200);
        expect(putRes.body).toHaveProperty('enabled');
        expect(putRes.body.enabled).toEqual(true);
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.SETTINGS_PATH}/experiments/bar`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('enabled');
        expect(res.body.enabled).toEqual(true);
    });
    it('Get platform info', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.SETTINGS_PATH}/system/platform`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('architecture');
        expect(res.body).toHaveProperty('os');
        expect(res.body.architecture).toEqual(Platform.getArchitecture());
        expect(res.body.os).toEqual(Platform.getOS());
    });
    it('Get SSH status', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.SETTINGS_PATH}/system/ssh`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('enabled');
        expect(res.body.enabled).toEqual(false);
    });
    it('Toggle SSH', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.SETTINGS_PATH}/system/ssh`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ enabled: true });
        expect(err.status).toEqual(500);
    });
    it('Restart gateway', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .post(`${Constants.SETTINGS_PATH}/system/actions`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ action: 'restartGateway' });
        expect(err.status).toEqual(500);
    });
    it('Restart system', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .post(`${Constants.SETTINGS_PATH}/system/actions`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ action: 'restartSystem' });
        expect(err.status).toEqual(500);
    });
    it('Unknown platform action', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .post(`${Constants.SETTINGS_PATH}/system/actions`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ action: 'thisIsFake' });
        expect(err.status).toEqual(400);
    });
});
//# sourceMappingURL=settings-test.js.map