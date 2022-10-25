/**
 * Utility functions.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Constants from './constants';
/**
 * @param {String} str
 * @return {String} the string with the first letter capitalized
 */
export declare function capitalize(str: string): string;
export declare function escapeHtml(text: string): string;
export declare function unescapeHtml(text: string): string;
export declare function escapeHtmlForIdClass(text: string): string;
export declare function fuzzyTime(date: number): string;
export declare function debounce(delay: number, callback: (...args: any[]) => void): (...args: any[]) => void;
export declare function throttle(delay: number, callback: (...args: any[]) => void, debounceMode?: boolean): (...args: any[]) => void;
export declare function colorTemperatureToRGB(value: number): string;
export declare function sortCapabilities(capabilities: string[]): string[];
/**
 * Adjust an input value to match schema bounds.
 *
 * @param {number} value - Value to adjust
 * @returns {number} Adjusted value
 */
export declare function adjustInputValue(value: number, schema: Record<string, unknown>): number;
declare type WoTOperation = keyof typeof Constants.WoTOperation;
declare type WoTFormOperation = WoTOperation | WoTOperation[] | undefined;
/**
 * Finds the gateway api endpoint for a specific operation.
 * It uses the assumption that gateway enpoints are pushed to
 * the form array as the last element.
 *
 * @param {Array} forms The list of forms.
 * @param {string} operation
 * @returns {string | undefined} the href of the select form or undefined if not found.
 */
export declare function selectFormHref(forms: Array<{
    href: string;
    op: WoTFormOperation;
}>, operation: WoTOperation, base?: string): string | undefined;
export {};
//# sourceMappingURL=utils.d.ts.map