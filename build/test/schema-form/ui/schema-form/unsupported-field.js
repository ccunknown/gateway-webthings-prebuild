"use strict";
/**
 * Field for JSON-schema type:Unsupported.
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
const Fluent = __importStar(require("../fluent"));
class UnsupportedField {
    constructor(schema) {
        // XXX render json as string so dev can inspect faulty subschema
        this.schema = schema;
    }
    render() {
        const schema = Utils.escapeHtml(JSON.stringify(this.schema, null, 2));
        const field = document.createElement('div');
        field.className = 'unsupported-field';
        const fieldMessage = document.createElement('span');
        fieldMessage.innerText = Fluent.getMessage('unsupported-field');
        const schemaMessage = document.createElement('span');
        schemaMessage.innerHTML = schema;
        field.appendChild(fieldMessage);
        field.appendChild(schemaMessage);
        return field;
    }
}
exports.default = UnsupportedField;
//# sourceMappingURL=unsupported-field.js.map