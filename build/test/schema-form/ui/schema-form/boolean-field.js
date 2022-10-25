"use strict";
/**
 * Input Field for JSON-schema type:boolean.
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
const Utils = __importStar(require("../utils"));
class BooleanField {
    constructor(_schema, formData, idSchema, _name, _definitions, onChange = null, required = false, disabled = false, readOnly = false) {
        this.formData = formData;
        this.idSchema = idSchema;
        this.onChange = onChange;
        this.required = required;
        this.disabled = disabled;
        this.readOnly = readOnly;
    }
    onBooleanChange(event) {
        this.formData = event.target.checked;
        if (this.onChange) {
            this.onChange(this.formData);
        }
    }
    render() {
        const id = Utils.escapeHtmlForIdClass(this.idSchema.$id);
        const value = this.formData;
        const field = document.createElement('div');
        field.className = 'checkbox';
        field.innerHTML = `
      <input
      type="checkbox"
      id="${id}"
      ${value ? 'checked' : ''}
      ${this.required ? 'required' : ''}
      ${this.disabled || this.readOnly ? 'disabled' : ''}
      />
      <label for="${id}"></span>
      `;
        const input = field.querySelector(`#${id}`);
        input.onchange = this.onBooleanChange.bind(this);
        return field;
    }
}
exports.default = BooleanField;
//# sourceMappingURL=boolean-field.js.map