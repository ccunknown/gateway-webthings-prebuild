"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../jsdom-common");
const test_utils_1 = require("./test-utils");
describe('Validation', () => {
    describe('Required fields', () => {
        const schema = {
            type: 'object',
            required: ['foo'],
            properties: {
                foo: { type: 'string' },
                bar: { type: 'string' },
            },
        };
        it('should render errors', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema,
                formData: {
                    foo: (0, test_utils_1.makeUndefined)(),
                },
            });
            (0, test_utils_1.fireEvent)(node.querySelector('#root_foo'), 'change');
            expect(node.querySelectorAll('.errors-list li')).toHaveLength(1);
            expect(node.querySelector('.errors-list li').textContent.trim()).toEqual(
            // eslint-disable-next-line @typescript-eslint/quotes
            "should have required property 'foo'");
        });
    });
    describe('Min length', () => {
        const schema = {
            type: 'object',
            required: ['foo'],
            properties: {
                foo: {
                    type: 'string',
                    minLength: 10,
                },
            },
        };
        it('should render errors', () => {
            const { node } = (0, test_utils_1.createSchemaForm)({
                schema,
                formData: {
                    foo: '123456789',
                },
            });
            (0, test_utils_1.fireEvent)(node.querySelector('#root_foo'), 'change');
            expect(node.querySelectorAll('.error-item')).toHaveLength(1);
            expect(node.querySelector('.error-item').textContent.trim()).toEqual('/foo should NOT have fewer than 10 characters');
        });
    });
});
//# sourceMappingURL=validate-test.js.map