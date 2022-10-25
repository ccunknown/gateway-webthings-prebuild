"use strict";
/**
 * Validate data with JSON-schema.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This Source Code includes react-jsonschema-form
 * released under the Apache License 2.0.
 * https://github.com/mozilla-services/react-jsonschema-form
 * Date on whitch referred: Thu, Mar 08, 2018  1:08:52 PM
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
class Validator {
    constructor() {
        this._ajv = new ajv_1.default({
            allErrors: true,
        });
        this._reEscapeChar = /\\(\\)?/g;
        this._rePropName = RegExp(
        // Match anything that isn't a dot or bracket.
        '[^.[\\]]+|' +
            // Or match property names within brackets.
            '\\[(?:' +
            // Match a non-string expression.
            '([^"\'].*)|' +
            // Or match strings (supports escaping characters).
            '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
            ')\\]|' +
            // Or match "" as the space between consecutive dots or empty brackets.
            '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))', 'g');
    }
    _toPath(s) {
        const result = [];
        s.replace(this._rePropName, (match, expression, quote, subString) => {
            let key = match;
            if (quote) {
                key = subString.replace(this._reEscapeChar, '$1');
            }
            else if (expression) {
                key = expression.trim();
            }
            result.push(key);
            return match;
        });
        return result;
    }
    _toErrorSchema(errors) {
        // Transforms a ajv validation errors list:
        // [
        //   {dataPath: ".level1.level2[2].level3", message: "err a"},
        //   {dataPath: ".level1.level2[2].level3", message: "err b"},
        //   {dataPath: ".level1.level2[4].level3", message: "err b"},
        // ]
        // Into an error tree:
        // {
        //   level1: {
        //     level2: {
        //       2: {level3: {errors: ["err a", "err b"]}},
        //       4: {level3: {errors: ["err b"]}},
        //     }
        //   }
        // };
        if (errors === null || !errors.length) {
            return {};
        }
        return errors.reduce((errorSchema, error) => {
            const { dataPath, message } = error;
            const path = this._toPath(dataPath);
            let parent = errorSchema;
            for (const segment of path.slice(0)) {
                if (!(segment in parent)) {
                    parent[segment] = {};
                }
                parent = parent[segment];
            }
            if (Array.isArray(parent.__errors)) {
                // We store the list of errors for this node in a dataPath named
                // __errors to avoid name collision with a possible sub schema
                // field named "errors" (see `validate.createErrorHandler`).
                parent.__errors = parent.__errors.concat(message);
            }
            else {
                parent.__errors = [message];
            }
            return errorSchema;
        }, {});
    }
    validateFormData(formData, schema) {
        this._ajv.validate(schema, formData);
        let errors = this._ajv.errors;
        errors = errors !== null && errors !== void 0 ? errors : [];
        const errorSchema = this._toErrorSchema(errors);
        return { errors, errorSchema };
    }
}
exports.default = new Validator();
//# sourceMappingURL=validator.js.map