"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const util_1 = require("../util");
const captcha_util_1 = require("./captcha-util");
class ContentService {
    constructor() {
        this.defaultTimeout = 35000;
    }
    init() {
        window.addEventListener('load', () => {
            this.onWindowLoad();
        });
        document.addEventListener("baext.background.message", (event) => __awaiter(this, void 0, void 0, function* () {
            this.onBackgroundMessage(event.detail);
        }));
    }
    onBackgroundMessage(message) {
        if (message.type == 'request') {
            this.onRequest(message.content);
        }
    }
    onWindowLoad() {
        this.sendMessage({ type: 'window.loaded' });
        /*setInterval(() =>
        {
          this.sendMessage({type: 'tab.ping', content: 'ok'});
        }, 5000);*/
    }
    onRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            const response = { requestId: request.id, data: null, error: null };
            try {
                response.data = yield self[request.action](request.params);
            }
            catch (error) {
                response.error = error.message;
            }
            this.sendMessage({ type: 'response', content: response });
        });
    }
    sendMessage(message) {
        document.dispatchEvent(new CustomEvent("baext.content.message", { 'detail': message }));
    }
    log(message) {
        this.sendMessage({ type: 'tab.log', content: message });
    }
    getElement(selector) {
        return document.querySelector(selector);
    }
    getElements(selector) {
        return document.querySelectorAll(selector);
    }
    isVisible(selector) {
        const el = this.getElement(selector);
        return el !== null && el.offsetParent !== null;
    }
    waitForVisible(params) {
        const selector = params.selector;
        const timeout = params.timeout || this.defaultTimeout;
        return util_1.untilTrue(() => this.isVisible(selector), timeout);
    }
    waitForHidden(params) {
        const selector = params.selector;
        const timeout = params.timeout || this.defaultTimeout;
        return util_1.untilTrue(() => !this.isVisible(selector), timeout);
    }
    waitFor(params) {
        const selector = params.selector;
        const timeout = params.timeout || this.defaultTimeout;
        return util_1.untilTrue(() => this.getElement(selector) !== null, timeout);
    }
    setValue(params) {
        const selector = params.selector;
        const value = params.value;
        const input = this.getElement(selector);
        if (input === null) {
            throw new Error("Element not found");
        }
        input.value = value;
        input.dispatchEvent(new Event("change"));
    }
    click(params) {
        const selector = params.selector;
        var button = this.getElement(selector);
        if (button === null) {
            throw new Error("Element not found");
        }
        button.click();
    }
    waitForAjax(params) {
        const url = params.url;
        const timeout = params.timeout || this.defaultTimeout;
        return new Promise((resolve, reject) => {
            let timeoutId;
            let eventListener;
            const clear = () => { clearTimeout(timeoutId); };
            timeoutId = setTimeout(() => {
                clear();
                reject('timeout reached waiting for ajax');
            }, timeout);
            eventListener = (event) => {
                const ajax = event.detail;
                if (ajax.url.includes(url)) {
                    clear();
                    resolve(ajax);
                }
            };
            document.addEventListener("BuscaMultasExtension.ajax", eventListener);
        });
    }
    waitForReCaptcha(params) {
        const timeout = params.timeout || this.defaultTimeout;
        return util_1.untilTrue(() => {
            const iframe = this.getElement("iframe[src^='https://www.google.com/recaptcha/api2/bframe']");
            const container = ((iframe || {}).parentNode || {}).parentNode || { style: {} };
            return container.style.opacity === "1";
        }, timeout);
    }
    getReCaptchaParameters(_params) {
        const reCaptchaParams = captcha_util_1.findReCaptchaParamateres();
        if (reCaptchaParams === null) {
            throw new Error("ReCaptcha parameters not found");
        }
        return {
            callback: reCaptchaParams.callback,
            sitekey: reCaptchaParams.sitekey,
            pageurl: reCaptchaParams.pageurl,
        };
    }
    solveReCaptchaV2(params) {
        const evalCode = `${params.callback}('${params.token}')`;
        eval(evalCode);
    }
    eval(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const util = {};
            util.untilTrue = util_1.untilTrue;
            return yield eval(`(${params.functionStr})(util)`);
        });
    }
}
exports.ContentService = ContentService;
//# sourceMappingURL=content.service.js.map