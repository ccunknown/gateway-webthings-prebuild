import 'intl-pluralrules';
import { DOMLocalization } from '@fluent/dom';
import { FluentVariable } from '@fluent/bundle';
export declare function load(): Promise<void>;
export declare const l10n: DOMLocalization;
export declare function init(): void;
/**
 * @return {string|null} Translation of unit or null if not contained in bundle
 */
export declare function getMessageStrict(id: string, vars?: Record<string, FluentVariable>): string | null;
/**
 * @return {string|null} Translation of unit or null if not contained in bundle
 */
export declare function getEnglishMessageStrict(id: string, vars?: Record<string, FluentVariable>): string | null;
/**
 * @return {string} Translation of unit or unit's id for debugging purposes
 */
export declare function getMessage(id: string, vars?: Record<string, FluentVariable>): string;
/**
 * @return {string} The user's chosen language.
 */
export declare function getLanguage(): string;
//# sourceMappingURL=fluent.d.ts.map