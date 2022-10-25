"use strict";
/**
 * @module log-timestamps
 *
 * Modifies console.log and friends to prepend a timestamp to log lines.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const callsites_1 = __importDefault(require("callsites"));
const console_1 = require("@jest/console");
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const user_profile_1 = __importDefault(require("./user-profile"));
const util_1 = require("util");
class CustomFormatter {
    transform(info) {
        const level = info.level.toUpperCase().padEnd(7, ' ');
        info.message = `${info.timestamp} ${level}: ${info.message}`;
        return info;
    }
}
const timestampFormat = winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
});
const logger = winston_1.default.createLogger({
    level: 'debug',
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(timestampFormat, new CustomFormatter(), winston_1.default.format.colorize({
                all: true,
                colors: {
                    debug: 'white',
                    info: 'dim white',
                    warn: 'yellow',
                    error: 'red',
                },
            }), winston_1.default.format.printf((info) => info.message)),
        }),
        new winston_daily_rotate_file_1.default({
            dirname: user_profile_1.default.logDir,
            filename: 'run-app.log.%DATE%',
            symlinkName: 'run-app.log',
            createSymlink: true,
            zippedArchive: false,
            maxSize: '10m',
            maxFiles: 10,
            format: winston_1.default.format.combine(timestampFormat, new CustomFormatter(), winston_1.default.format.printf((info) => info.message)),
        }),
    ],
    exitOnError: false,
});
function logPrefix() {
    const currTime = new Date();
    return `${currTime.getFullYear()}-${`0${currTime.getMonth() + 1}`.slice(-2)}-${`0${currTime.getDate()}`.slice(-2)} ${`0${currTime.getHours()}`.slice(-2)}:${`0${currTime.getMinutes()}`.slice(-2)}:${`0${currTime.getSeconds()}`.slice(-2)}.${`00${currTime.getMilliseconds()}`.slice(-3)} `;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
if (!console.constructor.hooked) {
    console.constructor.hooked = true;
    // BufferedConsole is used (under jest) when running multiple tests
    // CustomConsole is used (under jest) when running a single test
    if (console.constructor.name === 'BufferedConsole') {
        // See:
        //   https://github.com/facebook/jest/blob/master/packages/jest-console/src/BufferedConsole.ts
        const bufferedConsole = console;
        console_1.BufferedConsole.write = function (buffer, type, message, level) {
            const call = (0, callsites_1.default)()[level !== null && level !== void 0 ? level : 2];
            const origin = `${call.getFileName()}:${call.getLineNumber()}`;
            buffer.push({ message: logPrefix() + message, origin, type });
            return buffer;
        };
        bufferedConsole.log = function (message, ...args) {
            console_1.BufferedConsole.write(this._buffer, 'log', util_1.format.apply(null, [message, ...args]));
        };
        bufferedConsole.info = function (message, ...args) {
            console_1.BufferedConsole.write(this._buffer, 'info', util_1.format.apply(null, [message, ...args]));
        };
        bufferedConsole.warn = function (message, ...args) {
            console_1.BufferedConsole.write(this._buffer, 'warn', util_1.format.apply(null, [message, ...args]));
        };
        bufferedConsole.error = function (message, ...args) {
            console_1.BufferedConsole.write(this._buffer, 'error', util_1.format.apply(null, [message, ...args]));
        };
        bufferedConsole.debug = function (message, ...args) {
            console_1.BufferedConsole.write(this._buffer, 'debug', util_1.format.apply(null, [message, ...args]));
        };
    }
    else if (console.constructor.name === 'CustomConsole') {
        // See:
        //   https://github.com/facebook/jest/blob/master/packages/jest-console/src/CustomConsole.ts
        const customConsole = console;
        customConsole.log = function (message, ...args) {
            customConsole._log('log', logPrefix() + util_1.format.apply(null, [message, ...args]));
        };
        customConsole.info = function (message, ...args) {
            customConsole._log('info', logPrefix() + util_1.format.apply(null, [message, ...args]));
        };
        customConsole.warn = function (message, ...args) {
            customConsole._log('warn', logPrefix() + util_1.format.apply(null, [message, ...args]));
        };
        customConsole.error = function (message, ...args) {
            customConsole._log('error', logPrefix() + util_1.format.apply(null, [message, ...args]));
        };
        customConsole.debug = function (message, ...args) {
            customConsole._log('debug', logPrefix() + util_1.format.apply(null, [message, ...args]));
        };
    }
    else {
        // This path is for the normal non-jest output
        console.info = function (message, ...args) {
            logger.info(util_1.format.apply(null, [message, ...args]));
        };
        console.debug = function (message, ...args) {
            logger.debug(util_1.format.apply(null, [message, ...args]));
        };
        console.error = function (message, ...args) {
            logger.error(util_1.format.apply(null, [message, ...args]));
        };
        console.warn = function (message, ...args) {
            logger.warn(util_1.format.apply(null, [message, ...args]));
        };
        console.log = console.info;
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
//# sourceMappingURL=log-timestamps.js.map