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
const jsonwebtoken_1 = __importDefault(require("../../models/jsonwebtoken"));
const uuid_1 = require("uuid");
const jsonwebtoken_2 = __importDefault(require("jsonwebtoken"));
const ec = __importStar(require("../../ec-crypto"));
describe('JSONWebToken', () => {
    it('should be able to round trip', async () => {
        const userId = 1;
        const { sig, token } = await jsonwebtoken_1.default.create(userId);
        const subject = new jsonwebtoken_1.default(token);
        const { sig: sig2 } = await jsonwebtoken_1.default.create(userId);
        expect(subject.verify(sig)).toBeTruthy();
        expect(subject.verify(sig2)).toEqual(null);
    });
    it('should fail to verify with a missing key id', async () => {
        const pair = ec.generateKeyPair();
        const sig = jsonwebtoken_2.default.sign({}, pair.private, {
            algorithm: ec.JWT_ALGORITHM,
        });
        expect(await jsonwebtoken_1.default.verifyJWT(sig)).toEqual(null);
    });
    it('should fail to verify with an incorrect key id', async () => {
        const pair = ec.generateKeyPair();
        const sig = jsonwebtoken_2.default.sign({}, pair.private, {
            algorithm: ec.JWT_ALGORITHM,
            keyid: 'tomato',
        });
        expect(await jsonwebtoken_1.default.verifyJWT(sig)).toEqual(null);
    });
    it('should fail to verify a JWT with the "none" alg', async () => {
        const pair = ec.generateKeyPair();
        const sig = jsonwebtoken_2.default.sign({}, pair.private, {
            algorithm: 'none',
            keyid: (0, uuid_1.v4)(),
        });
        expect(await jsonwebtoken_1.default.verifyJWT(sig)).toEqual(null);
    });
});
//# sourceMappingURL=jsonwebtoken-test.js.map