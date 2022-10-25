"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUndefined = exports.fireEvent = exports.createSchemaForm = void 0;
const schema_form_1 = __importDefault(require("./ui/schema-form/schema-form"));
function createSchemaForm({ schema, formData, onSubmit, }) {
    const schemaForm = new schema_form_1.default(schema, 'test', 'test', formData, onSubmit);
    const node = schemaForm.render();
    return { schemaForm, node };
}
exports.createSchemaForm = createSchemaForm;
function fireEvent(element, event) {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, true);
    return !element.dispatchEvent(evt);
}
exports.fireEvent = fireEvent;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function makeUndefined() { }
exports.makeUndefined = makeUndefined;
//# sourceMappingURL=test-utils.js.map