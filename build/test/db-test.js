"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("../models/jsonwebtoken"));
describe('db', () => {
    describe('jwt workflows', () => {
        let user;
        const password = 'password';
        beforeEach(async () => {
            const email = `test-${(0, uuid_1.v4)()}@example.com`;
            user = await user_1.default.generate(email, password, 'test');
            user.setId(await db_1.default.createUser(user));
        });
        afterEach(async () => {
            await db_1.default.deleteUser(user.getId());
        });
        it('should be able to insert and fetch a JWT', async () => {
            const { token } = await jsonwebtoken_1.default.create(user.getId());
            await db_1.default.createJSONWebToken(token);
            const fromDb = await db_1.default.getJSONWebTokenByKeyId(token.keyId);
            expect(fromDb.publicKey).toEqual(token.publicKey);
            const count = await db_1.default.getUserCount();
            expect(count).toEqual(1);
        });
        it('should be unreachable after deleting user', async () => {
            const { token } = await jsonwebtoken_1.default.create(user.getId());
            await db_1.default.createJSONWebToken(token);
            const fromDb = await db_1.default.getJSONWebTokenByKeyId(token.keyId);
            expect(fromDb).toBeTruthy();
            await db_1.default.deleteUser(user.getId());
            const fromDbAfterDelete = await db_1.default.getJSONWebTokenByKeyId(token.keyId);
            expect(fromDbAfterDelete).toBeFalsy();
        });
        it('should be able to cleanup single keys', async () => {
            const { token } = await jsonwebtoken_1.default.create(user.getId());
            await db_1.default.createJSONWebToken(token);
            const fromDb = await db_1.default.getJSONWebTokenByKeyId(token.keyId);
            expect(fromDb).toEqual(expect.objectContaining({
                keyId: token.keyId,
            }));
            await db_1.default.deleteJSONWebTokenByKeyId(token.keyId);
            const fromDbAfterDelete = await db_1.default.getJSONWebTokenByKeyId(token.keyId);
            expect(fromDbAfterDelete).toBeFalsy();
        });
    });
});
//# sourceMappingURL=db-test.js.map