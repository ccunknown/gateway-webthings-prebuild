/**
 * Input Field for JSON-schema type:array.
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
export default class ArrayField {
    private schema;
    private formData;
    private idSchema;
    private name;
    private definitions;
    private onChange;
    private disabled;
    private readOnly;
    constructor(schema: Record<string, unknown>, formData: unknown[], idSchema: Record<string, unknown>, name: string, definitions: Record<string, unknown>, onChange?: ((value: unknown) => void) | null, _required?: boolean, disabled?: boolean, readOnly?: boolean);
    require(name: string): boolean;
    onChangeForIndex(index: number): (value: unknown) => void;
    onSelectChange(value: unknown, all: unknown[]): (event: Event) => void;
    allowAdditionalItems(): boolean;
    isAddable(formItems: unknown[]): boolean;
    isItemRequired(itemSchema: Record<string, unknown>): boolean;
    itemFieldId(index: number): string;
    onDropIndexClick(field: HTMLElement, index: number): (event: Event) => void;
    renderRemoveButton(field: HTMLElement, index: number): HTMLButtonElement;
    onAddClick(field: HTMLElement): (event: Event) => void;
    renderAddButton(field: HTMLElement): HTMLButtonElement;
    renderArrayFieldItem(field: HTMLElement, itemData: unknown, index: number, itemSchema: Record<string, unknown>, canRemove: boolean): HTMLDivElement;
    renderArrayFieldset(): HTMLFieldSetElement;
    renderNormalArray(): HTMLFieldSetElement;
    renderFixedArray(): HTMLFieldSetElement;
    renderMultiSelect(): HTMLFieldSetElement;
    render(): HTMLElement;
}
//# sourceMappingURL=array-field.d.ts.map