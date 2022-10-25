"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguage = exports.getMessage = exports.getEnglishMessageStrict = exports.getMessageStrict = exports.init = exports.l10n = exports.load = void 0;
// Polyfill for Intl.PluralRules
require("intl-pluralrules");
const api_1 = __importDefault(require("./api"));
const dom_1 = require("@fluent/dom");
const bundle_1 = require("@fluent/bundle");
const availableLanguages = {
    bn: ['/fluent/bn/main.ftl'],
    cs: ['/fluent/cs/main.ftl'],
    cy: ['/fluent/cy/main.ftl'],
    da: ['/fluent/da/main.ftl'],
    de: ['/fluent/de/main.ftl'],
    el: ['/fluent/el/main.ftl'],
    'en-CA': ['/fluent/en-CA/main.ftl'],
    'en-GB': ['/fluent/en-GB/main.ftl'],
    'en-US': ['/fluent/en-US/main.ftl'],
    en: ['/fluent/en-US/main.ftl'],
    'es-AR': ['/fluent/es-AR/main.ftl'],
    'es-ES': ['/fluent/es-ES/main.ftl'],
    fi: ['/fluent/fi/main.ftl'],
    fr: ['/fluent/fr/main.ftl'],
    'fy-NL': ['/fluent/fy-NL/main.ftl'],
    gl: ['/fluent/gl/main.ftl'],
    hu: ['/fluent/hu/main.ftl'],
    ia: ['/fluent/ia/main.ftl'],
    id: ['/fluent/id/main.ftl'],
    it: ['/fluent/it/main.ftl'],
    ja: ['/fluent/ja/main.ftl'],
    kab: ['/fluent/kab/main.ftl'],
    nl: ['/fluent/nl/main.ftl'],
    'nn-NO': ['/fluent/nn-NO/main.ftl'],
    pl: ['/fluent/pl/main.ftl'],
    'pt-BR': ['/fluent/pt-BR/main.ftl'],
    'pt-PT': ['/fluent/pt-PT/main.ftl'],
    ro: ['/fluent/ro/main.ftl'],
    ru: ['/fluent/ru/main.ftl'],
    sk: ['/fluent/sk/main.ftl'],
    sr: ['/fluent/sr/main.ftl'],
    'sv-SE': ['/fluent/sv-SE/main.ftl'],
    ta: ['/fluent/ta/main.ftl'],
    uk: ['/fluent/uk/main.ftl'],
    'zh-CN': ['/fluent/zh-CN/main.ftl'],
    'zh-TW': ['/fluent/zh-TW/main.ftl'],
};
let language;
let englishBundle;
let bundle;
async function load() {
    let response = {};
    try {
        response = await api_1.default.getLanguage();
    }
    catch (_) {
        // keep going
    }
    language = response.current || navigator.language || 'en-US';
    if (!availableLanguages.hasOwnProperty(language)) {
        const primary = language.split('-')[0];
        if (availableLanguages.hasOwnProperty(primary)) {
            language = primary;
        }
        else {
            language = 'en-US';
        }
    }
    if (language !== response.current) {
        // don't bother waiting for this, it's not super important
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        api_1.default.setLanguage(language).catch(() => { });
    }
    const links = availableLanguages[language];
    bundle = new bundle_1.FluentBundle(language);
    for (const link of links) {
        try {
            const res = await fetch(link);
            const text = await res.text();
            bundle.addResource(new bundle_1.FluentResource(text));
        }
        catch (e) {
            console.warn('Unable to download language pack:', e);
        }
    }
    if (language === 'en-US') {
        englishBundle = bundle;
    }
    else {
        const englishLinks = availableLanguages['en-US'];
        englishBundle = new bundle_1.FluentBundle('en-US');
        for (const link of englishLinks) {
            try {
                const res = await fetch(link);
                const text = await res.text();
                englishBundle.addResource(new bundle_1.FluentResource(text));
            }
            catch (e) {
                console.warn('Unable to download English language pack:', e);
            }
        }
    }
}
exports.load = load;
async function* generateBundles(_resourceIds
// eslint-disable-next-line no-undefined
) {
    if (!bundle) {
        await load();
    }
    yield* [bundle, englishBundle];
}
exports.l10n = new dom_1.DOMLocalization([], generateBundles);
function init() {
    exports.l10n.connectRoot(document.documentElement);
    exports.l10n.translateRoots();
}
exports.init = init;
/**
 * @return {string|null} Translation of unit or null if not contained in bundle
 */
function getMessageStrict(id, vars = {}) {
    if (!bundle) {
        console.warn('Bundle not yet loaded');
        return null;
    }
    const obj = bundle.getMessage(id);
    if (!obj || !obj.value) {
        console.warn('Missing id', id);
        return null;
    }
    return bundle.formatPattern(obj.value, vars);
}
exports.getMessageStrict = getMessageStrict;
/**
 * @return {string|null} Translation of unit or null if not contained in bundle
 */
function getEnglishMessageStrict(id, vars = {}) {
    if (!englishBundle) {
        console.warn('Bundle not yet loaded');
        return null;
    }
    const obj = englishBundle.getMessage(id);
    if (!obj || !obj.value) {
        console.warn('Missing id', id);
        return null;
    }
    return englishBundle.formatPattern(obj.value, vars);
}
exports.getEnglishMessageStrict = getEnglishMessageStrict;
/**
 * @return {string} Translation of unit or unit's id for debugging purposes
 */
function getMessage(id, vars = {}) {
    let msg = getMessageStrict(id, vars);
    if (msg) {
        return msg;
    }
    msg = getEnglishMessageStrict(id, vars);
    if (msg) {
        return msg;
    }
    return `<${id}>`;
}
exports.getMessage = getMessage;
/**
 * @return {string} The user's chosen language.
 */
function getLanguage() {
    return language;
}
exports.getLanguage = getLanguage;
//# sourceMappingURL=fluent.js.map