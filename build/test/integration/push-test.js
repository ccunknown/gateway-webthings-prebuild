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
const push_service_1 = __importDefault(require("../../push-service"));
const user_1 = require("../user");
const Constants = __importStar(require("../../constants"));
describe('push/', () => {
    let jwt;
    beforeEach(async () => {
        // Clear settings storage
        await db_1.default.deleteEverything();
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    it('Fail to get a vapid key with PushService not initialized', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.PUSH_PATH}/vapid-public-key`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(500);
    });
    it('Get a vapid key with PushService initialized', async () => {
        await push_service_1.default.init('https://hogehoge.com');
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.PUSH_PATH}/vapid-public-key`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            publicKey: expect.any(String),
        });
    });
    it('Subscribe message', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .post(`${Constants.PUSH_PATH}/register`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ hoge: 'hoge' });
        expect(res.status).toEqual(200);
    });
});
//# sourceMappingURL=push-test.js.map