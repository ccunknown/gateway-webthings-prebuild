"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../jsdom-common");
const test_utils_1 = require("./test-utils");
describe('SchemaField', () => {
    describe('Unsupported field', () => {
        it('should warn on invalid field type', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema: { type: 'invalid' } });
            expect(node.querySelector('.unsupported-field')).toBeTruthy();
        });
    });
    describe('label support', () => {
        const schema = {
            type: 'object',
            properties: {
                foo: { type: 'string' },
            },
        };
        it('should render label by default', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelectorAll('.control-label')).toHaveLength(1);
        });
    });
    describe('description support', () => {
        const schema = {
            type: 'object',
            properties: {
                foo: { type: 'string', description: 'A Foo field' },
                bar: { type: 'string' },
            },
        };
        it('should render description if available from the schema', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelectorAll('#root_foo__description')).toHaveLength(1);
        });
        it('should render description if available from a referenced schema', () => {
            // Overriding.
            const schemaWithReference = {
                type: 'object',
                properties: {
                    foo: { $ref: '#/definitions/foo' },
                    bar: { type: 'string' },
                },
                definitions: {
                    foo: {
                        type: 'string',
                        description: 'A Foo field',
                    },
                },
            };
            const { node } = (0, test_utils_1.createSchemaForm)({ schema: schemaWithReference });
            const matches = node.querySelectorAll('#root_foo__description');
            expect(matches).toHaveLength(1);
            expect(matches[0].textContent.trim()).toEqual('A Foo field');
        });
        it('should not render description if not available from schema', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({ schema });
            expect(node.querySelectorAll('#root_bar__description')).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=schema-field-test.js.map