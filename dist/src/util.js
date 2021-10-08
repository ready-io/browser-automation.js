"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.untilNull = exports.untilNotNull = exports.untilTrue = exports.untilNotEquals = exports.untilEquals = exports.untilCondition = exports.sleep = exports.HOURS = exports.HOUR = exports.MINUTES = exports.MINUTE = exports.SECONDS = exports.SECOND = void 0;
exports.SECOND = 1000;
exports.SECONDS = exports.SECOND;
exports.MINUTE = 60 * exports.SECOND;
exports.MINUTES = exports.MINUTE;
exports.HOUR = 60 * exports.MINUTE;
exports.HOURS = exports.HOUR;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function untilCondition(fun, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (fun()) {
            resolve(true);
            return;
        }
        let intervalId;
        let timeoutId;
        intervalId = setInterval(() => {
            if (fun()) {
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
exports.untilCondition = untilCondition;
function untilEquals(value, fun, timeout = 5000) {
    return untilCondition(() => fun() === value, timeout);
}
exports.untilEquals = untilEquals;
function untilNotEquals(value, fun, timeout = 5000) {
    return untilCondition(() => fun() !== value, timeout);
}
exports.untilNotEquals = untilNotEquals;
function untilTrue(fun, timeout = 5000) {
    return untilEquals(true, fun, timeout);
}
exports.untilTrue = untilTrue;
function untilNotNull(fun, timeout = 5000) {
    return untilNotEquals(null, fun, timeout);
}
exports.untilNotNull = untilNotNull;
function untilNull(fun, timeout = 5000) {
    return untilEquals(null, fun, timeout);
}
exports.untilNull = untilNull;
//# sourceMappingURL=util.js.map