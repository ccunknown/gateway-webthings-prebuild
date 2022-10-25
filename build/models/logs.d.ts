import { RunResult } from 'sqlite3';
import { Property } from 'gateway-addon';
import { Any } from 'gateway-addon/lib/schema';
declare class Logs {
    private db;
    private idToDescr;
    private descrToId;
    private _onPropertyChanged;
    private _clearOldMetrics;
    private clearOldMetricsInterval;
    constructor();
    clear(): Promise<RunResult[]>;
    close(): void;
    open(): void;
    createTables(): Promise<RunResult[]>;
    createIdTable(): Promise<RunResult>;
    createMetricTable(id: string, dataType: string): Promise<RunResult>;
    loadKnownMetrics(): Promise<void>;
    propertyDescr(thingId: string, propId: string): {
        type: string;
        thing: string;
        property: string;
    };
    actionDescr(thingId: string, actionId: string): {
        type: string;
        thing: string;
        action: string;
    };
    eventDescr(thingId: string, eventId: string): {
        type: string;
        thing: string;
        event: string;
    };
    /**
     * @param {Object} rawDescr
     * @param {number} maxAge
     */
    registerMetric(rawDescr: Record<string, unknown>, maxAge: number): Promise<number | null>;
    /**
     * @param {Object} rawDescr
     * @param {unknown} rawValue
     * @param {Date} date
     */
    insertMetric(rawDescr: Record<string, unknown>, rawValue: unknown, date: Date): Promise<void>;
    /**
     * Remove a metric with all its associated data
     * @param {Object} rawDescr
     */
    unregisterMetric(rawDescr: Record<string, unknown>): Promise<void>;
    onPropertyChanged(property: Property<Any>): void;
    buildQuery(table: string, id: number | null, start: number | null, end: number | null, limit: number | null): {
        query: string;
        params: number[];
    };
    loadMetrics(out: Record<string, unknown>, table: string, transformer: ((arg: unknown) => unknown) | null, id: number | null, start: number | null, end: number | null): Promise<void>;
    getAll(start: number | null, end: number | null): Promise<Record<string, unknown>>;
    get(thingId: string, start: number | null, end: number | null): Promise<Record<string, unknown>>;
    getProperty(thingId: string, propertyName: string, start: number | null, end: number | null): Promise<unknown[]>;
    getSchema(): Promise<Record<string, unknown>[]>;
    streamMetrics(callback: (metrics: unknown[]) => void, table: string, transformer: ((arg: unknown) => unknown) | null, id: number | null, start: number | null, end: number | null): Promise<void>;
    streamAll(callback: (metrics: unknown[]) => void, start: number | null, end: number | null): Promise<void>;
    clearOldMetrics(): Promise<void>;
    all(sql: string, ...values: any[]): Promise<Record<string, unknown>[]>;
    /**
     * Run a SQL statement
     * @param {String} sql
     * @param {Array<unknown>} values
     * @return {Promise<Object>} promise resolved to `this` of statement result
     */
    run(sql: string, ...values: any[]): Promise<RunResult>;
}
declare const _default: Logs;
export default _default;
//# sourceMappingURL=logs.d.ts.map