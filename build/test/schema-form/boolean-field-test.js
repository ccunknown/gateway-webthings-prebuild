"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../jsdom-common");
const test_utils_1 = require("./test-utils");
describe('BooleanField', () => {
    it('should render a boolean field', () => {
        const { node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
            },
        });
        expect(node.querySelectorAll('.field input[type=checkbox]')).toHaveLength(1);
    });
    it('should render a boolean field with a label', () => {
        const { node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
                title: 'foo',
            },
        });
        expect(node.querySelector('.field .control-label').textContent.trim()).toEqual('foo');
    });
    it('should render a single label', () => {
        const { node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
                title: 'foo',
            },
        });
        expect(node.querySelectorAll('.field .control-label')).toHaveLength(1);
    });
    it('should render a description', () => {
        const { node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
                description: 'my description',
            },
        });
        const description = node.querySelector('.field-description');
        expect(description.textContent.trim()).toEqual('my description');
    });
    it('should assign a default value', () => {
        const { node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
                default: true,
            },
        });
        expect(node.querySelector('.field input').checked).toEqual(true);
    });
    it('should default state value to false', () => {
        const { schemaForm } = (0, test_utils_1.createSchemaForm)({ schema: { type: 'boolean' } });
        expect(schemaForm.formData).toEqual(false);
    });
    it('should handle a change event', () => {
        const { schemaForm, node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
                default: false,
            },
        });
        // Append the node to the DOM so that click events trigger a change
        document.body.appendChild(node);
        node.querySelector('input').click();
        expect(schemaForm.formData).toEqual(true);
    });
    it('should fill field with data', () => {
        const { node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
            },
            formData: true,
        });
        expect(node.querySelector('.field input').checked).toEqual(true);
    });
    it('should render the input with the expected id', () => {
        const { node } = (0, test_utils_1.createSchemaForm)({
            schema: {
                type: 'boolean',
            },
        });
        expect(node.querySelector('input[type=checkbox]').id).toEqual('root');
    });
});
//# sourceMappingURL=boolean-field-test.js.map