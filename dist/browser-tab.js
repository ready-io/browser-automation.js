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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uniqid_1 = __importDefault(require("uniqid"));
const got_1 = __importDefault(require("got"));
const util_1 = require("./util");
class BrowserTab {
    constructor(logger, id, browser) {
        this.logger = logger;
        this.id = id;
        this.browser = browser;
        this.socket = null;
        this.url = "";
        this.socket = browser.socket;
    }
    request(action, params = {}, timeout = 35000) {
        return __awaiter(this, void 0, void 0, function* () {
            const socket = this.socket;
            const id = uniqid_1.default();
            const log = this.logger.action('BrowserTab.request ' + id);
            if (socket.disconnected) {
                log.error(`The browser is unattached`);
                throw new Error("The browser is unattached");
            }
            yield util_1.sleep(1000);
            log.debug(`${action}${params ? ' ' + JSON.stringify(params) : ''}`);
            return yield new Promise((resolve, reject) => {
                let responseListener;
                let timeoutId;
                let intervalId;
                const clear = () => {
                    clearTimeout(timeoutId);
                    clearInterval(intervalId);
                    socket.removeListener(id, responseListener);
                };
                const error = (message) => {
                    clear();
                    reject(new Error(message));
                    log.error(message);
                };
                responseListener = (response) => {
                    if (response.error)
                        return error(response.error);
                    clear();
                    resolve(response.data);
                    log.debug(`response`);
                };
                timeoutId = setTimeout(_ => { error(`The browser does not respond`); }, timeout + 5000);
                intervalId = setInterval(_ => socket.disconnected ? error(`The browser is unattached`) : null, 5000);
                params.timeout = timeout;
                const request = { id: id, tabId: this.id, action: action, params: params };
                socket.on(id, responseListener);
                socket.emit('tab.request', request);
            });
        });
    }
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.url = url;
            yield this.browser.request('load', {
                tabId: this.id,
                url: url,
                timeout: 35000,
            });
        });
    }
    screenshot() {
        return __awaiter(this, void 0, void 0, function* () {
            const base64 = yield this.browser.request('screenshot');
            return new Promise((resolve, reject) => {
                require("fs").writeFile("logs/out.jpeg", base64, 'base64', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(true);
                });
            });
        });
    }
    waitForVisible(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('waitForVisible', {
                selector: selector,
            });
        });
    }
    click(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('click', {
                selector: selector,
            });
        });
    }
    waitForHidden(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('waitForHidden', {
                selector: selector,
            });
        });
    }
    waitFor(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('waitFor', {
                selector: selector,
            });
        });
    }
    setValue(selector, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('setValue', {
                selector: selector,
                value: value,
            });
        });
    }
    waitForAjax(url, timeout = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('waitForAjax', {
                url: url,
            }, timeout);
        });
    }
    getReCaptchaParameters() {
        return this.request('getReCaptchaParameters');
    }
    waitForReCaptcha() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('waitForReCaptcha');
        });
    }
    solveReCaptchaV2() {
        return __awaiter(this, void 0, void 0, function* () {
            const log = this.logger.action('BrowserTab.solveReCaptchaV2');
            yield this.waitForReCaptcha();
            const reCaptchaParams = yield this.getReCaptchaParameters();
            const captcha2ApiKey = '928dd3a81cccc935a8982674e78baff5';
            log.debug(`recaptcha params ${JSON.stringify(reCaptchaParams)}`);
            const urlSet = `https://2captcha.com/in.php?key=${captcha2ApiKey}&method=userrecaptcha` +
                `&googlekey=${reCaptchaParams.sitekey}&json=1&pageurl=${this.url}`;
            const response = yield got_1.default(urlSet).json();
            log.debug(`2captcha sent ${urlSet} ${JSON.stringify(response)}`);
            const id = response.request;
            const urlGet = `https://2captcha.com/res.php?key=${captcha2ApiKey}&action=get&id=${id}&json=1`;
            let token = "";
            for (let attempt = 1; attempt <= 24; attempt++) {
                yield util_1.sleep(5000);
                let response = yield got_1.default(urlGet).json();
                log.debug(`2captcha response ${JSON.stringify(response)}`);
                if (response.status == 1) {
                    token = response.request;
                    break;
                }
            }
            if (token === "") {
                log.error("cannot get reCaptcha token");
                throw new Error("cannot get reCaptcha token");
            }
            yield this.request('solveReCaptchaV2', {
                callback: reCaptchaParams.callback,
                token: token
            });
        });
    }
}
exports.default = BrowserTab;
//# sourceMappingURL=browser-tab.js.map