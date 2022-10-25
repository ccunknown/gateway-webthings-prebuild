"use strict";
/**
 * Input Field for JSON-schema.
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
const array_field_1 = __importDefault(require("./array-field"));
const boolean_field_1 = __importDefault(require("./boolean-field"));
const number_field_1 = __importDefault(require("./number-field"));
const object_field_1 = __importDefault(require("./object-field"));
const SchemaUtils = __importStar(require("./schema-utils"));
const string_field_1 = __importDefault(require("./string-field"));
const unsupported_field_1 = __importDefault(require("./unsupported-field"));
const Utils = __importStar(require("../utils"));
/* eslint-enable @typescript-eslint/no-explicit-any */
class SchemaField {
    constructor(schema, formData, idSchema, name, definitions, onChange = null, required = false, disabled = false, readOnly = false) {
        this.retrievedSchema = SchemaUtils.retrieveSchema(schema, definitions, formData);
        this.schema = schema;
        this.formData = formData;
        this.idSchema = idSchema;
        this.name = name;
        this.definitions = definitions;
        this.onChange = onChange;
        this.required = required;
        this.disabled = disabled;
        this.readOnly = readOnly;
    }
    getFieldType() {
        const FIELD_TYPES = {
            array: array_field_1.default,
            boolean: boolean_field_1.default,
            integer: number_field_1.default,
            number: number_field_1.default,
            object: object_field_1.default,
            string: string_field_1.default,
        };
        const field = FIELD_TYPES[this.retrievedSchema.type];
        return field !== null && field !== void 0 ? field : unsupported_field_1.default;
    }
    render() {
        const fieldType = this.getFieldType();
        const type = this.retrievedSchema.type;
        const id = Utils.escapeHtmlForIdClass(this.idSchema.$id);
        const descr = this.retrievedSchema.description;
        const classNames = ['form-group', 'field', `field-${type}`].join(' ').trim();
        let label = this.retrievedSchema.title || this.name;
        if (typeof label !== 'undefined' && label !== null) {
            label = Utils.escapeHtml(label);
            label = this.required ? label + SchemaUtils.REQUIRED_FIELD_SYMBOL : label;
        }
        let displayLabel = true;
        let displayDescription = true;
        if (type === 'array') {
            displayLabel = displayDescription = SchemaUtils.isMultiSelect(this.schema, this.definitions);
        }
        if (type === 'object') {
            displayLabel = displayDescription = false;
        }
        const field = document.createElement('div');
        field.className = classNames;
        field.innerHTML =
            (displayLabel && label ? `<div id="${id}__label" class="control-label">${label}</div>` : '') +
                (displayDescription && descr
                    ? `<p id="${id}__description" class="field-description">${Utils.escapeHtml(descr)}</p>`
                    : '');
        const child = new fieldType(this.schema, this.formData, this.idSchema, this.name || '', this.definitions, this.onChange, this.required, this.disabled, this.readOnly).render();
        field.appendChild(child);
        return field;
    }
}
exports.default = SchemaField;
//# sourceMappingURL=schema-field.js.map