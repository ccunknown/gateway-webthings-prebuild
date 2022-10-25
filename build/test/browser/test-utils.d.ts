export declare function getAddons(): Promise<Map<string, string>>;
export declare function addThing(desc: Record<string, unknown>): Promise<void>;
export declare function getProperty<T>(id: string, property: string): Promise<T>;
export declare function setProperty<T>(id: string, property: string, value: T): Promise<void>;
export declare function escapeHtmlForIdClass(text: string): string;
//# sourceMappingURL=test-utils.d.ts.map