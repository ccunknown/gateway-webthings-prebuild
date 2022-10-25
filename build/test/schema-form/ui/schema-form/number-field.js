"use strict";
/**
 * Input Field for JSON-schema type:number.
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
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaUtils = __importStar(require("./schema-utils"));
const Utils = __importStar(require("../utils"));
class NumberField {
    constructor(schema, formData, idSchema, _name, definitions, onChange = null, required = false, disabled = false, readOnly = false) {
        this.schema = SchemaUtils.retrieveSchema(schema, definitions, formData);
        this.formData = formData;
        this.idSchema = idSchema;
        this.onChange = onChange;
        this.required = required;
        this.disabled = disabled;
        this.readOnly = readOnly;
    }
    toFormData(value, validityState) {
        const num = Number(value);
        // HTML number inputs will never give us an invalid value. Instead, they
        // will give us an empty string when the input is invalid.
        if (value === '') {
            if (validityState) {
                // If the value is empty and the field is marked as valid, that means
                // the input is truly empty and is non-required.
                if (!this.required && validityState.valid) {
                    // eslint-disable-next-line no-undefined
                    return undefined;
                }
                // If the value is empty and the field is marked as value missing, that
                // means the input is truly empty and is required.
                if (this.required && validityState.valueMissing && !validityState.badInput) {
                    // eslint-disable-next-line no-undefined
                    return undefined;
                }
                return '.';
            }
            else {
                console.log('returning .');
                return '.';
            }
        }
        else if (isNaN(num)) {
            // We should probably never hit this block unless HTML input validation is
            // not working.
            return '.';
        }
        return num;
    }
    onNumberChange(event) {
        const value = event.target.value;
        if (this.rangeValue) {
            this.rangeValue.textContent = value;
        }
        // If a user input nothing on required field, we should set undefined in
        // order to raise error.
        this.formData = this.toFormData(value, event.target.validity);
        if (this.onChange) {
            this.onChange(this.formData);
        }
    }
    render() {
        const id = Utils.escapeHtmlForIdClass(this.idSchema.$id);
        let value = Number(this.formData);
        if (isNaN(value)) {
            value = 0;
        }
        const field = document.createElement('div');
        // range item
        if (this.schema.hasOwnProperty('minimum') && this.schema.hasOwnProperty('maximum')) {
            field.className = 'field-range-wrapper';
            field.innerHTML = `
        <input
        type="range"
        id="${id}"
        class="form-control"
        ${this.required ? 'required' : ''}
        ${this.disabled || this.readOnly ? 'disabled' : ''}
        value=${value == null ? '' : value}
        ${this.schema.multipleOf ? `step=${Number(this.schema.multipleOf)}` : ''}
        min=${Number(this.schema.minimum)}
        max=${Number(this.schema.maximum)}
        />
        <span class="range-view">${value}</span>`;
            this.rangeValue = field.querySelector('span');
        }
        else if (SchemaUtils.isSelect(this.schema)) {
            const enumOptions = SchemaUtils.getOptionsList(this.schema);
            const selectedValue = value;
            let selectedAny = false;
            // User can select undefiend value on field not required.
            if (!this.required) {
                enumOptions.unshift({ value: '', label: '' });
            }
            const selects = enumOptions.map(({ value, label }, i) => {
                const selected = selectedValue === this.toFormData(value);
                selectedAny = selectedAny || selected;
                return `
          <option
          key="${i}"
          value="${Utils.escapeHtml(`${value}`)}"
          ${selected ? 'selected' : ''}>
            ${Utils.escapeHtml(label)}
          </option>`;
            });
            field.innerHTML = `
        <select
        id="${id}"
        class="form-control"
        ${this.required ? 'required' : ''}
        ${this.disabled || this.readOnly ? 'disabled' : ''}
        >
        ${selects.join(' ')}
        </select>`;
            if (!selectedAny) {
                const select = field.querySelector(`#${id}`);
                select.selectedIndex = -1;
            }
        }
        else {
            let min = '', max = '', step = 'any';
            if (this.schema.hasOwnProperty('minimum')) {
                min = `min="${this.schema.minimum}"`;
            }
            if (this.schema.hasOwnProperty('maximum')) {
                max = `max="${this.schema.maximum}"`;
            }
            if (this.schema.hasOwnProperty('multipleOf')) {
                step = `${this.schema.multipleOf}`;
            }
            else if (this.schema.type === 'integer') {
                step = '1';
            }
            field.innerHTML = `
        <input
        id="${id}"
        type="number"
        class="form-control"
        ${this.required ? 'required' : ''}
        ${this.disabled || this.readOnly ? 'disabled' : ''}
        ${min} ${max} step="${step}"
        value="${value == null ? '' : Utils.escapeHtml(`${value}`)}"
        />`;
        }
        const input = field.querySelector(`#${id}`);
        input.onchange = this.onNumberChange.bind(this);
        input.oninput = this.onNumberChange.bind(this);
        return field;
    }
}
exports.default = NumberField;
//# sourceMappingURL=number-field.js.map