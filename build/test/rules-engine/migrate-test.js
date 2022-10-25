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
const DatabaseMigrate = __importStar(require("../../rules-engine/DatabaseMigrate"));
const oldRule = {
    enabled: true,
    trigger: {
        type: 'MultiTrigger',
        op: 'AND',
        triggers: [
            {
                property: {
                    name: 'on',
                    type: 'boolean',
                    href: '/things/light1/properties/on',
                },
                type: 'PulseEffect',
                value: true,
            },
        ],
    },
    effect: {
        type: 'MultiEffect',
        effects: [
            {
                type: 'ActionEffect',
                thing: {
                    href: '/things/light1',
                },
                action: 'blink',
            },
        ],
    },
};
const newRule = {
    enabled: true,
    trigger: {
        type: 'MultiTrigger',
        op: 'AND',
        triggers: [
            {
                property: {
                    type: 'boolean',
                    thing: 'light1',
                    id: 'on',
                },
                type: 'PulseEffect',
                value: true,
            },
        ],
    },
    effect: {
        type: 'MultiEffect',
        effects: [
            {
                type: 'ActionEffect',
                thing: 'light1',
                action: 'blink',
            },
        ],
    },
};
describe('rule migrate', () => {
    it('should correctly migrate a rule', () => {
        const newOldRule = DatabaseMigrate.migrate(oldRule);
        expect(newOldRule).toMatchObject(newRule);
    });
    it('should not migrate a new-style rule', () => {
        const changed = DatabaseMigrate.migrate(newRule);
        expect(changed).toBeFalsy();
    });
});
//# sourceMappingURL=migrate-test.js.map