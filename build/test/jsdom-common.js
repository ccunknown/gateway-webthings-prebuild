"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = __importDefault(require("sinon"));
const jsdom_1 = require("jsdom");
// Setup the jsdom environment
const { document } = new jsdom_1.JSDOM('<!doctype html><html><body></body></html>').window;
global.document = document;
global.window = document.defaultView;
global.navigator = global.window.navigator;
const storage = new Map();
global.localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, `${value}`),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    key: (idx) => Array.from(storage.keys())[idx],
    get length() {
        return storage.size;
    },
};
beforeEach(() => {
    global.sandbox = sinon_1.default.createSandbox();
});
afterEach(() => {
    global.sandbox.restore();
    // Clean up any nodes added to the DOM
    document.body.innerHTML = '';
});
//# sourceMappingURL=jsdom-common.js.map