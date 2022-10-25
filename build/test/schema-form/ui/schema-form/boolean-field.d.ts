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
export default class BooleanField {
    private formData;
    private idSchema;
    private onChange;
    private required;
    private disabled;
    private readOnly;
    constructor(_schema: Record<string, unknown>, formData: boolean, idSchema: Record<string, unknown>, _name: string, _definitions: Record<string, unknown>, onChange?: ((value: boolean) => void) | null, required?: boolean, disabled?: boolean, readOnly?: boolean);
    onBooleanChange(event: Event): void;
    render(): HTMLDivElement;
}
//# sourceMappingURL=boolean-field.d.ts.map