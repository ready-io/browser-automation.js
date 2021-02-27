"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.untilNotNull = exports.untilTrue = exports.untilEquals = exports.sleep = exports.HOUR = exports.MINUTE = exports.SECOND = void 0;
exports.SECOND = 1000;
exports.MINUTE = 60 * exports.SECOND;
exports.HOUR = 60 * exports.MINUTE;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function untilEquals(value, fun, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (fun() === value) {
            resolve(true);
            return;
        }
        let intervalId;
        let timeoutId;
        intervalId = setInterval(() => {
            if (fun() === value) {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                resolve(true);
            }
        }, 200);
        if (timeout) {
            timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                reject(new Error('waiting until a condition is fulfilled, timeout reached'));
            }, timeout);
        }
    });
}
exports.untilEquals = untilEquals;
function untilTrue(fun, timeout = 5000) {
    return untilEquals(true, fun, timeout);
}
exports.untilTrue = untilTrue;
function untilNotNull(fun, timeout = 5000) {
    return untilEquals(true, () => fun() !== null, timeout);
}
exports.untilNotNull = untilNotNull;
//# sourceMappingURL=util.js.map