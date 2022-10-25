"use strict";
/**
 * This module contains test helpers for interacting with users and credentials.
 */
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
exports.headerAuth = exports.logoutUser = exports.userCount = exports.userInfoById = exports.userInfo = exports.deleteUser = exports.disableMfa = exports.enableMfa = exports.editUser = exports.addUser = exports.createUser = exports.loginUser = exports.TEST_USER_UPDATE_2 = exports.TEST_USER_UPDATE_1 = exports.TEST_USER_DIFFERENT = exports.TEST_USER = void 0;
const Constants = __importStar(require("../constants"));
const chai_1 = __importDefault(require("./chai"));
const speakeasy_1 = __importDefault(require("speakeasy"));
exports.TEST_USER = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'rhubarb',
};
exports.TEST_USER_DIFFERENT = {
    email: 'test@evil.com',
    name: 'Evil Test User',
    password: 'shoebarb',
};
exports.TEST_USER_UPDATE_1 = {
    email: 'test@other.com',
    name: 'Other User',
    password: 'rhubarb',
};
exports.TEST_USER_UPDATE_2 = {
    email: 'test@other.com',
    name: 'Other User',
    password: 'rhubarb',
    newPassword: 'strawberry',
};
async function getJWT(path, server, user) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .post(path)
        .set('Accept', 'application/json')
        .send(user);
    if (res.status !== 200) {
        throw res;
    }
    expect(typeof res.body.jwt).toBe('string');
    return res.body.jwt;
}
async function loginUser(server, user) {
    return getJWT(Constants.LOGIN_PATH, server, user);
}
exports.loginUser = loginUser;
async function createUser(server, user) {
    return getJWT(Constants.USERS_PATH, server, user);
}
exports.createUser = createUser;
async function addUser(server, jwt, user) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .post(Constants.USERS_PATH)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send(user);
    if (res.status !== 200) {
        throw res;
    }
    return res;
}
exports.addUser = addUser;
async function editUser(server, jwt, user) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .put(`${Constants.USERS_PATH}/${user.id}`)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send(user);
    if (res.status !== 200) {
        throw res;
    }
    return res;
}
exports.editUser = editUser;
async function enableMfa(server, jwt, user, totp) {
    const res1 = await chai_1.default
        .request(server)
        .keepOpen()
        .post(`${Constants.USERS_PATH}/${user.id}/mfa`)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send({ enable: true });
    if (res1.status !== 200) {
        throw res1;
    }
    if (!totp) {
        totp = speakeasy_1.default.totp({
            secret: res1.body.secret,
            encoding: 'base32',
        });
    }
    const res2 = await chai_1.default
        .request(server)
        .keepOpen()
        .post(`${Constants.USERS_PATH}/${user.id}/mfa`)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send({ enable: true, mfa: { totp } });
    if (res2.status !== 200) {
        throw res2;
    }
    // return the combined parameters
    return Object.assign({}, res1.body, res2.body);
}
exports.enableMfa = enableMfa;
async function disableMfa(server, jwt, user) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .post(`${Constants.USERS_PATH}/${user.id}/mfa`)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send({ enable: false });
    if (res.status !== 204) {
        throw res;
    }
    return res;
}
exports.disableMfa = disableMfa;
async function deleteUser(server, jwt, userId) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .delete(`${Constants.USERS_PATH}/${userId}`)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send();
    if (res.status !== 204) {
        throw res;
    }
    return res;
}
exports.deleteUser = deleteUser;
async function userInfo(server, jwt) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .get(`${Constants.USERS_PATH}/info`)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send();
    if (res.status !== 200) {
        throw res;
    }
    expect(Array.isArray(res.body)).toBe(true);
    for (const user of res.body) {
        if (user.loggedIn) {
            return user;
        }
    }
    return null;
}
exports.userInfo = userInfo;
async function userInfoById(server, jwt, userId) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .get(`${Constants.USERS_PATH}/${userId}`)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send();
    if (res.status !== 200) {
        throw res;
    }
    expect(typeof res.body).toBe('object');
    return res.body;
}
exports.userInfoById = userInfoById;
async function userCount(server) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .get(`${Constants.USERS_PATH}/count`)
        .set('Accept', 'application/json')
        .send();
    if (res.status !== 200) {
        throw res;
    }
    expect(typeof res.body).toBe('object');
    return res.body;
}
exports.userCount = userCount;
async function logoutUser(server, jwt) {
    const res = await chai_1.default
        .request(server)
        .keepOpen()
        .post(Constants.LOG_OUT_PATH)
        .set(...headerAuth(jwt))
        .set('Accept', 'application/json')
        .send();
    if (res.status !== 200) {
        throw res;
    }
    return res;
}
exports.logoutUser = logoutUser;
function headerAuth(jwt) {
    return ['Authorization', `Bearer ${jwt}`];
}
exports.headerAuth = headerAuth;
//# sourceMappingURL=user.js.map