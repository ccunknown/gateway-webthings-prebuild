"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const browser_common_1 = require("../browser-common");
const express_1 = __importDefault(require("express"));
const test_utils_1 = require("../test-utils");
const expect_utils_1 = require("../../expect-utils");
const things_page_1 = require("../page-object/things-page");
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
describe('Thing', () => {
    it('should render an unknown thing and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'UnknownThing',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': [],
            properties: {
                numberProp: {
                    value: 10,
                    type: 'number',
                    unit: 'percent',
                },
                stringProp: {
                    value: 'bar',
                    type: 'string',
                },
                booleanProp: {
                    value: true,
                    type: 'boolean',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        const detailPage = await things[0].openDetailPage();
        // We have to wait connecting websocket.
        await detailPage.waitForBooleanProperties();
        const waitWebSocketPromise = util_1.default.promisify(setImmediate);
        await waitWebSocketPromise();
        // Check boolean property
        const booleanProps = await detailPage.booleanProperties();
        expect(booleanProps.length).toEqual(1);
        const booleanValue = await booleanProps[0].getValue();
        expect(booleanValue).toBeTruthy();
        await booleanProps[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val1 = await (0, test_utils_1.getProperty)(desc.id, 'booleanProp');
            expect(val1).not.toBeTruthy();
            const val2 = await booleanProps[0].getValue();
            expect(val2).not.toBeTruthy();
        });
        await (0, test_utils_1.setProperty)(desc.id, 'booleanProp', true);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val3 = await booleanProps[0].getValue();
            expect(val3).toBeTruthy();
        });
        // Check number property
        const numberProps = await detailPage.numberProperties();
        expect(numberProps.length).toEqual(1);
        const numberValue = await numberProps[0].getValue();
        expect(numberValue).toEqual(10);
        await numberProps[0].setValue(20);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val1 = await (0, test_utils_1.getProperty)(desc.id, 'numberProp');
            expect(val1).toEqual(20);
            const val2 = await numberProps[0].getValue();
            expect(val2).toEqual(20);
        });
        await (0, test_utils_1.setProperty)(desc.id, 'numberProp', 5);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val3 = await numberProps[0].getValue();
            expect(val3).toEqual(5);
        });
        // Check string property
        const stringProps = await detailPage.stringProperties();
        expect(stringProps.length).toEqual(1);
        const stringValue = await stringProps[0].getValue();
        expect(stringValue).toEqual('bar');
        await stringProps[0].setValue('foo');
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val1 = await (0, test_utils_1.getProperty)(desc.id, 'stringProp');
            expect(val1).toEqual('foo');
            const val2 = await stringProps[0].getValue();
            if (val2 !== 'foo') {
                await stringProps[0].setValue('foo');
            }
            expect(val2).toEqual('foo');
        });
        await (0, test_utils_1.setProperty)(desc.id, 'stringProp', 'foobar');
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val3 = await stringProps[0].getValue();
            expect(val3).toEqual('foobar');
        });
    });
    it('should render a thing with spaced property names', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'spacedPropertyThings',
            title: 'battery sensor',
            '@context': 'https://webthings.io/schemas',
            '@type': [],
            properties: {
                'spaced number': {
                    value: 10,
                    type: 'number',
                    unit: 'percent',
                },
                'spaced string': {
                    value: 'foo',
                    type: 'string',
                },
                'spaced boolean': {
                    value: true,
                    type: 'boolean',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        const detailPage = await things[0].openDetailPage();
        await detailPage.waitForBooleanProperties();
        const booleanProps = await detailPage.booleanProperties();
        expect(booleanProps.length).toEqual(1);
        const booleanValue = await booleanProps[0].getValue();
        expect(booleanValue).toBeTruthy();
        const booleanId = await booleanProps[0].getId();
        expect(booleanId).toEqual(`boolean-${(0, test_utils_1.escapeHtmlForIdClass)('spaced boolean')}`);
        const numberProps = await detailPage.numberProperties();
        expect(numberProps.length).toEqual(1);
        const numberValue = await numberProps[0].getValue();
        expect(numberValue).toEqual(10);
        const numberId = await numberProps[0].getId();
        expect(numberId).toEqual(`number-${(0, test_utils_1.escapeHtmlForIdClass)('spaced number')}`);
        const stringProps = await detailPage.stringProperties();
        expect(stringProps.length).toEqual(1);
        const stringValue = await stringProps[0].getValue();
        expect(stringValue).toEqual('foo');
        const stringId = await stringProps[0].getId();
        expect(stringId).toEqual(`string-${(0, test_utils_1.escapeHtmlForIdClass)('spaced string')}`);
    });
    // TODO: Fix or remove test case (https://github.com/WebThingsIO/gateway/issues/2906)
    it.skip('should reset property value when setProperty is rejected', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'UnknownThing',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': [],
            properties: {
                rejectPropertyNum: {
                    value: 10,
                    type: 'number',
                    unit: 'percent',
                },
                rejectPropertyStr: {
                    value: 'bar',
                    type: 'string',
                },
                rejectPropertyBool: {
                    value: true,
                    type: 'boolean',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        const detailPage = await things[0].openDetailPage();
        // We have to wait connecting websocket.
        await detailPage.waitForBooleanProperties();
        const waitWebSocketPromise = util_1.default.promisify(setImmediate);
        await waitWebSocketPromise();
        // Check boolean property
        const booleanProps = await detailPage.booleanProperties();
        expect(booleanProps.length).toEqual(1);
        const booleanValue = await booleanProps[0].getValue();
        expect(booleanValue).toBeTruthy();
        await booleanProps[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val1 = await (0, test_utils_1.getProperty)(desc.id, 'rejectPropertyBool');
            expect(val1).toBeTruthy();
            const val2 = await booleanProps[0].getValue();
            expect(val2).toBeTruthy();
        });
        // Check number property
        const numberProps = await detailPage.numberProperties();
        expect(numberProps.length).toEqual(1);
        const numberValue = await numberProps[0].getValue();
        expect(numberValue).toEqual(10);
        await numberProps[0].setValue(20);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val1 = await (0, test_utils_1.getProperty)(desc.id, 'rejectPropertyNum');
            expect(val1).toEqual(10);
            const val2 = await numberProps[0].getValue();
            expect(val2).toEqual(10);
        });
        // Check string property
        const stringProps = await detailPage.stringProperties();
        expect(stringProps.length).toEqual(1);
        const stringValue = await stringProps[0].getValue();
        expect(stringValue).toEqual('bar');
        await stringProps[0].setValue('foo');
        await (0, expect_utils_1.waitForExpect)(async () => {
            const val1 = await (0, test_utils_1.getProperty)(desc.id, 'rejectPropertyStr');
            expect(val1).toEqual('bar');
            const val2 = await stringProps[0].getValue();
            expect(val2).toEqual('bar');
        });
    });
    it('should render an onOffLight and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'onOffLight',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['Light', 'OnOffSwitch'],
            properties: {
                power: {
                    '@type': 'OnOffProperty',
                    value: false,
                    type: 'boolean',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await things[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on).toBeTruthy();
        });
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await thingsPage.waitForOffThings();
        const detailPage = await things[0].openDetailPage();
        expect(detailPage).toBeTruthy();
    });
    it('should render an onOffSwitch and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'onOffSwitch',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['OnOffSwitch'],
            properties: {
                power: {
                    '@type': 'OnOffProperty',
                    value: false,
                    type: 'boolean',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        let things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await things[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on).toBeTruthy();
        });
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await thingsPage.waitForOffThings();
        things = await thingsPage.things();
        const detailPage = await things[0].openDetailPage();
        expect(detailPage).toBeTruthy();
    });
    it('should render a dimmableLight and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'dimmableLight',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['Light', 'OnOffSwitch'],
            properties: {
                power: {
                    '@type': 'OnOffProperty',
                    value: false,
                    type: 'boolean',
                },
                brightness: {
                    '@type': 'BrightnessProperty',
                    value: 0,
                    type: 'number',
                    unit: 'percent',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await things[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on).toBeTruthy();
        });
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'brightness', 50);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingLevelDisplayed();
            expect(level).toEqual('50%');
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await thingsPage.waitForOffThings();
        const things2 = await thingsPage.things();
        const detailPage = await things2[0].openDetailPage();
        expect(detailPage).toBeTruthy();
        // We have to wait connecting websocket.
        await detailPage.waitForOffThing();
        const waitWebSocketPromise = util_1.default.promisify(setImmediate);
        await waitWebSocketPromise();
        // Check onOff property
        const onOffProperty = await detailPage.onOffProperty();
        const on1 = await onOffProperty.getValue();
        expect(on1).not.toBeTruthy();
        await onOffProperty.click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on2 = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on2).toBeTruthy();
            const on3 = await onOffProperty.getValue();
            expect(on3).toBeTruthy();
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on4 = await onOffProperty.getValue();
            expect(on4).not.toBeTruthy();
        });
        // Check level property
        const brightnessProperty = await detailPage.brightnessProperty();
        const brightness1 = await brightnessProperty.getValue();
        expect(brightness1).toEqual(50);
        await brightnessProperty.setValue(20);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const brightness2 = await (0, test_utils_1.getProperty)(desc.id, 'brightness');
            expect(brightness2).toEqual(20);
            const brightness3 = await brightnessProperty.getValue();
            expect(brightness3).toEqual(20);
        });
        await (0, test_utils_1.setProperty)(desc.id, 'brightness', 60);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const brightness4 = await brightnessProperty.getValue();
            expect(brightness4).toEqual(60);
        });
    });
    it('should render an onOffColorLight and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'onOffColorLight',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['Light', 'ColorControl', 'OnOffSwitch'],
            properties: {
                power: {
                    '@type': 'OnOffProperty',
                    value: false,
                    type: 'boolean',
                },
                rgb: {
                    '@type': 'ColorProperty',
                    value: '#ffffff',
                    type: 'string',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await things[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on).toBeTruthy();
        });
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'rgb', '#6789ab');
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingColorDisplayed();
            expect(level).toEqual('#6789ab');
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await thingsPage.waitForOffThings();
        const things2 = await thingsPage.things();
        const detailPage = await things2[0].openDetailPage();
        expect(detailPage).toBeTruthy();
        // We have to wait connecting websocket.
        await detailPage.waitForOffThing();
        const waitWebSocketPromise = util_1.default.promisify(setImmediate);
        await waitWebSocketPromise();
        // Check onOff property
        const onOffProperty = await detailPage.onOffProperty();
        const on1 = await onOffProperty.getValue();
        expect(on1).not.toBeTruthy();
        await onOffProperty.click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on2 = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on2).toBeTruthy();
            const on3 = await onOffProperty.getValue();
            expect(on3).toBeTruthy();
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on4 = await onOffProperty.getValue();
            expect(on4).not.toBeTruthy();
        });
    });
    it('should render a dimmableColorLight and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'dimmableColorLight',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['Light', 'ColorControl', 'OnOffSwitch'],
            properties: {
                power: {
                    '@type': 'OnOffProperty',
                    value: false,
                    type: 'boolean',
                },
                brightness: {
                    '@type': 'BrightnessProperty',
                    value: 0,
                    type: 'number',
                    unit: 'percent',
                },
                rgb: {
                    '@type': 'ColorProperty',
                    value: '#ffffff',
                    type: 'string',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await things[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on).toBeTruthy();
        });
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'brightness', 50);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingLevelDisplayed();
            expect(level).toEqual('50%');
        });
        await (0, test_utils_1.setProperty)(desc.id, 'rgb', '#56789a');
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingColorDisplayed();
            expect(level).toEqual('#56789a');
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await thingsPage.waitForOffThings();
        const things2 = await thingsPage.things();
        const detailPage = await things2[0].openDetailPage();
        expect(detailPage).toBeTruthy();
        // We have to wait connecting websocket.
        await detailPage.waitForOffThing();
        const waitWebSocketPromise = util_1.default.promisify(setImmediate);
        await waitWebSocketPromise();
        // Check onOff property
        const onOffProperty = await detailPage.onOffProperty();
        const on1 = await onOffProperty.getValue();
        expect(on1).not.toBeTruthy();
        await onOffProperty.click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on2 = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on2).toBeTruthy();
            const on3 = await onOffProperty.getValue();
            expect(on3).toBeTruthy();
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on4 = await onOffProperty.getValue();
            expect(on4).not.toBeTruthy();
        });
        // Check level property
        const levelProperty = await detailPage.brightnessProperty();
        const level1 = await levelProperty.getValue();
        expect(level1).toEqual(50);
        await levelProperty.setValue(20);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const level2 = await (0, test_utils_1.getProperty)(desc.id, 'brightness');
            expect(level2).toEqual(20);
            const level3 = await levelProperty.getValue();
            expect(level3).toEqual(20);
        });
        await (0, test_utils_1.setProperty)(desc.id, 'brightness', 60);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const level4 = await levelProperty.getValue();
            expect(level4).toEqual(60);
        });
    });
    it('should render a multiLevelSwitch and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'multiLevelSwitch',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['MultiLevelSwitch', 'OnOffSwitch'],
            properties: {
                power: {
                    '@type': 'OnOffProperty',
                    value: false,
                    type: 'boolean',
                },
                percent: {
                    '@type': 'LevelProperty',
                    value: 0,
                    type: 'number',
                    unit: 'percent',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await things[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on).toBeTruthy();
        });
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'percent', 50);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingLevelDisplayed();
            expect(level).toEqual('50%');
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await thingsPage.waitForOffThings();
        const things2 = await thingsPage.things();
        const detailPage = await things2[0].openDetailPage();
        expect(detailPage).toBeTruthy();
        // We have to wait connecting websocket.
        await detailPage.waitForOffThing();
        const waitWebSocketPromise = util_1.default.promisify(setImmediate);
        await waitWebSocketPromise();
        // Check onOff property
        const onOffProperty = await detailPage.onOffProperty();
        const on1 = await onOffProperty.getValue();
        expect(on1).not.toBeTruthy();
        await onOffProperty.click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on2 = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on2).toBeTruthy();
            const on3 = await onOffProperty.getValue();
            expect(on3).toBeTruthy();
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on4 = await onOffProperty.getValue();
            expect(on4).not.toBeTruthy();
        });
        // Check level property
        const levelProperty = await detailPage.levelProperty();
        const level1 = await levelProperty.getValue();
        expect(level1).toEqual(50);
        await levelProperty.setValue(20);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const level2 = await (0, test_utils_1.getProperty)(desc.id, 'percent');
            expect(level2).toEqual(20);
            const level3 = await levelProperty.getValue();
            expect(level3).toEqual(20);
        });
        await (0, test_utils_1.setProperty)(desc.id, 'percent', 60);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const level4 = await levelProperty.getValue();
            expect(level4).toEqual(60);
        });
    });
    it('should render a smartPlug and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'smartPlug',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['SmartPlug', 'EnergyMonitor', 'MultiLevelSwitch', 'OnOffSwitch'],
            properties: {
                power: {
                    '@type': 'OnOffProperty',
                    value: false,
                    type: 'boolean',
                },
                percent: {
                    '@type': 'LevelProperty',
                    value: 0,
                    type: 'number',
                    unit: 'percent',
                },
                energyPower: {
                    '@type': 'InstantaneousPowerProperty',
                    value: 0,
                    type: 'number',
                    unit: 'watt',
                },
                energyVoltage: {
                    '@type': 'VoltageProperty',
                    value: 0,
                    type: 'number',
                    unit: 'volt',
                },
                energyCurrent: {
                    '@type': 'CurrentProperty',
                    value: 0,
                    type: 'number',
                    unit: 'ampere',
                },
                energyFrequency: {
                    '@type': 'FrequencyProperty',
                    value: 0,
                    type: 'number',
                    unit: 'hertz',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await things[0].click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on).toBeTruthy();
        });
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'energyPower', 50);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingPowerDisplayed();
            expect(level).toEqual('50 W');
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await thingsPage.waitForOffThings();
        const things2 = await thingsPage.things();
        const detailPage = await things2[0].openDetailPage();
        expect(detailPage).toBeTruthy();
        // Thing Detail View
        // We have to wait connecting websocket.
        await detailPage.waitForOffThing();
        const waitWebSocketPromise = util_1.default.promisify(setImmediate);
        await waitWebSocketPromise();
        // Check onOff property
        const onOffProperty = await detailPage.onOffProperty();
        const on1 = await onOffProperty.getValue();
        expect(on1).not.toBeTruthy();
        await onOffProperty.click();
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on2 = await (0, test_utils_1.getProperty)(desc.id, 'power');
            expect(on2).toBeTruthy();
            const on3 = await onOffProperty.getValue();
            expect(on3).toBeTruthy();
        });
        await (0, test_utils_1.setProperty)(desc.id, 'power', false);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const on4 = await onOffProperty.getValue();
            expect(on4).not.toBeTruthy();
        });
        // Check level property
        const levelProperty = await detailPage.levelProperty();
        const level1 = await levelProperty.getValue();
        expect(level1).toEqual(0);
        await levelProperty.setValue(20);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const level2 = await (0, test_utils_1.getProperty)(desc.id, 'percent');
            if (level2 !== 20) {
                await levelProperty.setValue(20);
            }
            expect(level2).toEqual(20);
            const level3 = await levelProperty.getValue();
            expect(level3).toEqual(20);
        });
        await (0, test_utils_1.setProperty)(desc.id, 'percent', 60);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const level4 = await levelProperty.getValue();
            expect(level4).toEqual(60);
        });
        // Check power property
        const powerProperty = await detailPage.powerProperty();
        const power1 = await powerProperty.getDisplayedText();
        expect(power1).toEqual('50W');
        await (0, test_utils_1.setProperty)(desc.id, 'energyPower', 60);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const power2 = await powerProperty.getDisplayedText();
            expect(power2).toEqual('60W');
        });
        // Check voltage property
        const voltageProperty = await detailPage.voltageProperty();
        const voltage1 = await voltageProperty.getDisplayedText();
        expect(voltage1).toEqual('0V');
        await (0, test_utils_1.setProperty)(desc.id, 'energyVoltage', 30);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const voltage2 = await voltageProperty.getDisplayedText();
            expect(voltage2).toEqual('30V');
        });
        // Check current property
        const currentProperty = await detailPage.currentProperty();
        const current1 = await currentProperty.getDisplayedText();
        expect(current1).toEqual('0.0A');
        await (0, test_utils_1.setProperty)(desc.id, 'energyCurrent', 40);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const current2 = await currentProperty.getDisplayedText();
            expect(current2).toEqual('40.0A');
        });
        // Check current property
        const frequencyProperty = await detailPage.frequencyProperty();
        const frequency1 = await frequencyProperty.getDisplayedText();
        expect(frequency1).toEqual('0Hz');
        await (0, test_utils_1.setProperty)(desc.id, 'energyFrequency', 10);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const frequency2 = await frequencyProperty.getDisplayedText();
            expect(frequency2).toEqual('10Hz');
        });
    });
    it('should render a binarySensor and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'binarySensor',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['BinarySensor'],
            properties: {
                active: {
                    '@type': 'BooleanProperty',
                    value: false,
                    type: 'boolean',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForOffThings();
        let things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await (0, test_utils_1.setProperty)(desc.id, 'active', true);
        await thingsPage.waitForOnThings();
        await (0, test_utils_1.setProperty)(desc.id, 'active', false);
        await thingsPage.waitForOffThings();
        things = await thingsPage.things();
        const detailPage = await things[0].openDetailPage();
        expect(detailPage).toBeTruthy();
    });
    it('should render a multiLevelSensor and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'multiLevelSensor',
            title: 'foofoo',
            '@context': 'https://webthings.io/schemas',
            '@type': ['MultiLevelSensor'],
            properties: {
                active: {
                    '@type': 'BooleanProperty',
                    value: false,
                    type: 'boolean',
                },
                percent: {
                    '@type': 'LevelProperty',
                    value: 0,
                    type: 'number',
                    unit: 'percent',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await (0, test_utils_1.setProperty)(desc.id, 'percent', 50);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingLevelDisplayed();
            expect(level).toEqual('50%');
        });
        const things2 = await thingsPage.things();
        const detailPage = await things2[0].openDetailPage();
        expect(detailPage).toBeTruthy();
    });
    it('should render a humidity sensor and be able to change properties', async () => {
        const browser = (0, browser_common_1.getBrowser)();
        const desc = {
            id: 'humiditySensor',
            title: 'Humidity',
            '@context': 'https://webthings.io/schemas',
            '@type': ['HumiditySensor'],
            properties: {
                humidity: {
                    '@type': 'HumidityProperty',
                    value: 0,
                    type: 'number',
                    unit: 'percent',
                },
            },
        };
        await (0, test_utils_1.addThing)(desc);
        const thingsPage = new things_page_1.ThingsPage(browser);
        await thingsPage.wait();
        await thingsPage.open();
        await thingsPage.waitForThings();
        const things = await thingsPage.things();
        expect(things.length).toEqual(1);
        const thingTitle = await things[0].thingTitle();
        expect(thingTitle).toEqual(desc.title);
        await (0, test_utils_1.setProperty)(desc.id, 'humidity', 50);
        await (0, expect_utils_1.waitForExpect)(async () => {
            const things = await thingsPage.things();
            const level = await things[0].thingLevelDisplayed();
            expect(level).toEqual('50%');
        });
        const things2 = await thingsPage.things();
        const detailPage = await things2[0].openDetailPage();
        expect(detailPage).toBeTruthy();
    });
    describe('Assets based things', () => {
        let assetServer;
        beforeAll(async () => {
            const app = (0, express_1.default)();
            app.use('/assets', express_1.default.static(path_1.default.join(__dirname, 'assets')));
            assetServer = app.listen();
            return new Promise((resolve, reject) => {
                assetServer.once('listening', resolve).once('error', reject);
            });
        });
        it('should render camera image and show image', async () => {
            const browser = (0, browser_common_1.getBrowser)();
            const desc = {
                id: 'Camera',
                title: 'Camera',
                '@context': 'https://webthings.io/schemas',
                '@type': ['Camera'],
                properties: {
                    photo: {
                        '@type': 'ImageProperty',
                        type: 'null',
                        forms: [
                            {
                                href: `http://localhost:${assetServer.address().port}/assets/image.png`,
                                contentType: 'image/png',
                            },
                        ],
                    },
                },
            };
            await (0, test_utils_1.addThing)(desc);
            const thingsPage = new things_page_1.ThingsPage(browser);
            await thingsPage.open();
            await thingsPage.waitForThings();
            const things = await thingsPage.things();
            expect(things.length).toEqual(1);
            const thingTitle = await things[0].thingTitle();
            expect(thingTitle).toEqual(desc.title);
            const detailPage = await things[0].openDetailPage();
            expect(detailPage).toBeTruthy();
            const photoProperty = await detailPage.photoProperty();
            expect(photoProperty).toBeTruthy();
            await photoProperty.click();
            await browser.waitUntil(async () => {
                var _a;
                const el = await browser.$('.media-modal-image');
                console.log(!el.error, (_a = el.error) === null || _a === void 0 ? void 0 : _a.message);
                return !el.error;
            }, { timeout: 6000000 });
            const img = await browser.$('.media-modal-image');
            expect(await img.getAttribute('src')).toBeTruthy();
        });
        it('should render video camera and show video', async () => {
            const browser = (0, browser_common_1.getBrowser)();
            const desc = {
                id: 'VideoCamera',
                title: 'VideoCamera',
                '@context': 'https://webthings.io/schemas',
                '@type': ['VideoCamera'],
                properties: {
                    video: {
                        '@type': 'VideoProperty',
                        type: 'null',
                        forms: [
                            {
                                href: `http://localhost:${assetServer.address().port}/assets/test.m3u8`,
                                contentType: 'application/vnd.apple.mpegurl',
                            },
                        ],
                    },
                },
            };
            await (0, test_utils_1.addThing)(desc);
            const thingsPage = new things_page_1.ThingsPage(browser);
            await thingsPage.open();
            await thingsPage.waitForThings();
            const things = await thingsPage.things();
            expect(things.length).toEqual(1);
            const thingTitle = await things[0].thingTitle();
            expect(thingTitle).toEqual(desc.title);
            const detailPage = await things[0].openDetailPage();
            expect(detailPage).toBeTruthy();
            const videoProperty = await detailPage.videoProperty();
            expect(videoProperty).toBeTruthy();
            await videoProperty.click();
            await browser.waitUntil(async () => {
                const el = await browser.$('.media-modal-video');
                return !el.error;
            }, { timeout: 6000000 });
            const videoElement = await browser.$('.media-modal-video');
            const result = await videoElement.executeAsync(function (done) {
                // Browser context disabling unwanted ts features
                /* eslint-disable @typescript-eslint/ban-ts-comment, no-undefined */
                const video = document.querySelector('.media-modal-video');
                // @ts-ignore
                video.addEventListener('error', function (error) {
                    done(error);
                });
                // @ts-ignore
                video.addEventListener('playing', function () {
                    done(undefined);
                });
                // @ts-ignore
                video.play().catch((e) => {
                    done(e);
                });
                /* eslint-enable @typescript-eslint/ban-ts-comment, no-undefined */
            });
            expect(result).toBeUndefined();
        });
        afterAll(() => {
            assetServer.close();
        });
    });
});
//# sourceMappingURL=thing-test.js.map