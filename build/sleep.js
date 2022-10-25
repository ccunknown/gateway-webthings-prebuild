"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function sleep(ms) {
    return await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.default = sleep;
//# sourceMappingURL=sleep.js.map