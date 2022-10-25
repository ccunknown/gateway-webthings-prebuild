/**
 * Utility functions for JSON-schema form.
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
export declare const REQUIRED_FIELD_SYMBOL = "*";
export declare function findSchemaDefinition($ref: string, definitions?: Record<string, unknown>): Record<string, unknown>;
export declare function retrieveSchema(schema: Record<string, unknown>, definitions?: Record<string, unknown>, formData?: unknown): Record<string, unknown>;
export declare function resolveDependencies(schema: Record<string, unknown>, definitions: Record<string, unknown>, formData: Record<string, unknown>): Record<string, unknown>;
export declare function withDependentProperties(schema: Record<string, unknown>, additionallyRequired: unknown[]): Record<string, unknown>;
export declare function withDependentSchema(schema: Record<string, unknown>, definitions: Record<string, unknown>, formData: Record<string, unknown>, dependencyKey: string, dependencyValue: Record<string, unknown>): Record<string, unknown>;
export declare function withExactlyOneSubschema(schema: Record<string, unknown>, definitions: Record<string, unknown>, formData: Record<string, unknown>, dependencyKey: string, oneOf: unknown[]): Record<string, unknown>;
export declare function mergeSchemas(schema1: Record<string, unknown>, schema2: Record<string, unknown>): Record<string, unknown>;
export declare function isConstant(schema: Record<string, unknown>): boolean;
export declare function isFixedItems(schema: Record<string, unknown>): boolean;
export declare function isObject(thing: unknown): boolean;
export declare function isSelect(_schema: Record<string, unknown>, definitions?: Record<string, unknown>): boolean;
export declare function isMultiSelect(schema: Record<string, unknown>, definitions?: Record<string, unknown>): boolean;
export declare function toConstant(schema: Record<string, unknown>): unknown;
export declare function toIdSchema(schema: Record<string, unknown>, id: string | null, definitions: Record<string, unknown>, formData?: Record<string, unknown>): Record<string, unknown>;
export declare function mergeObjects(obj1: Record<string, unknown>, obj2: Record<string, unknown>, concatArrays?: boolean): Record<string, unknown>;
export declare function optionsList(schema: Record<string, unknown>): Record<string, unknown>[];
export declare function computeDefaults(schema: Record<string, unknown>, parentDefaults: unknown, definitions?: Record<string, unknown>): unknown;
export declare function getDefaultFormState(_schema: Record<string, unknown>, formData: unknown, definitions?: Record<string, unknown>): unknown;
export declare function getOptionsList(schema: Record<string, unknown>): Record<string, unknown>[];
//# sourceMappingURL=schema-utils.d.ts.map