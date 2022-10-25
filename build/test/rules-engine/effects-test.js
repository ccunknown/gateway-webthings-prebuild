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
const Effects = __importStar(require("../../rules-engine/effects/index"));
const pulseEffect = {
    property: {
        type: 'boolean',
        thing: 'light1',
        id: 'on',
    },
    type: 'PulseEffect',
    value: true,
};
const setEffect = {
    property: {
        type: 'number',
        thing: 'thermostat',
        id: 'temp',
        unit: 'celsius',
        description: 'thermostat setpoint',
    },
    type: 'SetEffect',
    value: 30,
};
const bothEffect = {
    effects: [pulseEffect, setEffect],
    type: 'MultiEffect',
};
describe('effects', () => {
    it('should parse a PulseEffect', () => {
        const effect = Effects.fromDescription(pulseEffect);
        expect(effect).toMatchObject(pulseEffect);
    });
    it('should parse a SetEffect', () => {
        const effect = Effects.fromDescription(setEffect);
        expect(effect).toMatchObject(setEffect);
    });
    it('should parse a MultiEffect', () => {
        const effect = Effects.fromDescription(bothEffect);
        expect(effect).toMatchObject(bothEffect);
    });
    it('should reject an unknown effect type', () => {
        let err = null;
        try {
            Effects.fromDescription({ type: 'LimaEffect' });
        }
        catch (e) {
            err = e;
        }
        expect(err).toBeTruthy();
    });
    it('should reject a value type disagreeing with property type', () => {
        let err = null;
        try {
            Effects.fromDescription(Object.assign({}, pulseEffect, { value: 12 }));
        }
        catch (e) {
            err = e;
        }
        expect(err).toBeTruthy();
    });
    it('should reject an effect without a property', () => {
        let err = null;
        try {
            const brokenEffect = Object.assign({}, setEffect);
            delete brokenEffect.property;
            Effects.fromDescription(brokenEffect);
        }
        catch (e) {
            err = e;
        }
        expect(err).toBeTruthy();
    });
});
//# sourceMappingURL=effects-test.js.map