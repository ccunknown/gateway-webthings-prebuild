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
const Passwords = __importStar(require("../passwords"));
describe('Passwords', () => {
    let originalTimeout;
    beforeEach(() => {
        // Increase timeout because bcrypt is slow
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    });
    it('should be able to generate and compare hashes', async () => {
        const pass = 'apple';
        const passFake = 'orange';
        const passHash = await Passwords.hash(pass);
        const passHashSync = Passwords.hashSync(pass);
        const passFakeHashSync = Passwords.hashSync(passFake);
        expect(Passwords.compareSync(pass, passHash)).toBeTruthy();
        const compareAsync = await Passwords.compare(pass, passHash);
        expect(compareAsync).toBeTruthy();
        expect(Passwords.compareSync(pass, passHashSync)).toBeTruthy();
        expect(Passwords.compareSync(passFake, passHash)).toBeFalsy();
        expect(Passwords.compareSync(pass, passFakeHashSync)).toBeFalsy();
    });
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});
//# sourceMappingURL=passwords-test.js.map