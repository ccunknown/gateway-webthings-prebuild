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
export default class NumberField {
    private schema;
    private formData?;
    private idSchema;
    private onChange;
    private required;
    private disabled;
    private readOnly;
    private rangeValue?;
    constructor(schema: Record<string, unknown>, formData: string | number | undefined, idSchema: Record<string, unknown>, _name: string, definitions: Record<string, unknown>, onChange?: ((value?: string | number) => void) | null, required?: boolean, disabled?: boolean, readOnly?: boolean);
    toFormData(value: unknown, validityState?: ValidityState): string | number | undefined;
    onNumberChange(event: Event): void;
    render(): HTMLDivElement;
}
//# sourceMappingURL=number-field.d.ts.map