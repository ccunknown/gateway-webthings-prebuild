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
import { ErrorObject } from 'ajv';
export default class SchemaForm {
    private definitions;
    private schema;
    private id;
    private name;
    private onSubmit;
    private idSchema;
    private submitText;
    private noValidate;
    private liveValidate;
    private submitButton?;
    private errorField?;
    formData: unknown;
    constructor(schema: Record<string, unknown>, id: string, name: string, formData: unknown, onSubmit?: ((formData: unknown, errors: ErrorObject[]) => void) | null, options?: Record<string, unknown>);
    onChange(formData: unknown): void;
    validate(formData: unknown): {
        errors: ErrorObject[];
        errorSchema: Record<string, unknown>;
    };
    handleSubmit(e: MouseEvent): void;
    renderSubmitButton(): HTMLButtonElement;
    render(): HTMLFormElement;
}
//# sourceMappingURL=schema-form.d.ts.map