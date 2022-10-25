"use strict";
/**
 * Utility functions.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectFormHref = exports.adjustInputValue = exports.sortCapabilities = exports.colorTemperatureToRGB = exports.throttle = exports.debounce = exports.fuzzyTime = exports.escapeHtmlForIdClass = exports.unescapeHtml = exports.escapeHtml = exports.capitalize = void 0;
const Fluent = __importStar(require("./fluent"));
/**
 * @param {String} str
 * @return {String} the string with the first letter capitalized
 */
function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
}
exports.capitalize = capitalize;
function escapeHtml(text) {
    if (typeof text !== 'string') {
        text = `${text}`;
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/°/g, '&deg;')
        .replace(/⋅/g, '&sdot;');
}
exports.escapeHtml = escapeHtml;
function unescapeHtml(text) {
    if (typeof text !== 'string') {
        text = `${text}`;
    }
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'") // eslint-disable-line @typescript-eslint/quotes
        .replace(/&deg;/g, '°')
        .replace(/&sdot;/g, '⋅');
}
exports.unescapeHtml = unescapeHtml;
function escapeHtmlForIdClass(text) {
    if (typeof text !== 'string') {
        text = `${text}`;
    }
    text = text.replace(/[^_a-zA-Z0-9-]/g, '_');
    if (/^[0-9-]/.test(text)) {
        text = `_${text}`;
    }
    return text;
}
exports.escapeHtmlForIdClass = escapeHtmlForIdClass;
function fuzzyTime(date) {
    const now = new Date().getTime();
    const delta = Math.round((now - date) / 1000);
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    let fuzzy;
    if (delta < 5) {
        fuzzy = Fluent.getMessage('utils-now');
    }
    else if (delta < minute) {
        fuzzy = Fluent.getMessage('utils-seconds-ago', { value: delta });
    }
    else if (delta < hour) {
        fuzzy = Fluent.getMessage('utils-minutes-ago', { value: Math.floor(delta / minute) });
    }
    else if (delta < day) {
        fuzzy = Fluent.getMessage('utils-hours-ago', { value: Math.floor(delta / hour) });
    }
    else if (delta < week) {
        fuzzy = Fluent.getMessage('utils-days-ago', { value: Math.floor(delta / day) });
    }
    else if (delta < month) {
        fuzzy = Fluent.getMessage('utils-weeks-ago', { value: Math.floor(delta / week) });
    }
    else if (delta < year) {
        fuzzy = Fluent.getMessage('utils-months-ago', { value: Math.floor(delta / month) });
    }
    else {
        fuzzy = Fluent.getMessage('utils-years-ago', { value: Math.floor(delta / year) });
    }
    return fuzzy;
}
exports.fuzzyTime = fuzzyTime;
function debounce(delay, callback) {
    return throttle(delay, callback, true);
}
exports.debounce = debounce;
function throttle(delay, callback, debounceMode = false) {
    let timeout = null;
    let lastExec = 0;
    const throttleMode = !debounceMode;
    return function wrapper(...args) {
        const elapsed = Number(new Date()) - lastExec;
        const exec = () => {
            lastExec = Number(new Date());
            callback(args);
        };
        if (timeout) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clearTimeout(timeout);
            timeout = null;
        }
        if (throttleMode === true && elapsed > delay) {
            exec();
        }
        else {
            timeout = setTimeout(exec, debounceMode ? delay : delay - elapsed);
        }
    };
}
exports.throttle = throttle;
function colorTemperatureToRGB(value) {
    /**
     * Algorithm found here:
     * http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
     */
    value /= 100;
    let r;
    if (value <= 66) {
        r = 255;
    }
    else {
        r = value - 60;
        r = 329.698727446 * r ** -0.1332047592;
        r = Math.max(r, 0);
        r = Math.min(r, 255);
    }
    let g;
    if (value <= 66) {
        g = value;
        g = 99.4708025861 * Math.log(g) - 161.1195681661;
    }
    else {
        g = value - 60;
        g = 288.1221695283 * g ** -0.0755148492;
    }
    g = Math.max(g, 0);
    g = Math.min(g, 255);
    let b;
    if (value >= 66) {
        b = 255;
    }
    else if (value <= 19) {
        b = 0;
    }
    else {
        b = value - 10;
        b = 138.5177312231 * Math.log(b) - 305.0447927307;
        b = Math.max(b, 0);
        b = Math.min(b, 255);
    }
    r = Math.round(r).toString(16);
    g = Math.round(g).toString(16);
    b = Math.round(b).toString(16);
    return `#${r}${g}${b}`;
}
exports.colorTemperatureToRGB = colorTemperatureToRGB;
function sortCapabilities(capabilities) {
    // copy the array, as we're going to sort in place.
    const list = capabilities.slice();
    const priority = [
        'Lock',
        'Thermostat',
        'VideoCamera',
        'Camera',
        'SmartPlug',
        'Light',
        'MultiLevelSwitch',
        'OnOffSwitch',
        'ColorControl',
        'ColorSensor',
        'EnergyMonitor',
        'DoorSensor',
        'MotionSensor',
        'LeakSensor',
        'SmokeSensor',
        'PushButton',
        'TemperatureSensor',
        'HumiditySensor',
        'MultiLevelSensor',
        'Alarm',
        'BinarySensor',
        'BarometricPressureSensor',
        'AirQualitySensor',
    ];
    list.sort((a, b) => {
        if (!priority.includes(a) && !priority.includes(b)) {
            return 0;
        }
        else if (!priority.includes(a)) {
            return 1;
        }
        else if (!priority.includes(b)) {
            return -1;
        }
        return priority.indexOf(a) - priority.indexOf(b);
    });
    return list;
}
exports.sortCapabilities = sortCapabilities;
/**
 * Adjust an input value to match schema bounds.
 *
 * @param {number} value - Value to adjust
 * @returns {number} Adjusted value
 */
