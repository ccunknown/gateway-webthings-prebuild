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
const expect_utils_1 = require("../expect-utils");
const util_1 = __importDefault(require("util"));
const user_1 = require("../user");
const Constants = __importStar(require("../../constants"));
const event_1 = __importDefault(require("../../models/event"));
const events_1 = __importDefault(require("../../models/events"));
const websocket_util_1 = require("../websocket-util");
const thingLight1 = {
    id: 'light1',
    title: 'light1',
    type: 'onOffSwitch',
    '@context': 'https://webthings.io/schemas',
    '@type': ['OnOffSwitch'],
    properties: {
        on: { type: 'boolean', value: false },
        hue: { type: 'number', value: 0 },
        sat: { type: 'number', value: 0 },
        bri: { type: 'number', value: 100 },
    },
    actions: {
        blink: {
            description: 'Blink the switch on and off',
        },
    },
    events: {
        surge: {
            description: 'Surge in power detected',
        },
    },
};
const thingLight2 = {
    id: 'light2',
    title: 'light2',
    type: 'onOffSwitch',
    '@context': 'https://webthings.io/schemas',
    '@type': ['OnOffSwitch'],
    properties: {
        on: { type: 'boolean', value: false },
        hue: { type: 'number', value: 0 },
        sat: { type: 'number', value: 0 },
        bri: { type: 'number', value: 100 },
    },
};
const thingLight3 = {
    id: 'light3',
    title: 'light3',
    type: 'onOffSwitch',
    '@context': 'https://webthings.io/schemas',
    '@type': ['OnOffSwitch'],
    properties: {
        on: { type: 'boolean', value: false },
        hue: { type: 'number', value: 0 },
        sat: { type: 'number', value: 0 },
        bri: { type: 'number', value: 100 },
        color: { type: 'string', value: '#ff7700' },
    },
};
const testRule = {
    name: 'testRule',
    enabled: true,
    trigger: {
        property: {
            type: 'boolean',
            id: 'on',
            thing: 'light1',
        },
        type: 'BooleanTrigger',
        onValue: true,
    },
    effect: {
        property: {
            type: 'boolean',
            thing: 'light2',
            id: 'on',
        },
        type: 'PulseEffect',
        value: true,
    },
};
const offRule = {
    name: 'offRule',
    enabled: true,
    trigger: {
        property: {
            type: 'boolean',
            thing: 'light1',
            id: 'on',
        },
        type: 'BooleanTrigger',
        onValue: false,
    },
    effect: {
        property: {
            type: 'boolean',
            thing: 'light2',
            id: 'on',
        },
        type: 'PulseEffect',
        value: false,
    },
};
const numberTestRule = {
    enabled: true,
    name: 'Number Test Rule',
    trigger: {
        property: {
            type: 'number',
            thing: 'light2',
            id: 'hue',
        },
        type: 'LevelTrigger',
        levelType: 'GREATER',
        value: 120,
    },
    effect: {
        property: {
            type: 'number',
            thing: 'light3',
            id: 'bri',
        },
        type: 'PulseEffect',
        value: 30,
    },
};
const mixedTestRule = {
    enabled: true,
    name: 'Mixed Test Rule',
    trigger: {
        property: {
            type: 'number',
            thing: 'light3',
            id: 'bri',
        },
        type: 'LevelTrigger',
        levelType: 'LESS',
        value: 50,
    },
    effect: {
        property: {
            type: 'boolean',
            thing: 'light3',
            id: 'on',
        },
        type: 'SetEffect',
        value: true,
    },
};
const eventActionRule = {
    enabled: true,
    name: 'Event Action Rule',
    trigger: {
        type: 'EventTrigger',
        thing: 'light1',
        event: 'surge',
    },
    effect: {
        type: 'ActionEffect',
        thing: 'light1',
        action: 'blink',
    },
};
const equalityRule = {
    enabled: true,
    name: 'Equality Rule',
    trigger: {
        type: 'EqualityTrigger',
        property: {
            type: 'string',
            thing: 'light3',
            id: 'color',
        },
        value: '#00ff77',
    },
    effect: {
        property: {
            type: 'boolean',
            thing: 'light3',
            id: 'on',
        },
        type: 'SetEffect',
        value: true,
    },
};
const complexTriggerRule = {
    enabled: true,
    name: 'Complex Trigger Rule',
    trigger: {
        type: 'MultiTrigger',
        op: 'AND',
        triggers: [
            {
                type: 'BooleanTrigger',
                property: {
                    type: 'boolean',
                    thing: 'light1',
                    id: 'on',
                },
                onValue: true,
            },
            {
                type: 'MultiTrigger',
                op: 'OR',
                triggers: [
                    {
                        type: 'BooleanTrigger',
                        property: {
                            type: 'boolean',
                            thing: 'light1',
                            id: 'on',
                        },
                        onValue: true,
                    },
                    {
                        type: 'BooleanTrigger',
                        property: {
                            type: 'boolean',
                            thing: 'light2',
                            id: 'on',
                        },
                        onValue: true,
                    },
                ],
            },
        ],
    },
    effect: {
        property: {
            type: 'boolean',
            thing: 'light3',
            id: 'on',
        },
        type: 'SetEffect',
        value: true,
    },
};
const multiRule = {
    enabled: true,
    trigger: {
        property: {
            type: 'boolean',
            thing: 'light1',
            id: 'on',
        },
        type: 'BooleanTrigger',
        onValue: true,
    },
    effect: {
        effects: [
            {
                property: {
                    type: 'boolean',
                    thing: 'light2',
                    id: 'on',
                },
                type: 'PulseEffect',
                value: true,
            },
            {
                property: {
                    type: 'boolean',
                    thing: 'light3',
                    id: 'on',
                },
                type: 'PulseEffect',
                value: true,
            },
        ],
        type: 'MultiEffect',
    },
};
describe('rules engine', () => {
    let ruleId = null;
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
    async function deleteRule(id) {
        const res = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.RULES_PATH}/${id}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send();
        expect(res.status).toEqual(200);
    }
    beforeEach(async () => {
        jwt = await (0, user_1.createUser)(common_1.server, user_1.TEST_USER);
        await addDevice(thingLight1);
        await addDevice(thingLight2);
        await addDevice(thingLight3);
    });
    it('gets a list of 0 rules', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });
    it('fails to create a rule', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send({
            trigger: {
                property: null,
                type: 'Whatever',
            },
            effect: testRule.effect,
        });
        expect(err.status).toEqual(400);
    });
    it('creates a rule', async () => {
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(testRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        ruleId = res.body.id;
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toMatchObject(testRule);
    });
    it('gets this rule specifically', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.RULES_PATH}/${ruleId}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toMatchObject(testRule);
    });
    it('fails to get a nonexistent rule specifically', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.RULES_PATH}/1337`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(err.status).toEqual(404);
    });
    it('modifies this rule', async () => {
        let res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.RULES_PATH}/${ruleId}`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(numberTestRule);
        expect(res.status).toEqual(200);
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]).toMatchObject(numberTestRule);
    });
    it('deletes this rule', async () => {
        await deleteRule(ruleId);
        const res = await common_1.chai
            .request(common_1.server)
            .get(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });
    it('fails to delete a nonexistent rule', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .delete(`${Constants.RULES_PATH}/0`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send();
        expect(err.status).toEqual(404);
    });
    it('fails to modify a nonexistent rule', async () => {
        const err = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.RULES_PATH}/0`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(testRule);
        expect(err.status).toEqual(404);
    });
    it('creates and simulates a disabled rule', async () => {
        const disabledRule = Object.assign(testRule, { enabled: false });
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(disabledRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const ruleId = res.body.id;
        res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/${thingLight1.id}/properties/on`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(true));
        res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/${thingLight2.id}/properties/on`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(res.body).toEqual(false);
        await deleteRule(ruleId);
    });
    it('creates and simulates two rules', async () => {
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(numberTestRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const numberTestRuleId = res.body.id;
        res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(mixedTestRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const mixedTestRuleId = res.body.id;
        res = await common_1.chai
            .request(common_1.server)
            .get(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(2);
        expect(res.body[0]).toMatchObject(numberTestRule);
        expect(res.body[1]).toMatchObject(mixedTestRule);
        const ws = await (0, websocket_util_1.webSocketOpen)(`${Constants.THINGS_PATH}/${thingLight3.id}`, jwt);
        // The chain we're expecting is light2.hue > 120 sets light3.bri to 30
        // which sets light3.on to true
        let [resPut, messages] = await Promise.all([
            common_1.chai
                .request(common_1.server)
                .put(`${Constants.THINGS_PATH}/${thingLight2.id}/properties/hue`)
                .type('json')
                .set(...(0, user_1.headerAuth)(jwt))
                .send(JSON.stringify(150)),
            (0, websocket_util_1.webSocketRead)(ws, 7),
        ]);
        expect(resPut.status).toEqual(204);
        expect(Array.isArray(messages)).toBeTruthy();
        expect(messages.length).toEqual(7);
        expect(messages[5]).toMatchObject({
            messageType: Constants.PROPERTY_STATUS,
            data: { bri: 30 },
        });
        expect(messages[6]).toMatchObject({
            messageType: Constants.PROPERTY_STATUS,
            data: { on: true },
        });
        [resPut, messages] = await Promise.all([
            common_1.chai
                .request(common_1.server)
                .put(`${Constants.THINGS_PATH}/${thingLight2.id}/properties/hue`)
                .type('json')
                .set(...(0, user_1.headerAuth)(jwt))
                .send(JSON.stringify(0)),
            (0, websocket_util_1.webSocketRead)(ws, 1),
        ]);
        expect(resPut.status).toEqual(204);
        expect(Array.isArray(messages)).toBeTruthy();
        expect(messages.length).toEqual(1);
        expect(messages[0]).toMatchObject({
            messageType: Constants.PROPERTY_STATUS,
            data: { bri: 100 },
        });
        await deleteRule(numberTestRuleId);
        await deleteRule(mixedTestRuleId);
        await (0, websocket_util_1.webSocketClose)(ws);
    });
    async function getOn(lightId) {
        const res = await common_1.chai
            .request(common_1.server)
            .get(`${Constants.THINGS_PATH}/${lightId}/properties/on`)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt));
        expect(res.status).toEqual(200);
        return res.body;
    }
    async function setOn(lightId, on) {
        const res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/${lightId}/properties/on`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify(on));
        expect(res.status).toEqual(204);
    }
    it('creates and simulates an off rule', async () => {
        // Both lights are on, light1 is turned off, turning light2 off
        await setOn(thingLight1.id, true);
        await setOn(thingLight2.id, true);
        const res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(offRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const ruleId = res.body.id;
        await setOn(thingLight1.id, false);
        await (0, expect_utils_1.waitForExpect)(async () => {
            expect(await getOn(thingLight2.id)).toEqual(false);
        });
        await setOn(thingLight1.id, true);
        await (0, expect_utils_1.waitForExpect)(async () => {
            expect(await getOn(thingLight2.id)).toEqual(true);
        });
        await deleteRule(ruleId);
    });
    it('creates an event and action rule', async () => {
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(eventActionRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const ruleId = res.body.id;
        // Since the rule-engin uses the websocket API "ADD_EVENT_SUBSCRIPTION"
        // for getting the Event, the websocket IO should process before add Event.
        const setImmediatePromise = util_1.default.promisify(setImmediate);
        await setImmediatePromise();
        events_1.default.add(new event_1.default('surge', 'oh no there is too much electricity', thingLight1.id));
        await (0, expect_utils_1.waitForExpect)(async () => {
            res = await common_1.chai
                .request(common_1.server)
                .get(`${Constants.THINGS_PATH}/${thingLight1.id}${Constants.ACTIONS_PATH}`)
                .set('Accept', 'application/json')
                .set(...(0, user_1.headerAuth)(jwt));
            expect(res.status).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toEqual(1);
            expect(res.body[0]).toHaveProperty('blink');
        });
        // dispatch event get action
        await deleteRule(ruleId);
    });
    it('creates and simulates a multi-effect rule', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(multiRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const ruleId = res.body.id;
        await setOn(thingLight1.id, true);
        await (0, expect_utils_1.waitForExpect)(async () => {
            expect(await getOn(thingLight2.id)).toEqual(true);
            expect(await getOn(thingLight3.id)).toEqual(true);
        });
        await setOn(thingLight1.id, false);
        await (0, expect_utils_1.waitForExpect)(async () => {
            expect(await getOn(thingLight2.id)).toEqual(false);
            expect(await getOn(thingLight3.id)).toEqual(false);
        });
        await deleteRule(ruleId);
    });
    it('creates and simulates a string trigger rule', async () => {
        let res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(equalityRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const ruleId = res.body.id;
        res = await common_1.chai
            .request(common_1.server)
            .put(`${Constants.THINGS_PATH}/light3/properties/color`)
            .type('json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(JSON.stringify('#00ff77'));
        expect(res.status).toEqual(204);
        await (0, expect_utils_1.waitForExpect)(async () => {
            expect(await getOn(thingLight3.id)).toEqual(true);
        });
        await deleteRule(ruleId);
    });
    it('creates and simulates a multi trigger rule', async () => {
        const res = await common_1.chai
            .request(common_1.server)
            .post(Constants.RULES_PATH)
            .set('Accept', 'application/json')
            .set(...(0, user_1.headerAuth)(jwt))
            .send(complexTriggerRule);
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('id');
        const ruleId = res.body.id;
        await setOn(thingLight1.id, true);
        await (0, expect_utils_1.waitForExpect)(async () => {
            expect(await getOn(thingLight3.id)).toEqual(true);
        });
        await deleteRule(ruleId);
    });
});
//# sourceMappingURL=index-test.js.map