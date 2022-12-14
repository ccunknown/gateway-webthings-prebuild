"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../jsdom-common");
const test_utils_1 = require("./test-utils");
describe('ObjectField', () => {
    describe('schema', () => {
        const schema = {
            type: 'object',
            title: 'my object',
            description: 'my description',
            required: ['foo'],
            default: {
                foo: 'hey',
                bar: true,
            },
            properties: {
                foo: {
                    title: 'Foo',
                    type: 'string',
                },
                bar: {
                    type: 'boolean',
                },
            },
        };
        it('should render a fieldset', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelectorAll('fieldset')).toHaveLength(1);
        });
        it('should render a fieldset legend', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            const legend = node.querySelector('fieldset > legend');
            expect(legend.textContent.trim()).toEqual('my object');
            expect(legend.id).toEqual('root__title');
        });
        it('should render a default property label', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelector('.field-boolean .control-label').textContent.trim()).toEqual('bar');
        });
        it('should render a string property', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelectorAll('.field input[type=text]')).toHaveLength(1);
        });
        it('should render a boolean property', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelectorAll('.field input[type=checkbox]')).toHaveLength(1);
        });
        it('should handle a default object value', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelector('.field input[type=text]').value).toEqual('hey');
            expect(node.querySelector('.field input[type=checkbox]').checked).toEqual(true);
        });
        it('should handle required values', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            // Required field is <input type="text" required="">
            expect(node.querySelector('input[type=text]').getAttribute('required')).toEqual('');
            expect(node.querySelector('.field-string .control-label').textContent.trim()).toEqual('Foo*');
        });
        it('should fill fields with form data', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema,
                formData: {
                    foo: 'hey',
                    bar: true,
                },
            });
            expect(node.querySelector('.field input[type=text]').value).toEqual('hey');
            expect(node.querySelector('.field input[type=checkbox]').checked).toEqual(true);
        });
        it('should handle object fields change events', () => {
            const { schemaForm, node } = (0, test_utils_1.createSchemaForm)({ schema });
            const select = node.querySelector('input[type=text]');
            select.value = 'changed';
            (0, test_utils_1.fireEvent)(select, 'change');
            expect(schemaForm.formData.foo).toEqual('changed');
        });
        it('should render the field with the expected id', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelector('input[type=text]').id).toEqual('root_foo');
            expect(node.querySelector('input[type=checkbox]').id).toEqual('root_bar');
        });
    });
});
//# sourceMappingURL=object-field-test.js.map