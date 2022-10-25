"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForExpect = void 0;
const sleep_1 = __importDefault(require("../sleep"));
function waitForExpect(expect, wait = 2500) {
    return new Promise((resolve, reject) => {
        const interval = 500;
        const retry = async () => {
            try {
                await expect();
                resolve();
                return;
            }
            catch (err) {
                wait -= interval;
                if (wait <= 0) {
                    reject(err);
                    return;
                }
                await (0, sleep_1.default)(interval);
                retry();
            }
        };
        retry();
    });
}
exports.waitForExpect = waitForExpect;
//# sourceMappingURL=expect-utils.js.map