function adjustInputValue(value, schema) {
    if (typeof value !== 'number') {
        return value;
    }
    let multipleOf = schema.multipleOf;
    if (typeof multipleOf !== 'number' && schema.type === 'integer') {
        multipleOf = 1;
    }
    if (typeof multipleOf === 'number') {
        value = Math.round(value / multipleOf) * multipleOf;
        // Deal with floating point nonsense
        if (`${multipleOf}`.includes('.')) {
            const precision = `${multipleOf}`.split('.')[1].length;
            value = Number(value.toFixed(precision));
        }
    }
    if (schema.hasOwnProperty('minimum')) {
        value = Math.max(value, schema.minimum);
    }
    if (schema.hasOwnProperty('maximum')) {
        value = Math.min(value, schema.maximum);
    }
    // If there is an enum, match the closest enum value
    if (schema.hasOwnProperty('enum')) {
        value = schema.enum.sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0];
    }
    return value;
}
exports.adjustInputValue = adjustInputValue;
/**
 * Finds the gateway api endpoint for a specific operation.
 * It uses the assumption that gateway enpoints are pushed to
 * the form array as the last element.
 *
 * @param {Array} forms The list of forms.
 * @param {string} operation
 * @returns {string | undefined} the href of the select form or undefined if not found.
 */
function selectFormHref(forms, operation, base) {
    var _a;
    return (_a = [...forms].reverse().find((selectedForm) => {
        var _a, _b;
        try {
            const { protocol } = new URL(selectedForm.href, base);
            return ((protocol === 'http:' || protocol === 'https:') &&
                (!selectedForm.op || selectedForm.op === operation || ((_a = selectedForm.op) === null || _a === void 0 ? void 0 : _a.includes(operation))));
        }
        catch (error) {
            if (error instanceof TypeError) {
                // URL is relative and no base was given or not well formatted
                return (!selectedForm.op || selectedForm.op === operation || ((_b = selectedForm.op) === null || _b === void 0 ? void 0 : _b.includes(operation)));
            }
            throw error;
        }
    })) === null || _a === void 0 ? void 0 : _a.href;
}
exports.selectFormHref = selectFormHref;
//# sourceMappingURL=utils.js.map