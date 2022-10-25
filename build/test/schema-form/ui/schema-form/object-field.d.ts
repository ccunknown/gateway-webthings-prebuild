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
export default class ObjectField {
    private schema;
    private formData;
    private idSchema;
    private name;
    private definitions;
    private onChange;
    private required;
    private retrievedSchema;
    constructor(schema: Record<string, unknown>, formData: Record<string, unknown>, idSchema: Record<string, unknown>, name: string, definitions: Record<string, unknown>, onChange?: ((value: unknown) => void) | null, required?: boolean, _disabled?: boolean, _readOnly?: boolean);
    isRequired(name: string): boolean;
    sortObject(obj: Record<string, unknown>): Record<string, unknown>;
    isSameSchema(schema1: Record<string, unknown>, schema2: Record<string, unknown>): boolean;
    onPropertyChange(name: string, field: HTMLElement): (value: unknown) => void;
    renderField(field: HTMLElement): void;
    render(): HTMLFieldSetElement;
}
//# sourceMappingURL=object-field.d.ts.map