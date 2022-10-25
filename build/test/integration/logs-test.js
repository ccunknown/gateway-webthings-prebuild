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
const Constants = __importStar(require("../../constants"));
const logs_1 = __importDefault(require("../../models/logs"));
const sleep_1 = __importDefault(require("../../sleep"));
const thingLight1 = {
    id: 'light1',
    title: 'light1',
    '@context': 'https://webthings.io/schemas',
    '@type': ['OnOffSwitch'],
    properties: {
        on: {
            '@type': 'OnOffProperty',
            type: 'boolean',
            value: false,
        },
        color: {
            '@type': 'ColorProperty',
            type: 'string',
            value: '#ff7700',
        },
        brightness: {
            '@type': 'BrightnessProperty',
            type: 'number',
            value: 100,
        },
    },
};
const thingLight2 = JSON.parse(JSON.stringify(thingLight1).replace(/light1/g, 'light2'));
describe('logs/', function () {
    let jwt;
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
    async function createLog(thing, property) {
        const body = {
            descr: {
                type: 'property',
                thing: thing,
                property: property,
            },
            maxAge: 60 * 60 * 1000,
        };
        const res = await common_1.chai
            .request(common_1.server)
            .post(`${Constants.LOGS_PATH}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .set('Content-Type', 'application/json')
            .send(body);
        expect(res.status).toEqual(200);
    }
    async function createAllLogs() {
        for (const prop in thingLight1.properties) {
            await createLog(thingLight1.id, prop);
        }
        for (const prop in thingLight2.properties) {
            await createLog(thingLight2.id, prop);
        }
    }
    async function setProp(thingId, propId, value) {
        const res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/${thingId}/properties/${propId}`)
            .set('Accept', 'application/json')
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(value));
        expect(res.status).toEqual(204);
        // sleep just a bit to allow events to fire in the gateway
        await (0, sleep_1.default)(200);
    }
    beforeEach(async () => {
        logs_1.default.clear();
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
        await createAllLogs();
        await addDevice(thingLight1);
        await addDevice(thingLight2);
        await populatePropertyData();
    });
    const light1OnValues = [false, true, false, true, false];
    const light1BriValues = [100, 12, 34];
    const light2BriValues = [100, 0, 31];
    async function populatePropertyData() {
        for (const value of light1OnValues.slice(1, light1OnValues.length - 1)) {
            await setProp('light1', 'on', value);
        }
        for (const value of light1BriValues.slice(1)) {
            await setProp('light1', 'brightness', value);
        }
        for (const value of light2BriValues.slice(1)) {
            await setProp('light2', 'brightness', value);
        }
        await setProp('light1', 'on', light1OnValues[light1OnValues.length - 1]);
    }
    function value(data) {
        return data.value;
    }
    it('gets all logs', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.LOGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        const logs = res.body;
        expect(logs.light1.on.map(value)).toEqual(light1OnValues);
        expect(logs.light1.brightness.map(value)).toEqual(light1BriValues);
        expect(logs.light2.brightness.map(value)).toEqual(light2BriValues);
    });
    // eslint-disable-next-line @typescript-eslint/quotes
    it("gets one device's logs", async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.LOGS_PATH}/things/light1`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        const logs = res.body;
        expect(logs.on.map(value)).toEqual(light1OnValues);
        expect(logs.brightness.map(value)).toEqual(light1BriValues);
    });
    it('deletes a log', async () => {
        let res = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.LOGS_PATH}/things/light1/properties/on`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.LOGS_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        const logs = res.body;
        expect(logs.light1.on).toBeFalsy();
        expect(logs.light1.brightness.map(value)).toEqual(light1BriValues);
        expect(logs.light2.brightness.map(value)).toEqual(light2BriValues);
    });
});
//# sourceMappingURL=logs-test.js.map