"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const user_1 = require("../user");
const speakeasy_1 = __importDefault(require("speakeasy"));
it('creates a user and get email', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    expect(info.email).toBe(user_1.TEST_USER.email);
});
it('ensures user login is case insensitive', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const userCopy = Object.assign({}, user_1.TEST_USER);
    userCopy.email = userCopy.email.toUpperCase();
    const loginJWT = await (0, user_1.loginUser)(common_1.server, userCopy);
    expect(loginJWT).toBeTruthy();
});
it('gets user count', async () => {
    const count1 = await (0, user_1.userCount)(common_1.server);
    expect(count1.count).toBe(0);
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const count2 = await (0, user_1.userCount)(common_1.server);
    expect(count2.count).toBe(1);
});
it('gets invalid user info', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    try {
        await (0, user_1.userInfoById)(common_1.server, jwt, 1000);
    }
    catch (err) {
        expect(err.status).toBe(404);
    }
});
it('gets user info by id', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const info1 = (await (0, user_1.userInfo)(common_1.server, jwt));
    const info2 = await (0, user_1.userInfoById)(common_1.server, jwt, info1.id);
    expect(info2.id).toBe(info1.id);
    expect(info2.email).toBe(info1.email);
    expect(info2.name).toBe(info1.name);
});
it('fails to create a user when missing data', async () => {
    try {
        await (0, user_1.createUser)(common_1.server, { email: 'fake@test.com' });
    }
    catch (err) {
        expect(err.status).toEqual(400);
    }
});
it('fails to create another user when not logged in', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    try {
        await (0, user_1.createUser)(common_1.server, user_1.TEST_USER_DIFFERENT);
    }
    catch (diff) {
        expect(diff.status).toEqual(401);
    }
});
it('fails to create a duplicate user', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    try {
        await (0, user_1.addUser)(common_1.server, jwt, user_1.TEST_USER);
    }
    catch (again) {
        expect(again.status).toEqual(400);
    }
});
it('creates a second user', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    await (0, user_1.addUser)(common_1.server, jwt, user_1.TEST_USER_DIFFERENT);
});
it('logs in as a user', async () => {
    // Create the user but do not use the returning JWT.
    const createJWT = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const loginJWT = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, loginJWT));
    expect(info.email).toBe(user_1.TEST_USER.email);
    // logout
    await (0, user_1.logoutUser)(common_1.server, loginJWT);
    // try to use an old, revoked jwt again.
    try {
        await (0, user_1.userInfo)(common_1.server, loginJWT);
    }
    catch (stale) {
        expect(stale.status).toEqual(401);
    }
    // try to use a non-revoked jwt again.
    const altInfo = (await (0, user_1.userInfo)(common_1.server, createJWT));
    expect(altInfo.email).toBe(user_1.TEST_USER.email);
});
it('edits an invalid user', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    try {
        await (0, user_1.editUser)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER_UPDATE_1, { id: 0 }));
    }
    catch (rsp) {
        expect(rsp.status).toEqual(404);
    }
});
it('fails to edit a user when missing data', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    try {
        await (0, user_1.editUser)(common_1.server, jwt, { id: info.id });
    }
    catch (err) {
        expect(err.status).toEqual(400);
    }
});
it('fails to edit user with incorrect password', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    try {
        await (0, user_1.editUser)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER_UPDATE_1, { id: info.id, password: 'wrong' }));
    }
    catch (err) {
        expect(err.status).toEqual(400);
    }
});
it('edits a user', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    let info = (await (0, user_1.userInfo)(common_1.server, jwt));
    await (0, user_1.editUser)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER_UPDATE_1, { id: info.id }));
    info = (await (0, user_1.userInfo)(common_1.server, jwt));
    expect(info.name).toBe(user_1.TEST_USER_UPDATE_1.name);
    expect(info.email).toBe(user_1.TEST_USER_UPDATE_1.email);
    // Log out and log back in to verify.
    await (0, user_1.logoutUser)(common_1.server, jwt);
    await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER_UPDATE_1);
});
it('edits a user, including password', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    let info = (await (0, user_1.userInfo)(common_1.server, jwt));
    await (0, user_1.editUser)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER_UPDATE_2, { id: info.id }));
    info = (await (0, user_1.userInfo)(common_1.server, jwt));
    expect(info.name).toBe(user_1.TEST_USER_UPDATE_2.name);
    expect(info.email).toBe(user_1.TEST_USER_UPDATE_2.email);
    // Log out and log back in to verify.
    await (0, user_1.logoutUser)(common_1.server, jwt);
    await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER_UPDATE_2, { password: user_1.TEST_USER_UPDATE_2.newPassword }));
});
it('deletes a user', async () => {
    const jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    await (0, user_1.deleteUser)(common_1.server, jwt, info.id);
    try {
        await (0, user_1.userInfo)(common_1.server, jwt);
    }
    catch (rsp1) {
        expect(rsp1.status).toBe(401);
    }
    try {
        await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    }
    catch (rsp2) {
        expect(rsp2.status).toBe(401);
    }
});
it('fails to log in with missing data', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    try {
        await (0, user_1.loginUser)(common_1.server, { email: user_1.TEST_USER.email });
    }
    catch (err) {
        expect(err.status).toBe(400);
    }
});
it('fails to log in with incorrect password', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    try {
        await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { password: 'wrong' }));
    }
    catch (err) {
        expect(err.status).toBe(401);
    }
});
it('fails to enable MFA with wrong token', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    try {
        await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }), '000000');
    }
    catch (err) {
        expect(err.status).toBe(401);
    }
});
it('fails to log in with missing MFA token', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    try {
        await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    }
    catch (err) {
        expect(err.status).toBe(401);
        expect(err.body.mfaRequired).toBe(true);
    }
});
it('fails to log in with incorrect MFA token', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    try {
        await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp: '000000' } }));
    }
    catch (err) {
        expect(err.status).toBe(401);
        expect(err.body.mfaRequired).toBe(true);
    }
});
it('logs in successfully with MFA token', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    const params = await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    const totp = speakeasy_1.default.totp({
        secret: params.secret,
        encoding: 'base32',
    });
    await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp } }));
});
it('fails to log in with incorrect MFA backup code', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    try {
        const totp = '0123456789';
        await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp } }));
    }
    catch (err) {
        expect(err.status).toBe(401);
        expect(err.body.mfaRequired).toBe(true);
    }
});
it('logs in successfully with MFA backup code', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    const jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    const params = await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp: params.backupCodes[0] } }));
});
it('fails to log in twice with same MFA backup code', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    let jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    const params = await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    jwt = await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp: params.backupCodes[0] } }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    try {
        await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp: params.backupCodes[0] } }));
    }
    catch (err) {
        expect(err.status).toBe(401);
        expect(err.body.mfaRequired).toBe(true);
    }
});
it('enables and disables MFA, then logs in', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    let jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    const params = await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    const totp = speakeasy_1.default.totp({
        secret: params.secret,
        encoding: 'base32',
    });
    jwt = await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp } }));
    await (0, user_1.disableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
});
it('enables, disables, and re-enables MFA, but gets new secret', async () => {
    await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    let jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const info = (await (0, user_1.userInfo)(common_1.server, jwt));
    const params1 = await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    let totp = speakeasy_1.default.totp({
        secret: params1.secret,
        encoding: 'base32',
    });
    jwt = await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp } }));
    await (0, user_1.disableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    await (0, user_1.logoutUser)(common_1.server, jwt);
    jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    const params2 = await (0, user_1.enableMfa)(common_1.server, jwt, Object.assign({}, user_1.TEST_USER, { id: info.id }));
    expect(params2.secret).not.toBe(params1.secret);
    await (0, user_1.logoutUser)(common_1.server, jwt);
    totp = speakeasy_1.default.totp({
        secret: params2.secret,
        encoding: 'base32',
    });
    await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { mfa: { totp } }));
});
it('resets rate limit after successful login', async () => {
    let jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    await (0, user_1.logoutUser)(common_1.server, jwt);
    for (let i = 0; i < 9; ++i) {
        try {
            await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { password: 'wrong' }));
        }
        catch (err) {
            expect(err.status).toBe(401);
        }
    }
    jwt = await (0, user_1.loginUser)(common_1.server, user_1.TEST_USER);
    await (0, user_1.logoutUser)(common_1.server, jwt);
    for (let i = 0; i < 10; ++i) {
        try {
            await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { password: 'wrong' }));
        }
        catch (err) {
            expect(err.status).toBe(401);
        }
    }
    try {
        await (0, user_1.loginUser)(common_1.server, Object.assign({}, user_1.TEST_USER, { password: 'wrong' }));
    }
    catch (err) {
        // rate limit hit
        expect(err.status).toBe(429);
    }
});
//# sourceMappingURL=users-test.js.map