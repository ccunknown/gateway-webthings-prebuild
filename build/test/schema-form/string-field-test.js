"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../jsdom-common");
const test_utils_1 = require("./test-utils");
describe('StringField', () => {
    describe('text input', () => {
        it('should render a string field', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                },
            });
            expect(node.querySelectorAll('.field input')).toHaveLength(1);
        });
        it('should render a string field with a label', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    title: 'foo',
                },
            });
            expect(node.querySelector('.field .control-label').textContent.trim()).toEqual('foo');
        });
        it('should render a string field with a description', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    description: 'bar',
                },
            });
            expect(node.querySelector('.field-description').textContent.trim()).toEqual('bar');
        });
        it('should assign a default value', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    default: 'plop',
                },
            });
            expect(node.querySelector('.field input').value).toEqual('plop');
        });
        it('should default state value to undefined', () => {
            const { schemaForm } = (0, test_utils_1.createSchemaForm)({ schema: { type: 'string' } });
            expect(typeof schemaForm.formData).toEqual('undefined');
        });
        it('should handle a change event', () => {
            const { schemaForm, node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                },
            });
            const input = node.querySelector('input');
            input.setRangeText('yo');
            (0, test_utils_1.fireEvent)(input, 'change');
            expect(schemaForm.formData).toEqual('yo');
        });
        it('should handle an empty string change event', () => {
            const { schemaForm, node } = (0, test_utils_1.createSchemaForm)({
                schema: { type: 'string' },
                formData: 'x',
            });
            const input = node.querySelector('input');
            input.setRangeText('', 0, 1);
            (0, test_utils_1.fireEvent)(input, 'change');
            expect(typeof schemaForm.formData).toEqual('undefined');
        });
        it('should fill field with data', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                },
                formData: 'plip',
            });
            expect(node.querySelector('.field input').value).toEqual('plip');
        });
        it('should render the input with the expected id', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                },
            });
            expect(node.querySelector('input').id).toEqual('root');
        });
    });
    describe('select input', () => {
        it('should render a string field', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                },
            });
            expect(node.querySelectorAll('.field select')).toHaveLength(1);
        });
        it('should render a string field with a label', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                    title: 'foo',
                },
            });
            expect(node.querySelector('.field .control-label').textContent.trim()).toEqual('foo');
        });
        it('should render empty option', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                },
            });
            expect(node.querySelectorAll('.field option')[0].value).toEqual('');
        });
        it('should assign a default value', () => {
            const { schemaForm } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                    default: 'bar',
                },
            });
            expect(schemaForm.formData).toEqual('bar');
        });
        it('should reflect the change into the form state', () => {
            const { schemaForm, node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                },
            });
            const select = node.querySelector('select');
            select.value = 'foo';
            (0, test_utils_1.fireEvent)(select, 'change');
            expect(schemaForm.formData).toEqual('foo');
        });
        it('should reflect undefined into form state if empty option selected', () => {
            const { schemaForm, node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                },
            });
            const select = node.querySelector('select');
            select.value = '';
            (0, test_utils_1.fireEvent)(select, 'change');
            expect(typeof schemaForm.formData).toEqual('undefined');
        });
        it('should reflect the change into the dom', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                },
            });
            const select = node.querySelector('select');
            select.value = 'foo';
            (0, test_utils_1.fireEvent)(select, 'change');
            expect(node.querySelector('select').value).toEqual('foo');
        });
        it('should reflect undefined value into the dom as empty option', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                },
            });
            const select = node.querySelector('select');
            select.value = '';
            (0, test_utils_1.fireEvent)(select, 'change');
            expect(node.querySelector('select').value).toEqual('');
        });
        it('should fill field with data', () => {
            const { schemaForm } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['foo', 'bar'],
                },
                formData: 'bar',
            });
            expect(schemaForm.formData).toEqual('bar');
        });
        it('should render the select with the expected id', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema: {
                    type: 'string',
                    enum: ['a', 'b'],
                },
            });
            expect(node.querySelector('select').id).toEqual('root');
        });
    });
});
//# sourceMappingURL=string-field-test.js.map