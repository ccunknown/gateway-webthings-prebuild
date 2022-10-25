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
const event_to_promise_1 = __importDefault(require("event-to-promise"));
const websocket_util_1 = require("../websocket-util");
const ws_1 = __importDefault(require("ws"));
const eventsource_1 = __importDefault(require("eventsource"));
const Constants = __importStar(require("../../constants"));
const event_1 = __importDefault(require("../../models/event"));
const events_1 = __importDefault(require("../../models/events"));
const TEST_THING = {
    id: 'test-1',
    title: 'test-1',
    '@context': 'https://webthings.io/schemas',
    '@type': ['OnOffSwitch'],
    properties: {
        power: {
            '@type': 'OnOffProperty',
            type: 'boolean',
            value: false,
        },
        percent: {
            '@type': 'LevelProperty',
            type: 'number',
            value: 20,
        },
    },
};
const VALIDATION_THING = {
    id: 'validation-1',
    title: 'validation-1',
    '@context': 'https://webthings.io/schemas',
    properties: {
        readOnlyProp: {
            type: 'boolean',
            readOnly: true,
            value: true,
        },
        minMaxProp: {
            type: 'number',
            minimum: 10,
            maximum: 20,
            value: 15,
        },
        enumProp: {
            type: 'string',
            enum: ['val1', 'val2', 'val3'],
            value: 'val2',
        },
        multipleProp: {
            type: 'integer',
            minimum: 0,
            maximum: 600,
            value: 10,
            multipleOf: 5,
        },
    },
};
const EVENT_THING = {
    id: 'event-thing1',
    title: 'Event Thing',
    '@context': 'https://webthings.io/schemas',
    events: {
        overheated: {
            type: 'number',
            unit: 'degree celsius',
        },
    },
};
const piDescr = {
    id: 'pi-1',
    title: 'pi-1',
    '@context': 'https://webthings.io/schemas',
    '@type': ['OnOffSwitch'],
    properties: {
        power: {
            '@type': 'OnOffProperty',
            type: 'boolean',
            value: true,
            forms: [
                {
                    href: '/properties/power',
                    proxy: true,
                },
            ],
        },
    },
    actions: {
        reboot: {
            description: 'Reboot the device',
            forms: [
                {
                    href: '/actions/reboot',
                    proxy: true,
                },
            ],
        },
    },
    events: {
        reboot: {
            description: 'Going down for reboot',
            forms: [
                {
                    href: '/events/reboot',
                    proxy: true,
                },
            ],
        },
    },
};
describe('things/', function () {
    let jwt;
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
    });
    async function addDevice(desc = TEST_THING) {
        const { id } = desc;
        const res = await common_1.chai
            .request(common_1.server)
            .post(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(desc);
        if (res.status !== 201) {
            throw res;
        }
        await (0, common_1.mockAdapter)().addDevice(id, desc);
        return res;
    }
    function makeDescr(id) {
        return {
            id: id,
            title: id,
            properties: {},
        };
    }
    it('GET with no things', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });
    it('fail to create a new thing (empty body)', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .post(Constants.THINGS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send();
        expect(err.status).toEqual(400);
    });
    it('fail to create a new thing (duplicate)', async () => {
        await addDevice();
        try {
            await addDevice();
        }
        catch (err) {
            expect(err.status).toEqual(400);
        }
    });
    it('GET with 1 thing', async () => {
        await addDevice();
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('href');
        expect(res.body[0].href).toEqual(`${Constants.THINGS_PATH}/test-1`);
    });
    it('GET a thing', async () => {
        const thingDescr = JSON.parse(JSON.stringify(piDescr));
        await addDevice(thingDescr);
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/${thingDescr.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('title');
        expect(res.body.title).toEqual(thingDescr.title);
        // Fix up links
        delete thingDescr.properties.power.forms[0].proxy;
        // eslint-disable-next-line max-len
        thingDescr.properties.power.forms[0].href = `${Constants.PROXY_PATH}/${thingDescr.id}${thingDescr.properties.power.forms[0].href}`;
        thingDescr.properties.power.forms.push({
            href: `${Constants.THINGS_PATH}/${thingDescr.id}${Constants.PROPERTIES_PATH}/power`,
        });
        delete thingDescr.actions.reboot.forms[0].proxy;
        // eslint-disable-next-line max-len
        thingDescr.actions.reboot.forms[0].href = `${Constants.PROXY_PATH}/${thingDescr.id}${thingDescr.actions.reboot.forms[0].href}`;
        thingDescr.actions.reboot.forms.push({
            href: `${Constants.THINGS_PATH}/${thingDescr.id}${Constants.ACTIONS_PATH}/reboot`,
        });
        delete thingDescr.events.reboot.forms[0].proxy;
        // eslint-disable-next-line max-len
        thingDescr.events.reboot.forms[0].href = `${Constants.PROXY_PATH}/${thingDescr.id}${thingDescr.events.reboot.forms[0].href}`;
        thingDescr.events.reboot.forms.push({
            href: `${Constants.THINGS_PATH}/${thingDescr.id}${Constants.EVENTS_PATH}/reboot`,
        });
        delete thingDescr.id;
        delete thingDescr.properties.power.value;
        expect(res.body).toMatchObject(thingDescr);
    });
    // eslint-disable-next-line @typescript-eslint/quotes
    it("GET a thing's proxied resources", async () => {
        const thingDescr = JSON.parse(JSON.stringify(piDescr));
        await addDevice(thingDescr);
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.PROXY_PATH}/${thingDescr.id}/properties/power`)
            .set('Accept', 'text/plain')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.text).toEqual('GET /properties/power');
    });
    it('fail to GET a nonexistent thing', async () => {
        await addDevice();
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-2`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
    it('fail to rename a thing', async () => {
        const thingDescr = Object.assign({}, piDescr);
        await addDevice(thingDescr);
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/${thingDescr.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('title');
        expect(res.body.title).toEqual(thingDescr.title);
        let err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/${thingDescr.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({});
        expect(err.status).toEqual(400);
        err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/${thingDescr.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ title: '  \n  ' });
        expect(err.status).toEqual(400);
    });
    it('rename a thing', async () => {
        const thingDescr = Object.assign({}, piDescr);
        await addDevice(thingDescr);
        let res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/${thingDescr.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('title');
        expect(res.body.title).toEqual(thingDescr.title);
        res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/${thingDescr.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ title: 'new title' });
        expect(res.status).toEqual(200);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/${thingDescr.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('title');
        expect(res.body.title).toEqual('new title');
    });
    it('GET all properties of a thing', async () => {
        await addDevice();
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1/properties`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('power');
        expect(res.body.power).toEqual(false);
        expect(res.body).toHaveProperty('percent');
        expect(res.body.percent).toEqual(20);
    });
    it('GET a property of a thing', async () => {
        await addDevice();
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(false);
    });
    it('fail to GET a nonexistent property of a thing', async () => {
        await addDevice();
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1/properties/xyz`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(500);
    });
    it('fail to GET a property of a nonexistent thing', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1a/properties/power`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(500);
    });
    it('fail to set a property of a thing', async () => {
        await addDevice();
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send();
        expect(err.status).toEqual(400);
    });
    it('fail to set a property of a thing', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send('foo');
        expect(err.status).toEqual(400);
    });
    it('set a property of a thing', async () => {
        // Set it to true
        await addDevice();
        const on = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(true));
        expect(on.status).toEqual(204);
        // Check that it was set to true
        const readOn = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(readOn.status).toEqual(200);
        expect(readOn.body).toEqual(true);
        // Set it back to false
        const off = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(false));
        expect(off.status).toEqual(204);
        // Check that it was set to false
        const readOff = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(readOff.status).toEqual(200);
        expect(readOff.body).toEqual(false);
    });
    it('set multiple properties of a thing', async () => {
        // Set properties
        await addDevice();
        const setProperties = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/test-1/properties`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify({
            power: true,
            percent: 42,
        }));
        expect(setProperties.status).toEqual(204);
        // Check that the properties were set
        const getProperties = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1/properties`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(getProperties.status).toEqual(200);
        expect(getProperties.body.power).toEqual(true);
        expect(getProperties.body.percent).toEqual(42);
    });
    it('fail to set multiple properties of a thing', async () => {
        // Set properties
        await addDevice();
        const setProperties = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/test-1/properties`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify({
            power: true,
            percent: 42,
            invalidpropertyname: true,
        }));
        expect(setProperties.status).toEqual(500);
    });
    it('fail to set x and y coordinates of a non-existent thing', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .patch(`${Constants.THINGS_PATH}/test-1`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ abc: true });
        expect(err.status).toEqual(404);
    });
    it('fail to set x and y coordinates of a thing', async () => {
        await addDevice();
        const err = await common_1.chai
            .request(common_1.server)
            .patch(`${Constants.THINGS_PATH}/test-1`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ abc: true });
        expect(err.status).toEqual(400);
    });
    it('set floorplanVisibility of a thing', async () => {
        await addDevice();
        const UPDATED_DESCRIPTION = JSON.parse(JSON.stringify(TEST_THING));
        UPDATED_DESCRIPTION.floorplanVisibility = false;
        const on = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/test-1`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(UPDATED_DESCRIPTION);
        expect(on.status).toEqual(200);
        expect(on.body).toHaveProperty('floorplanVisibility');
        expect(on.body.floorplanVisibility).toEqual(false);
    });
    it('set x and y coordinates of a thing', async () => {
        await addDevice();
        const on = await common_1.chai
            .request(common_1.server)
            .patch(`${Constants.THINGS_PATH}/test-1`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ floorplanX: 10, floorplanY: 20 });
        expect(on.status).toEqual(200);
        expect(on.body).toHaveProperty('floorplanX');
        expect(on.body).toHaveProperty('floorplanY');
        expect(on.body.floorplanX).toEqual(10);
        expect(on.body.floorplanY).toEqual(20);
    });
    it('set layout index of a thing', async () => {
        const TEST_THING_2 = JSON.parse(JSON.stringify(TEST_THING));
        TEST_THING_2.id = 'test-2';
        TEST_THING_2.title = 'test-2';
        const TEST_THING_3 = JSON.parse(JSON.stringify(TEST_THING));
        TEST_THING_3.id = 'test-3';
        TEST_THING_3.title = 'test-3';
        await addDevice(TEST_THING);
        await addDevice(TEST_THING_2);
        await addDevice(TEST_THING_3);
        const on = await common_1.chai
            .request(common_1.server)
            .patch(`${Constants.THINGS_PATH}/test-1`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ layoutIndex: 15 });
        expect(on.status).toEqual(200);
        expect(on.body).toHaveProperty('layoutIndex');
        expect(on.body.layoutIndex).toEqual(2);
        const on2 = await common_1.chai
            .request(common_1.server)
            .patch(`${Constants.THINGS_PATH}/test-2`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ layoutIndex: 1 });
        expect(on2.status).toEqual(200);
        expect(on2.body).toHaveProperty('layoutIndex');
        expect(on2.body.layoutIndex).toEqual(1);
    });
    it('lists 0 new things after creating thing', async () => {
        await addDevice();
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.NEW_THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });
    it('lists new things when devices are added', async () => {
        await (0, common_1.mockAdapter)().addDevice('test-2', makeDescr('test-2'));
        await (0, common_1.mockAdapter)().addDevice('test-3', makeDescr('test-3'));
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.NEW_THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(2);
        expect(res.body[0]).toHaveProperty('href');
        expect(res.body[0].href).toEqual(`${Constants.THINGS_PATH}/test-2`);
        expect(res.body[1]).toHaveProperty('href');
        expect(res.body[1].href).toEqual(`${Constants.THINGS_PATH}/test-3`);
    });
    it('should send multiple devices during pairing', async () => {
        const ws = await (0, websocket_util_1.webSocketOpen)(Constants.NEW_THINGS_PATH, jwt);
        // We expect things test-4, and test-5 to show up eventually
        const [messages, res] = await Promise.all([
            (0, websocket_util_1.webSocketRead)(ws, 2),
            (async () => {
                const res = await common_1.chai
                    .request(common_1.server)
                    .post(Constants.ACTIONS_PATH)
                    .set('Accept', 'application/json')
                    .set(...(0, user_1.headerAuth)(jwt))
                    .send({ pair: { input: { timeout: 60 } } });
                await (0, common_1.mockAdapter)().addDevice('test-4', makeDescr('test-4'));
                await (0, common_1.mockAdapter)().addDevice('test-5', makeDescr('test-5'));
                return res;
            })(),
        ]);
        const parsedIds = messages.map((msg) => {
            expect(typeof msg.id).toBe('string');
            return msg.id;
        });
        expect(parsedIds.sort()).toEqual(['test-4', 'test-5']);
        expect(res.status).toEqual(201);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should add a device during pairing then create a thing', async () => {
        const thingId = 'test-6';
        const descr = makeDescr(thingId);
        (0, common_1.mockAdapter)().pairDevice(thingId, descr);
        // send pair action
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send({ pair: { input: { timeout: 60 } } });
        expect(res.status).toEqual(201);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.NEW_THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        let found = false;
        for (const thing of res.body) {
            if (thing.href === `${Constants.THINGS_PATH}/${thingId}`) {
                found = true;
            }
        }
        expect(found);
        res = await common_1.chai
            .request(common_1.server)
            .post(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(descr);
        expect(res.status).toEqual(201);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.NEW_THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        found = false;
        for (const thing of res.body) {
            if (thing.href === `${Constants.THINGS_PATH}/${thingId}`) {
                found = true;
            }
        }
        expect(!found);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        found = false;
        for (const thing of res.body) {
            if (thing.href === `${Constants.THINGS_PATH}/${thingId}`) {
                found = true;
            }
        }
        expect(found);
    });
    it('should remove a thing', async () => {
        const thingId = 'test-6';
        const descr = makeDescr(thingId);
        (0, common_1.mockAdapter)().pairDevice(thingId, descr);
        // send pair action
        const pair = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send({ pair: { input: { timeout: 60 } } });
        expect(pair.status).toEqual(201);
        let res = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.THINGS_PATH}/${thingId}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(204);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        let found = false;
        for (const thing of res.body) {
            if (thing.href === `${Constants.THINGS_PATH}/${thingId}`) {
                found = true;
            }
        }
        expect(!found);
    });
    it('should remove a device', async () => {
        const thingId = 'test-6';
        await addDevice(Object.assign({}, TEST_THING, {
            id: thingId,
        }));
        const descr = makeDescr(thingId);
        (0, common_1.mockAdapter)().pairDevice(thingId, descr);
        // send pair action
        const pair = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ pair: { input: { timeout: 60 } } });
        expect(pair.status).toEqual(201);
        await (0, common_1.mockAdapter)().removeDevice(thingId);
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.NEW_THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        let found = false;
        for (const thing of res.body) {
            if (thing.href === `${Constants.THINGS_PATH}/${thingId}`) {
                found = true;
            }
        }
        expect(!found);
    });
    it('should remove a device in response to unpair', async () => {
        await (0, common_1.mockAdapter)().addDevice('test-5', makeDescr('test-5'));
        const thingId = 'test-5';
        // The mock adapter requires knowing in advance that we're going to unpair
        // a specific device
        (0, common_1.mockAdapter)().unpairDevice(thingId);
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ unpair: { input: { id: thingId } } });
        expect(res.status).toEqual(201);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.NEW_THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        let found = false;
        for (const thing of res.body) {
            if (thing.href === `${Constants.THINGS_PATH}/${thingId}`) {
                found = true;
            }
        }
        expect(!found);
    });
    it('should receive propertyStatus messages over websocket', async () => {
        await addDevice();
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        const [messages, res] = await Promise.all([
            (0, websocket_util_1.webSocketRead)(ws, 3),
            common_1.chai
                .request(common_1.server)
                .put(`${Constants.THINGS_PATH}/${TEST_THING.id}/properties/power`)
                .type('json')
                .set(...(0, user_1.headerAuth)(jwt))
                .send(JSON.stringify(true)),
        ]);
        expect(res.status).toEqual(204);
        expect(messages[2].messageType).toEqual(Constants.PROPERTY_STATUS);
        expect(messages[2].data.power).toEqual(true);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should set a property using setProperty over websocket', async () => {
        await addDevice();
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        await (0, websocket_util_1.webSocketSend)(ws, {
            messageType: Constants.SET_PROPERTY,
            data: {
                power: true,
            },
        });
        const on = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/test-1/properties/power`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(on.status).toEqual(200);
        expect(on.body).toEqual(true);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should fail to set a nonexistent property using setProperty', async () => {
        await addDevice();
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        const request = {
            messageType: Constants.SET_PROPERTY,
            data: {
                rutabaga: true,
            },
        };
        const [sendError, messages] = await Promise.all([
            (0, websocket_util_1.webSocketSend)(ws, request),
            (0, websocket_util_1.webSocketRead)(ws, 3),
        ]);
        expect(sendError).toBeFalsy();
        const error = messages[2];
        expect(error.messageType).toBe(Constants.ERROR);
        expect(error.data.request).toMatchObject(request);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should receive an error from sending a malformed message', async () => {
        await addDevice();
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        const request = 'good morning friend I am not JSON';
        const [sendError, messages] = await Promise.all([
            (0, websocket_util_1.webSocketSend)(ws, request),
            (0, websocket_util_1.webSocketRead)(ws, 3),
        ]);
        expect(sendError).toBeFalsy();
        const error = messages[2];
        expect(error.messageType).toBe(Constants.ERROR);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should fail to connect to a nonexistent thing over websocket', async () => {
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/nonexistent-thing`, jwt);
        const messages = await (0, websocket_util_1.webSocketRead)(ws, 1);
        const error = messages[0];
        expect(error.messageType).toBe(Constants.ERROR);
        expect(error.data.status).toEqual('404 Not Found');
        if (ws.readyState !== ws_1.default.CLOSED) {
            await (0, event_to_promise_1.default)(ws, 'close');
        }
    });
    it('should only receive propertyStatus messages from the connected thing', async () => {
        await addDevice();
        const otherThingId = 'test-7';
        await addDevice(Object.assign({}, TEST_THING, {
            id: otherThingId,
            title: otherThingId,
        }));
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        // PUT test-7 on true, then test-1 on true, then test-1 on false. If we
        // receive an update that on is true twice, we know that the WS received
        // both test-7 and test-1's statuses. If we receive true then false, the
        // WS correctly received both of test-1's statuses.
        const [res, messages] = await Promise.all([
            common_1.chai
                .request(common_1.server)
                .put(`${Constants.THINGS_PATH}/${otherThingId}/properties/power`)
                .type('json')
                .set(...(0, user_1.headerAuth)(jwt))
                .send(JSON.stringify(true))
                .then(() => {
                return common_1.chai
                    .request(common_1.server)
                    .put(`${Constants.THINGS_PATH}/${TEST_THING.id}/properties/power`)
                    .type('json')
                    .set(...(0, user_1.headerAuth)(jwt))
                    .send(JSON.stringify(true));
            })
                .then(() => {
                return common_1.chai
                    .request(common_1.server)
                    .put(`${Constants.THINGS_PATH}/${TEST_THING.id}/properties/power`)
                    .type('json')
                    .set(...(0, user_1.headerAuth)(jwt))
                    .send(JSON.stringify(false));
            }),
            (0, websocket_util_1.webSocketRead)(ws, 4),
        ]);
        expect(res.status).toEqual(204);
        expect(messages[2].messageType).toEqual(Constants.PROPERTY_STATUS);
        expect(messages[2].data.power).toEqual(true);
        expect(messages[3].messageType).toEqual(Constants.PROPERTY_STATUS);
        expect(messages[3].data.power).toEqual(false);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should receive event notifications over websocket', async () => {
        await addDevice();
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        const eventAFirst = new event_1.default('a', 'just a cool event', TEST_THING.id);
        const eventB = new event_1.default('b', 'just a boring event', TEST_THING.id);
        const eventASecond = new event_1.default('a', 'just another cool event', TEST_THING.id);
        const subscriptionRequest = {
            messageType: Constants.ADD_EVENT_SUBSCRIPTION,
            data: {
                a: {},
            },
        };
        await (0, websocket_util_1.webSocketSend)(ws, subscriptionRequest);
        const [res, messages] = await Promise.all([
            (async () => {
                await new Promise((res) => {
                    setTimeout(res, 0);
                });
                events_1.default.add(eventAFirst);
                events_1.default.add(eventB);
                events_1.default.add(eventASecond);
                return true;
            })(),
            (0, websocket_util_1.webSocketRead)(ws, 4),
        ]);
        expect(res).toBeTruthy();
        expect(messages[2].messageType).toEqual(Constants.EVENT);
        expect(messages[2].data).toHaveProperty(eventAFirst.getName());
        expect(messages[2].data[eventAFirst.getName()]).toHaveProperty('data');
        expect(messages[2].data[eventAFirst.getName()]
            .data).toEqual(eventAFirst.getData());
        expect(messages[3].messageType).toEqual(Constants.EVENT);
        expect(messages[3].data).toHaveProperty(eventASecond.getName());
        expect(messages[3].data[eventASecond.getName()]).toHaveProperty('data');
        expect(messages[3].data[eventASecond.getName()]
            .data).toEqual(eventASecond.getData());
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should be able to retrieve events', async () => {
        await addDevice();
        let res = await common_1.chai
            .request(common_1.server)
            .get(Constants.EVENTS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.EVENTS_PATH}/a`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        const thingBase = `${Constants.THINGS_PATH}/${TEST_THING.id}`;
        res = await common_1.chai
            .request(common_1.server)
            .get(thingBase + Constants.EVENTS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${thingBase}${Constants.EVENTS_PATH}/a`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        const eventA = new event_1.default('a', 'just a cool event', TEST_THING.id);
        const eventB = new event_1.default('b', 'just a boring event', TEST_THING.id);
        await events_1.default.add(eventA);
        await events_1.default.add(eventB);
        res = await common_1.chai
            .request(common_1.server)
            .get(thingBase + Constants.EVENTS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(2);
        expect(res.body[0]).toHaveProperty('a');
        expect(res.body[0].a).toHaveProperty('data');
        expect(res.body[0].a.data).toBe('just a cool event');
        expect(res.body[0].a).toHaveProperty('timestamp');
        expect(res.body[1]).toHaveProperty('b');
        expect(res.body[1].b).toHaveProperty('data');
        expect(res.body[1].b.data).toBe('just a boring event');
        expect(res.body[1].b).toHaveProperty('timestamp');
        res = await common_1.chai
            .request(common_1.server)
            .get(`${thingBase}${Constants.EVENTS_PATH}/a`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('a');
        expect(res.body[0].a).toHaveProperty('data');
        expect(res.body[0].a.data).toBe('just a cool event');
        expect(res.body[0].a).toHaveProperty('timestamp');
    });
    it('should be able to subscribe to an event using EventSource', async () => {
        await addDevice(EVENT_THING);
        const address = common_1.httpServer.address();
        const eventSourceURL = `http://127.0.0.1:${address.port}${Constants.THINGS_PATH}/` +
            `${EVENT_THING.id}/events/overheated?jwt=${jwt}`;
        const eventSource = new eventsource_1.default(eventSourceURL);
        await (0, event_to_promise_1.default)(eventSource, 'open');
        const overheatedEvent = new event_1.default('overheated', 101, EVENT_THING.id);
        const [, event] = await Promise.all([
            events_1.default.add(overheatedEvent),
            (0, event_to_promise_1.default)(eventSource, 'overheated'),
        ]);
        expect(event.type).toEqual('overheated');
        expect(JSON.parse(event.data)).toEqual(101);
        eventSource.close();
    });
    it('should be able to subscribe to all events on a thing using EventSource', async () => {
        await addDevice(EVENT_THING);
        const address = common_1.httpServer.address();
        const eventSourceURL = `http://127.0.0.1:${address.port}${Constants.THINGS_PATH}/` +
            `${EVENT_THING.id}/events?jwt=${jwt}`;
        const eventsSource = new eventsource_1.default(eventSourceURL);
        await (0, event_to_promise_1.default)(eventsSource, 'open');
        const overheatedEvent2 = new event_1.default('overheated', 101, EVENT_THING.id);
        const [, event2] = await Promise.all([
            events_1.default.add(overheatedEvent2),
            (0, event_to_promise_1.default)(eventsSource, 'overheated'),
        ]);
        expect(event2.type).toEqual('overheated');
        expect(JSON.parse(event2.data)).toEqual(101);
        eventsSource.close();
    });
    it('should not be able to subscribe events on a thing that doesnt exist', async () => {
        await addDevice(EVENT_THING);
        const address = common_1.httpServer.address();
        const eventSourceURL = `http://127.0.0.1:${address.port}${Constants.THINGS_PATH}` +
            `/non-existent-thing/events/overheated?jwt=${jwt}`;
        const thinglessEventSource = new eventsource_1.default(eventSourceURL);
        thinglessEventSource.onerror = jest.fn();
        thinglessEventSource.onopen = jest.fn();
        await (0, event_to_promise_1.default)(thinglessEventSource, 'error');
        expect(thinglessEventSource.onopen).not.toBeCalled();
        expect(thinglessEventSource.onerror).toBeCalled();
    });
    it('should not be able to subscribe to an event that doesnt exist', async () => {
        await addDevice(EVENT_THING);
        const address = common_1.httpServer.address();
        const eventSourceURL = `http://127.0.0.1:${address.port}${Constants.THINGS_PATH}` +
            `${EVENT_THING.id}/events/non-existentevent?jwt=${jwt}`;
        const eventlessEventSource = new eventsource_1.default(eventSourceURL);
        eventlessEventSource.onerror = jest.fn();
        eventlessEventSource.onopen = jest.fn();
        await (0, event_to_promise_1.default)(eventlessEventSource, 'error');
        expect(eventlessEventSource.onopen).not.toBeCalled();
        expect(eventlessEventSource.onerror).toBeCalled();
    });
    // eslint-disable-next-line @typescript-eslint/quotes
    it("should receive thing's action status messages over websocket", async () => {
        await addDevice();
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        const [actionHref, messages] = await Promise.all([
            (async () => {
                await common_1.chai
                    .request(common_1.server)
                    .post(Constants.ACTIONS_PATH)
                    .set('Accept', 'application/json')
                    .set(...(0, user_1.headerAuth)(jwt))
                    .send({ pair: { input: { timeout: 60 } } });
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
                return actionHref;
            })(),
            (0, websocket_util_1.webSocketRead)(ws, 5),
        ]);
        expect(messages[2].messageType).toEqual(Constants.ACTION_STATUS);
        expect(messages[2].data.pair.status).toEqual('created');
        expect(messages[2].data.pair.href).toEqual(actionHref);
        expect(messages[3].messageType).toEqual(Constants.ACTION_STATUS);
        expect(messages[3].data.pair.status).toEqual('pending');
        expect(messages[3].data.pair.href).toEqual(actionHref);
        expect(messages[4].messageType).toEqual(Constants.ACTION_STATUS);
        expect(messages[4].data.pair.status).toEqual('deleted');
        expect(messages[4].data.pair.href).toEqual(actionHref);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should close websocket connections on thing deletion', async () => {
        await addDevice();
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${TEST_THING.id}`, jwt);
        const res = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.THINGS_PATH}/${TEST_THING.id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(204);
        await (0, event_to_promise_1.default)(ws, 'close');
    });
    it('creates and gets the actions of a thing', async () => {
        await addDevice(piDescr);
        const thingBase = `${Constants.THINGS_PATH}/${piDescr.id}`;
        let res = await common_1.chai
            .request(common_1.server)
            .get(thingBase)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        const actionDescr = {
            reboot: {
                input: {},
            },
        };
        res = await common_1.chai
            .request(common_1.server)
            .post(thingBase + Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send(actionDescr);
        expect(res.status).toEqual(201);
        res = await common_1.chai
            .request(common_1.server)
            .get(thingBase + Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('reboot');
        expect(res.body[0].reboot).toHaveProperty('href');
        expect(res.body[0].reboot.href.startsWith(thingBase)).toBeTruthy();
        // Expect it to not show up in the root (Gateway's) actions route
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });
    it('fails to create an action on a nonexistent thing', async () => {
        const thingBase = `${Constants.THINGS_PATH}/nonexistent-thing`;
        const actionDescr = {
            pair: {
                input: {
                    timeout: 60,
                },
            },
        };
        const err = await common_1.chai
            .request(common_1.server)
            .post(thingBase + Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send(actionDescr);
        expect(err.status).toEqual(404);
    });
    it('fails to create thing action which does not exist', async () => {
        await addDevice(piDescr);
        const thingBase = `${Constants.THINGS_PATH}/${piDescr.id}`;
        const res = await common_1.chai
            .request(common_1.server)
            .get(thingBase)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        const actionDescr = {
            pair: {
                input: {
                    timeout: 60,
                },
            },
        };
        const err = await common_1.chai
            .request(common_1.server)
            .post(thingBase + Constants.ACTIONS_PATH)
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Accept', 'application/json')
            .send(actionDescr);
        expect(err.status).toEqual(400);
    });
    it('should create an action over websocket', async () => {
        await addDevice(piDescr);
        const thingBase = `${Constants.THINGS_PATH}/${piDescr.id}`;
        const ws = await (0, websocket_util_1.webSocketOpen)(thingBase, jwt);
        const messages = (await Promise.all([
            (0, websocket_util_1.webSocketSend)(ws, {
                messageType: Constants.REQUEST_ACTION,
                data: {
                    reboot: {
                        input: {},
                    },
                },
            }),
            (0, websocket_util_1.webSocketRead)(ws, 2),
        ]))[1];
        const actionStatus = messages[1];
        expect(actionStatus.messageType).toEqual(Constants.ACTION_STATUS);
        expect(actionStatus.data).toHaveProperty('reboot');
        const res = await common_1.chai
            .request(common_1.server)
            .get(thingBase + Constants.ACTIONS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toHaveProperty('reboot');
        expect(res.body[0].reboot).toHaveProperty('href');
        expect(res.body[0].reboot.href.startsWith(thingBase)).toBeTruthy();
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should fail to create an unknown action over websocket', async () => {
        await addDevice(piDescr);
        const thingBase = `${Constants.THINGS_PATH}/${piDescr.id}`;
        const ws = await (0, websocket_util_1.webSocketOpen)(thingBase, jwt);
        const messages = (await Promise.all([
            (0, websocket_util_1.webSocketSend)(ws, {
                messageType: Constants.REQUEST_ACTION,
                data: {
                    pair: {
                        input: {
                            timeout: 60,
                        },
                    },
                },
            }),
            (0, websocket_util_1.webSocketRead)(ws, 3),
        ]))[1];
        const created = messages[1];
        expect(created.messageType).toEqual(Constants.ACTION_STATUS);
        expect(created.data.pair.status).toEqual('created');
        const err = messages[2];
        expect(err.messageType).toEqual(Constants.ERROR);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('should fail to handle an unknown websocket messageType', async () => {
        await addDevice(piDescr);
        const thingBase = `${Constants.THINGS_PATH}/${piDescr.id}`;
        const ws = await (0, websocket_util_1.webSocketOpen)(thingBase, jwt);
        const messages = (await Promise.all([
            (0, websocket_util_1.webSocketSend)(ws, {
                messageType: 'tomato',
                data: {},
            }),
            (0, websocket_util_1.webSocketRead)(ws, 2),
        ]))[1];
        const actionStatus = messages[1];
        expect(actionStatus.messageType).toEqual(Constants.ERROR);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    it('fail to set PIN for device', async () => {
        await addDevice(piDescr);
        const err = await common_1.chai
            .request(common_1.server)
            .patch(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ thingId: piDescr.id, pin: '0000' });
        expect(err.status).toEqual(400);
    });
    it('set PIN for device', async () => {
        await addDevice(piDescr);
        const res = await common_1.chai
            .request(common_1.server)
            .patch(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ thingId: piDescr.id, pin: '1234' });
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('title');
        expect(res.body.title).toEqual(piDescr.title);
    });
    it('fail to set credentials for device', async () => {
        await addDevice(piDescr);
        const err = await common_1.chai
            .request(common_1.server)
            .patch(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ thingId: piDescr.id, username: 'fake', password: 'wrong' });
        expect(err.status).toEqual(400);
    });
    it('set credentials for device', async () => {
        await addDevice(piDescr);
        const res = await common_1.chai
            .request(common_1.server)
            .patch(Constants.THINGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({ thingId: piDescr.id, username: 'test-user', password: 'Password-1234!' });
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('title');
        expect(res.body.title).toEqual(piDescr.title);
    });
    it('fail to set read-only property', async () => {
        await addDevice(VALIDATION_THING);
        let res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/readOnlyProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(true);
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/validation-1/properties/readOnlyProp`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(false));
        expect(err.status).toEqual(400);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/readOnlyProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(true);
    });
    it('fail to set invalid number property value', async () => {
        await addDevice(VALIDATION_THING);
        let res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/minMaxProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(15);
        let err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/validation-1/properties/minMaxProp`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(0));
        expect(err.status).toEqual(400);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/minMaxProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(15);
        err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/validation-1/properties/minMaxProp`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(30));
        expect(err.status).toEqual(400);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/minMaxProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(15);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/multipleProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(10);
        err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/validation-1/properties/multipleProp`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(3));
        expect(err.status).toEqual(400);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/multipleProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(10);
        res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/validation-1/properties/multipleProp`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(30));
        expect(res.status).toEqual(204);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/multipleProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(30);
    });
    it('fail to set invalid enum property value', async () => {
        await addDevice(VALIDATION_THING);
        let res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/enumProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual('val2');
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/validation-1/properties/enumProp`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify('val0'));
        expect(err.status).toEqual(400);
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/validation-1/properties/enumProp`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual('val2');
    });
});
//# sourceMappingURL=things-test.js.map