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
const user_1 = require("../user");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jszip_1 = __importDefault(require("jszip"));
const Constants = __importStar(require("../../constants"));
const user_profile_1 = __importDefault(require("../../user-profile"));
describe('internal-logs/', () => {
    let jwt;
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
        fs_1.default.writeFileSync(path_1.default.join(user_profile_1.default.logDir, 'test.log'), 'hello, world!');
        // clean up folder from previous logs
        const regex = /^run-app\.log\./;
        fs_1.default.readdirSync(user_profile_1.default.logDir)
            .filter((f) => regex.test(f))
            .map((f) => fs_1.default.unlinkSync(path_1.default.join(user_profile_1.default.logDir, f)));
    });
    it('GET internal-logs index', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.INTERNAL_LOGS_PATH)
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.type).toBe('text/html');
        expect(res.text.indexOf('test.log')).toBeGreaterThan(0);
    });
    it('GET test.log', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.INTERNAL_LOGS_PATH}/files/test.log`)
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.type).toBe('text/plain');
        expect(res.text).toBe('hello, world!');
    });
    it('GET logs.zip', async () => {
        let responseData;
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.INTERNAL_LOGS_PATH}/zip`)
            .set(...(0, user_1.headerAuth)(jwt))
            .buffer()
            .parse((res, cb) => {
            res.setEncoding('binary');
            responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                jszip_1.default.loadAsync(responseData, { base64: false, checkCRC32: true }).then((zip) => cb(null, zip));
            });
        });
        expect(res.status).toEqual(200);
        expect(res.type).toBe('application/zip');
        expect(Object.keys(res.body.files).length).toEqual(1);
        const file = res.body.file('logs/test.log');
        expect(file).toBeTruthy();
        const data = await file.async('text');
        expect(data).toBe('hello, world!');
    });
});
//# sourceMappingURL=internal-logs-test.js.map