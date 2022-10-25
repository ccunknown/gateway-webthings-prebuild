/**
 * Input Field for JSON-schema type:string.
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
export default class StringField {
    private schema;
    private formData?;
    private idSchema;
    private onChange;
    private required;
    private disabled;
    private readOnly;
    constructor(schema: Record<string, unknown>, formData: string | undefined, idSchema: Record<string, unknown>, _name: string, definitions: Record<string, unknown>, onChange?: ((value?: string) => void) | null, required?: boolean, disabled?: boolean, readOnly?: boolean);
    toFormData(value: string): string | undefined;
    onStringChange(event: Event): void;
    render(): HTMLDivElement;
}
//# sourceMappingURL=string-field.d.ts.map