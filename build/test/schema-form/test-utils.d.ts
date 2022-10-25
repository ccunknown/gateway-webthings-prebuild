import SchemaForm from './ui/schema-form/schema-form';
export declare function createSchemaForm({ schema, formData, onSubmit, }: {
    schema: Record<string, unknown>;
    formData?: unknown;
    onSubmit?: () => void;
}): {
    schemaForm: SchemaForm;
    node: Element;
};
export declare function fireEvent(element: Element, event: string): boolean;
export declare function makeUndefined(): void;
//# sourceMappingURL=test-utils.d.ts.map