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
describe('actions/', () => {
    let jwt;
    const thingLight = {
        id: 'light',
        title: 'light',
        '@context': 'https://webthings.io/schemas',
        '@type': ['OnOffSwitch', 'Light'],
        properties: {
            power: {
                '@type': 'OnOffProperty',
                type: 'boolean',
                value: false,
            },
        },
        actions: {
            blink: {
                description: 'Blink the switch on and off',
            },
            rejectRequest: {
                description: 'Reject when call requestAction',
            },
            rejectRemove: {
                description: 'Reject when call removeAction',
            },
        },
    };
    async function addDevice(desc) {
        const { id } = desc;
        const res = await common_1.chai
            .request(common_1.server)
            .post(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(desc);
        await (0, common_1.mockAdapter)().addDevice(id, desc);
        return res;
    }
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    it('GET with no actions', async () => {
        let res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ACTIONS_PATH}/pair`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });
    it('should fail to create a new action (empty body)', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send();
        expect(err.status).toEqual(400);
    });
    it('should fail to create a new action (unknown name)', async () => {
        const descr = {
            potato: {},
        };
        const err = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send(descr);
        expect(err.status).toEqual(400);
    });
    it('should fail when plugin rejects requestAction', async () => {
        const { id } = thingLight;
        await addDevice(thingLight);
        const descr = {
            rejectRequest: {},
        };
        const err = await common_1.chai
            .request(common_1.server)
            .post(`${Constants.THINGS_PATH}/${id}${Constants.ACTIONS_PATH}`)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send(descr);
        expect(err.status).toEqual(400);
    });
    it('should list and retrieve the new action', async () => {
        const descr = {
            pair: {
                input: {
                    timeout: 60,
                },
            },
        };
        const pair = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send(descr);
        expect(pair.status).toEqual(201);
        let res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('pair');
        expect(res.body[0].pair).toHaveProperty('href');
        expect(res.body[0].pair).toHaveProperty('input');
        expect(res.body[0].pair.input).toHaveProperty('timeout');
        expect(res.body[0].pair.input.timeout).toEqual(60);
        expect(res.body[0].pair).toHaveProperty('status');
        expect(res.body[0].pair).toHaveProperty('timeRequested');
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ACTIONS_PATH}/pair`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('pair');
        expect(res.body[0].pair).toHaveProperty('href');
        expect(res.body[0].pair).toHaveProperty('input');
        expect(res.body[0].pair.input).toHaveProperty('timeout');
        expect(res.body[0].pair.input.timeout).toEqual(60);
        expect(res.body[0].pair).toHaveProperty('status');
        expect(res.body[0].pair).toHaveProperty('timeRequested');
        const actionHref = res.body[0].pair.href;
        res = await common_1.chai
            .request(common_1.server)
            .get(actionHref)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('pair');
        expect(res.body.pair).toHaveProperty('href');
        expect(res.body.pair).toHaveProperty('input');
        expect(res.body.pair.input).toHaveProperty('timeout');
        expect(res.body.pair.input.timeout).toEqual(60);
        expect(res.body.pair).toHaveProperty('status');
        expect(res.body.pair).toHaveProperty('timeRequested');
    });
    it('should list and retrieve the new action by name', async () => {
        const descr = {
            timeout: 60,
        };
        const pair = await common_1.chai
            .request(common_1.server)
            .post(`${Constants.ACTIONS_PATH}/pair`)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send(descr);
        expect(pair.status).toEqual(201);
        let res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('pair');
        expect(res.body[0].pair).toHaveProperty('href');
        expect(res.body[0].pair).toHaveProperty('input');
        expect(res.body[0].pair.input).toHaveProperty('timeout');
        expect(res.body[0].pair.input.timeout).toEqual(60);
        expect(res.body[0].pair).toHaveProperty('status');
        expect(res.body[0].pair).toHaveProperty('timeRequested');
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ACTIONS_PATH}/pair`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('pair');
        expect(res.body[0].pair).toHaveProperty('href');
        expect(res.body[0].pair).toHaveProperty('input');
        expect(res.body[0].pair.input).toHaveProperty('timeout');
        expect(res.body[0].pair.input.timeout).toEqual(60);
        expect(res.body[0].pair).toHaveProperty('status');
        expect(res.body[0].pair).toHaveProperty('timeRequested');
        const actionHref = res.body[0].pair.href;
        res = await common_1.chai
            .request(common_1.server)
            .get(actionHref)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('pair');
        expect(res.body.pair).toHaveProperty('href');
        expect(res.body.pair).toHaveProperty('input');
        expect(res.body.pair.input).toHaveProperty('timeout');
        expect(res.body.pair.input.timeout).toEqual(60);
        expect(res.body.pair).toHaveProperty('status');
        expect(res.body.pair).toHaveProperty('timeRequested');
    });
    it('should error retrieving a nonexistent action', async () => {
        const actionId = 'foobarmissing';
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.ACTIONS_PATH}/pair/${actionId}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
    it('should remove an action', async () => {
        const descr = {
            pair: {
                input: {
                    timeout: 60,
                },
            },
        };
        await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(descr);
        let res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        const actionHref = res.body[0].pair.href;
        res = await common_1.chai
            .request(common_1.server)
            .delete(actionHref)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(204);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });
    it('should error removing a nonexistent action', async () => {
        const actionId = 555;
        const err = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.ACTIONS_PATH}/pair/${actionId}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
    it('should fail when plugin rejects removeAction', async () => {
        const { id } = thingLight;
        await addDevice(thingLight);
        const descr = {
            rejectRemove: {
                input: {},
            },
        };
        const basePath = `${Constants.THINGS_PATH}/${id}${Constants.ACTIONS_PATH}`;
        await common_1.chai
            .request(common_1.server)
            .post(basePath)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(descr);
        let res = await common_1.chai
            .request(common_1.server)
            .get(basePath)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${basePath}/rejectRemove`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        const actionHref = res.body[0].rejectRemove.href;
        const err = await common_1.chai
            .request(common_1.server)
            .delete(actionHref)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(400);
    });
    it('should succeed on an unpair of a nonexistent device', async () => {
        const thingId = 'test-nonexistent';
        // The mock adapter requires knowing in advance that we're going to unpair
        // a specific device
        (0, common_1.mockAdapter)().unpairDevice(thingId);
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send({ unpair: { input: { id: thingId } } });
        expect(res.status).toEqual(201);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0]).toHaveProperty('unpair');
        expect(res.body[0].unpair).toHaveProperty('input');
        expect(res.body[0].unpair.input).toHaveProperty('id');
        expect(res.body[0].unpair.input.id).toBe('test-nonexistent');
        expect(res.body[0].unpair).toHaveProperty('href');
        expect(res.body[0].unpair).toHaveProperty('status');
        expect(res.body[0].unpair.status).toEqual('completed');
    });
});
//# sourceMappingURL=actions-test.js.map