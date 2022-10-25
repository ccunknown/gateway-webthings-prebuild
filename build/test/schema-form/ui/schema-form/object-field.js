"use strict";
/**
 * Input Field for JSON-schema type:object.
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
const SchemaUtils = __importStar(require("./schema-utils"));
const schema_field_1 = __importDefault(require("./schema-field"));
const Utils = __importStar(require("../utils"));
class ObjectField {
    constructor(schema, formData, idSchema, name, definitions, onChange = null, required = false, _disabled = false, _readOnly = false) {
        this.retrievedSchema = SchemaUtils.retrieveSchema(schema, definitions, formData);
        this.schema = schema;
        this.formData = formData;
        this.idSchema = idSchema;
        this.name = name;
        this.definitions = definitions;
        this.onChange = onChange;
        this.required = required;
    }
    isRequired(name) {
        return (Array.isArray(this.retrievedSchema.required) && this.retrievedSchema.required.includes(name));
    }
    sortObject(obj) {
        const keys = Object.keys(obj).sort();
        const map = {};
        keys.forEach((key) => {
            let val = obj[key];
            if (typeof val === 'object') {
                val = this.sortObject(val);
            }
            map[key] = val;
        });
        return map;
    }
    isSameSchema(schema1, schema2) {
        const json1 = JSON.stringify(this.sortObject(schema1));
        const json2 = JSON.stringify(this.sortObject(schema2));
        return json1 === json2;
    }
    onPropertyChange(name, field) {
        return (value) => {
            const schema = this.schema;
            const newFormData = {};
            newFormData[name] = value;
            this.formData = Object.assign(this.formData, newFormData);
            // modify part of form based on form data.
            if (schema.hasOwnProperty('dependencies')) {
                const newRetrievedSchema = SchemaUtils.retrieveSchema(schema, this.definitions, this.formData);
                if (!this.isSameSchema(this.retrievedSchema, newRetrievedSchema)) {
                    this.retrievedSchema = newRetrievedSchema;
                    this.formData = (SchemaUtils.getDefaultFormState(newRetrievedSchema, this.formData, this.definitions));
                    this.renderField(field);
                }
            }
            if (this.onChange) {
                this.onChange(this.formData);
            }
        };
    }
    renderField(field) {
        const id = Utils.escapeHtmlForIdClass(this.idSchema.$id);
        const description = this.retrievedSchema.description;
        let title = this.retrievedSchema.title ? this.retrievedSchema.title : this.name;
        if (typeof title !== 'undefined' && title !== null) {
            title = Utils.escapeHtml(title);
            title = this.required ? title + SchemaUtils.REQUIRED_FIELD_SYMBOL : title;
        }
        field.innerHTML =
            (title ? `<legend id="${`${id}__title`}">${title}</legend>` : '') +
                (description
                    ? `<p id="${id}__description" class="field-description">
        ${Utils.escapeHtml(description)}</p>`
                    : '');
        // TODO support to specific properties order
        const orderedProperties = Object.keys(this.retrievedSchema.properties);
        orderedProperties.forEach((name) => {
            const childSchema = (this.retrievedSchema.properties[name]);
            const childIdPrefix = `${this.idSchema.$id}_${name}`;
            const childData = this.formData[name];
            const childIdSchema = SchemaUtils.toIdSchema(childSchema, childIdPrefix, this.definitions, childData);
            const child = new schema_field_1.default(childSchema, childData, childIdSchema, name, this.definitions, this.onPropertyChange(name, field), this.isRequired(name), childSchema.disabled, childSchema.readOnly).render();
            field.appendChild(child);
        });
    }
    render() {
        const field = document.createElement('fieldset');
        this.renderField(field);
        return field;
    }
}
exports.default = ObjectField;
//# sourceMappingURL=object-field.js.map