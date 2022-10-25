"use strict";
/**
 * Create input form using JSON-schema.
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
const validator_1 = __importDefault(require("./validator"));
const schema_field_1 = __importDefault(require("./schema-field"));
const error_field_1 = __importDefault(require("./error-field"));
const Utils = __importStar(require("../utils"));
const Fluent = __importStar(require("../fluent"));
class SchemaForm {
    constructor(schema, id, name, formData, onSubmit = null, options = {}) {
        this.definitions = schema.definitions;
        this.schema = schema;
        this.id = id;
        this.name = name;
        this.onSubmit = onSubmit;
        this.idSchema = SchemaUtils.toIdSchema(schema, null, this.definitions, formData);
        this.formData = SchemaUtils.getDefaultFormState(schema, formData, this.definitions);
        this.submitText = options.hasOwnProperty('submitText') ? options.submitText : '';
        this.noValidate = options.hasOwnProperty('validate') ? !options.validate : false;
        this.liveValidate = options.hasOwnProperty('liveValidate')
            ? options.liveValidate
            : true;
    }
    onChange(formData) {
        let error = null;
        this.formData = formData;
        this.submitButton.disabled = false;
        if (!this.noValidate && this.liveValidate) {
            const { errors } = this.validate(formData);
            error = errors;
        }
        if (!this.noValidate && error) {
            this.errorField.render(error);
        }
        else if (!this.noValidate) {
            this.errorField.render([]);
        }
    }
    validate(formData) {
        return validator_1.default.validateFormData(formData, this.schema);
    }
    handleSubmit(e) {
        const { errors } = this.validate(this.formData);
        const button = e.target;
        button.disabled = true;
        if (this.onSubmit) {
            this.onSubmit(this.formData, errors);
        }
    }
    renderSubmitButton() {
        const submitButton = document.createElement('button');
        submitButton.id = `submit-${Utils.escapeHtml(this.id)}`;
        submitButton.type = 'button';
        submitButton.className = 'button-submit';
        if (this.submitText) {
            submitButton.innerText = this.submitText;
        }
        else {
            submitButton.innerText = Fluent.getMessage('submit');
        }
        submitButton.addEventListener('click', this.handleSubmit.bind(this));
        submitButton.disabled = true;
        this.submitButton = submitButton;
        return submitButton;
    }
    render() {
        const form = document.createElement('form');
        form.className = 'json-schema-form';
        form.id = this.id;
        form.innerHTML = `<p></p>`;
        const p = form.querySelector('p');
        const submit = this.renderSubmitButton();
        p.appendChild(submit);
        const onChangeHandle = this.onChange.bind(this);
        const child = new schema_field_1.default(this.schema, this.formData, this.idSchema, this.name, this.definitions, onChangeHandle).render();
        this.errorField = new error_field_1.default();
        p.insertBefore(child, p.firstChild);
        p.insertBefore(this.errorField.render([]), p.firstChild);
        return form;
    }
}
exports.default = SchemaForm;
// Elevate this to the window level.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.SchemaForm = SchemaForm;
//# sourceMappingURL=schema-form.js.map