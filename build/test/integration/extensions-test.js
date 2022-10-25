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
describe('extensions/', () => {
    let jwt;
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    it('gets a list of all extensions', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.EXTENSIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(typeof res.body).toEqual('object');
        expect(Object.keys(res.body).length).toEqual(0);
    });
    it('fails to use an extension API without authentication', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.EXTENSIONS_PATH}/fake-extension/api/fake`)
            .set('Accept', 'application/json');
        expect(res.status).toEqual(401);
    });
    it('fails to use a nonexistent extension API', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.EXTENSIONS_PATH}/fake-extension/api/fake`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(404);
    });
    it('fails to get a nonexistent extension data file', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.EXTENSIONS_PATH}/fake-extension/js/something.js`);
        expect(res.status).toEqual(404);
    });
});
//# sourceMappingURL=extensions-test.js.map