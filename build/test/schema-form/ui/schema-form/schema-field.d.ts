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
declare type FieldClass = {
    new (schema: Record<string, unknown>, formData: any, idSchema: Record<string, unknown>, name: string, definitions: Record<string, unknown>, onChange: ((value: unknown) => void) | null, required: boolean, disabled: boolean, readOnly: boolean): any;
};
export default class SchemaField {
    private schema;
    private formData;
    private idSchema;
    private name;
    private definitions;
    private onChange;
    private required;
    private disabled;
    private readOnly;
    private retrievedSchema;
    constructor(schema: Record<string, unknown>, formData: unknown, idSchema: Record<string, unknown>, name: string | null, definitions: Record<string, unknown>, onChange?: ((value: unknown) => void) | null, required?: boolean, disabled?: boolean, readOnly?: boolean);
    getFieldType(): FieldClass;
    render(): HTMLDivElement;
}
export {};
//# sourceMappingURL=schema-field.d.ts.map