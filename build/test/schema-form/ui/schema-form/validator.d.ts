/**
 * Validate data with JSON-schema.
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
declare class Validator {
    private _ajv;
    private _reEscapeChar;
    private _rePropName;
    constructor();
    _toPath(s: string): string[];
    _toErrorSchema(errors: ErrorObject[]): Record<string, unknown>;
    validateFormData(formData: unknown, schema: Record<string, unknown>): {
        errors: ErrorObject[];
        errorSchema: Record<string, unknown>;
    };
}
declare const _default: Validator;
export default _default;
//# sourceMappingURL=validator.d.ts.map