"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sqlite3_1 = require("sqlite3");
const Constants = __importStar(require("../constants"));
const user_profile_1 = __importDefault(require("../user-profile"));
const addon_manager_1 = __importDefault(require("../addon-manager"));
const sqlite3 = (0, sqlite3_1.verbose)();
const METRICS_NUMBER = 'metricsNumber';
const METRICS_BOOLEAN = 'metricsBoolean';
const METRICS_OTHER = 'metricsOther';
class Logs {
    constructor() {
        this.db = null;
        this.idToDescr = {};
        this.descrToId = {};
        this._onPropertyChanged = this.onPropertyChanged.bind(this);
        this._clearOldMetrics = this.clearOldMetrics.bind(this);
        addon_manager_1.default.on(Constants.PROPERTY_CHANGED, this._onPropertyChanged);
        // Clear out old metrics every hour
        this.clearOldMetricsInterval = setInterval(this._clearOldMetrics, 60 * 60 * 1000);
    }
    clear() {
        this.idToDescr = {};
        this.descrToId = {};
        return Promise.all([METRICS_NUMBER, METRICS_BOOLEAN, METRICS_OTHER, 'metricIds'].map((table) => {
            return this.run(`DELETE FROM ${table}`);
        }));
    }
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        addon_manager_1.default.removeListener(Constants.PROPERTY_CHANGED, this._onPropertyChanged);
        clearInterval(this.clearOldMetricsInterval);
    }
    open() {
        // Get all things, create table if not exists
        // If the database is already open, just return.
        if (this.db) {
            return;
        }
        const filename = path_1.default.join(user_profile_1.default.logDir, 'logs.sqlite3');
        let exists = fs_1.default.existsSync(filename);
        const removeBeforeOpen = config_1.default.get('database.removeBeforeOpen');
        if (exists && removeBeforeOpen) {
            fs_1.default.unlinkSync(filename);
            exists = false;
        }
        console.log(exists ? 'Opening' : 'Creating', 'database:', filename);
        // Open database or create it if it doesn't exist
        this.db = new sqlite3.Database(filename);
        // Set a timeout in case the database is locked. 10 seconds is a bit long,
        // but it's better than crashing.
        this.db.configure('busyTimeout', 10000);
        this.createTables().then(() => {
            this.loadKnownMetrics();
        });
    }
    createTables() {
        return Promise.all([
            this.createMetricTable(METRICS_NUMBER, typeof 0),
            this.createMetricTable(METRICS_BOOLEAN, typeof false),
            this.createMetricTable(METRICS_OTHER, typeof {}),
            this.createIdTable(),
        ]);
    }
    createIdTable() {
        // We use a version of sqlite which doesn't support foreign keys so id is
        // an integer referenced by the metric tables
        return this.run(`CREATE TABLE IF NOT EXISTS metricIds (
      id INTEGER PRIMARY KEY ASC,
      descr TEXT,
      maxAge INTEGER
    );`);
    }
    createMetricTable(id, dataType) {
        const table = id;
        let sqlType = 'TEXT';
        switch (dataType) {
            case 'number':
                sqlType = 'REAL';
                break;
            case 'boolean':
                sqlType = 'INTEGER';
                break;
        }
        return this.run(`CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER,
      date DATE,
      value ${sqlType}
    );`);
    }
    async loadKnownMetrics() {
        const rows = await this.all('SELECT id, descr, maxAge FROM metricIds');
        for (const row of rows) {
            this.idToDescr[row.id] = JSON.parse(row.descr);
            this.idToDescr[row.id].maxAge = row.maxAge;
            this.descrToId[row.descr] = row.id;
        }
    }
    propertyDescr(thingId, propId) {
        return {
            type: 'property',
            thing: thingId,
            property: propId,
        };
    }
    actionDescr(thingId, actionId) {
        return {
            type: 'action',
            thing: thingId,
            action: actionId,
        };
    }
    eventDescr(thingId, eventId) {
        return {
            type: 'event',
            thing: thingId,
            event: eventId,
        };
    }
    /**
     * @param {Object} rawDescr
     * @param {number} maxAge
     */
    async registerMetric(rawDescr, maxAge) {
        const descr = JSON.stringify(rawDescr);
        if (this.descrToId.hasOwnProperty(descr)) {
            return null;
        }
        const result = await this.run('INSERT INTO metricIds (descr, maxAge) VALUES (?, ?)', descr, maxAge);
        const id = result.lastID;
        this.idToDescr[id] = Object.assign({ maxAge }, rawDescr);
        this.descrToId[descr] = id;
        return id;
    }
    /**
     * @param {Object} rawDescr
     * @param {unknown} rawValue
     * @param {Date} date
     */
    async insertMetric(rawDescr, rawValue, date) {
        const descr = JSON.stringify(rawDescr);
        if (!this.descrToId.hasOwnProperty(descr)) {
            return;
        }
        const id = this.descrToId[descr];
        let table = METRICS_OTHER;
        let value = rawValue;
        switch (typeof rawValue) {
            case 'boolean':
                table = METRICS_BOOLEAN;
                break;
            case 'number':
                table = METRICS_NUMBER;
                break;
            default:
                value = JSON.stringify(rawValue);
                break;
        }
        await this.run(`INSERT INTO ${table} (id, date, value) VALUES (?, ?, ?)`, id, date, value);
    }
    /**
     * Remove a metric with all its associated data
     * @param {Object} rawDescr
     */
    async unregisterMetric(rawDescr) {
        const descr = JSON.stringify(rawDescr);
        const id = this.descrToId[descr];
        await Promise.all(['metricIds', METRICS_NUMBER, METRICS_BOOLEAN, METRICS_OTHER].map((table) => {
            return this.run(`DELETE FROM ${table} WHERE id = ?`, id);
        }));
        delete this.descrToId[descr];
        delete this.idToDescr[id];
    }
    onPropertyChanged(property) {
        const thingId = property.getDevice().getId();
        const descr = this.propertyDescr(thingId, property.getName());
        property.getValue().then((value) => {
            this.insertMetric(descr, value, new Date());
        });
    }
    buildQuery(table, id, start, end, limit) {
        const conditions = [];
        const params = [];
        if (typeof id === 'number') {
            conditions.push('id = ?');
            params.push(id);
        }
        if (start || start === 0) {
            conditions.push('date > ?');
            params.push(start);
        }
        if (end) {
            conditions.push('date < ?');
            params.push(end);
        }
        let query = `SELECT id, value, date FROM ${table}`;
        if (conditions.length > 0) {
            query += ' WHERE ';
            query += conditions.join(' AND ');
        }
        if (limit) {
            query += ` LIMIT ${limit}`;
        }
        return {
            query,
            params,
        };
    }
    async loadMetrics(out, table, transformer, id, start, end) {
        const { query, params } = this.buildQuery(table, id, start, end, null);
        const rows = await this.all(query, ...params);
        for (const row of rows) {
            const descr = this.idToDescr[row.id];
            if (!descr) {
                console.error('Failed to load row:', row);
                continue;
            }
            if (!out.hasOwnProperty(descr.thing)) {
                out[descr.thing] = {};
            }
            if (!out[descr.thing].hasOwnProperty(descr.property)) {
                out[descr.thing][descr.property] = [];
            }
            const value = transformer ? transformer(row.value) : row.value;
            (out[descr.thing][descr.property]).push({
                value: value,
                date: row.date,
            });
        }
    }
    async getAll(start, end) {
        const out = {};
        await this.loadMetrics(out, METRICS_NUMBER, null, null, start, end);
        await this.loadMetrics(out, METRICS_BOOLEAN, (value) => !!value, null, start, end);
        await this.loadMetrics(out, METRICS_OTHER, (value) => JSON.parse(value), null, start, end);
        return out;
    }
    async get(thingId, start, end) {
        const all = await this.getAll(start, end);
        return all[thingId];
    }
    async getProperty(thingId, propertyName, start, end) {
        const descr = JSON.stringify(this.propertyDescr(thingId, propertyName));
        const out = {};
        const id = this.descrToId[descr];
        // TODO: determine property type to only do one of these
        await this.loadMetrics(out, METRICS_NUMBER, null, id, start, end);
        await this.loadMetrics(out, METRICS_BOOLEAN, (value) => !!value, id, start, end);
        await this.loadMetrics(out, METRICS_OTHER, (value) => JSON.parse(value), id, start, end);
        return out[thingId][propertyName];
    }
    async getSchema() {
        await this.loadKnownMetrics();
        const schema = [];
        for (const id in this.idToDescr) {
            const descr = this.idToDescr[id];
            schema.push({
                id,
                thing: descr.thing,
                property: descr.property,
            });
        }
        return schema;
    }
    async streamMetrics(callback, table, transformer, id, start, end) {
        const MAX_ROWS = 10000;
        start = start !== null && start !== void 0 ? start : 0;
        end = end !== null && end !== void 0 ? end : Date.now();
        let queryCompleted = false;
        while (!queryCompleted) {
            const { query, params } = this.buildQuery(table, id, start, end, MAX_ROWS);
            const rows = await this.all(query, ...params);
            if (rows.length < MAX_ROWS) {
                queryCompleted = true;
            }
            callback(rows.map((row) => {
                const value = transformer ? transformer(row.value) : row.value;
                return {
                    id: row.id,
                    value: value,
                    date: row.date,
                };
            }));
            if (!queryCompleted) {
                const lastRow = rows[rows.length - 1];
                start = lastRow.date;
                if (start >= end) {
                    queryCompleted = true;
                }
            }
        }
    }
    async streamAll(callback, start, end) {
        // Stream all three in parallel, which should look cool
        await Promise.all([
            this.streamMetrics(callback, METRICS_NUMBER, null, null, start, end),
            this.streamMetrics(callback, METRICS_BOOLEAN, (value) => !!value, null, start, end),
            this.streamMetrics(callback, METRICS_OTHER, (value) => JSON.parse(value), null, start, end),
        ]);
    }
    async clearOldMetrics() {
        await this.loadKnownMetrics();
        for (const id in this.idToDescr) {
            const descr = this.idToDescr[id];
            if (descr.maxAge <= 0) {
                continue;
            }
            const date = new Date(Date.now() - descr.maxAge);
            await Promise.all([METRICS_NUMBER, METRICS_BOOLEAN, METRICS_OTHER].map((table) => {
                return this.run(`DELETE FROM ${table} WHERE id = ? AND date < ?`, id, date);
            }));
        }
    }
    all(sql, ...values) {
        return new Promise((resolve, reject) => {
            try {
                this.db.all(sql, values, function (err, rows) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Run a SQL statement
     * @param {String} sql
     * @param {Array<unknown>} values
     * @return {Promise<Object>} promise resolved to `this` of statement result
     */
    run(sql, ...values) {
        return new Promise((resolve, reject) => {
            try {
                this.db.run(sql, values, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // node-sqlite puts results on "this" so avoid arrrow fn.
                    resolve(this);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.default = new Logs();
//# sourceMappingURL=logs.js.map