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
const common_1 = require("../common");
const user_1 = require("../user");
const Constants = __importStar(require("../../constants"));
describe('adapters/', () => {
    let jwt;
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    it('gets all adapters', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ADAPTERS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0].id).toEqual((0, common_1.mockAdapter)().getId());
        expect(res.body[0]).toHaveProperty('ready');
        expect(res.body[0].ready).toEqual((0, common_1.mockAdapter)().isReady());
    });
    it('gets specifically mockAdapter', async () => {
        const mockAdapterId = (0, common_1.mockAdapter)().getId();
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ADAPTERS_PATH}/${mockAdapterId}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body.id).toEqual((0, common_1.mockAdapter)().getId());
        expect(res.body).toHaveProperty('ready');
        expect(res.body.ready).toEqual((0, common_1.mockAdapter)().isReady());
    });
    it('fails to get a nonexistent adapter', async () => {
        const mockAdapterId = 'nonexistent-adapter';
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ADAPTERS_PATH}/${mockAdapterId}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
});
//# sourceMappingURL=adapters-test.js.map