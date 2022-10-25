/**
 * Wraps up a promise in a slightly more convenient manner for passing
 * around, or saving.
 *
 * @module Deferred
 */
export default class Deferred<T, E> {
    private id;
    private promise;
    private resolveFunc?;
    private rejectFunc?;
    constructor();
    resolve(arg: T): void;
    reject(arg: E): void;
    getId(): number;
    getPromise(): Promise<T>;
}
//# sourceMappingURL=deferred.d.ts.map