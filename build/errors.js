"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpErrorWithCode = void 0;
class HttpErrorWithCode extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.HttpErrorWithCode = HttpErrorWithCode;
//# sourceMappingURL=errors.js.map