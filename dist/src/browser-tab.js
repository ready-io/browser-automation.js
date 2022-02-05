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
exports.BrowserTab = void 0;
const uniqid_1 = __importDefault(require("uniqid"));
const got_1 = __importDefault(require("got"));
const server_1 = require("@ready.io/server");
class BrowserTab {
    constructor(logger, id, browser) {
        this.logger = logger;
        this.id = id;
        this.browser = browser;
        this.socket = null;
        this.defaultTimeout = 35000;
        this.socket = browser.socket;
    }
    timeout(timeout) {
        this.defaultTimeout = timeout;
        this.browser.defaultTimeout = timeout;
    }
    request(action, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const socket = this.socket;
            const id = uniqid_1.default();
            const log = this.logger.action('BrowserTab.request ' + id);
            const timeout = this.defaultTimeout;
            if (socket.disconnected) {
                log.error(`The browser is unattached`);
                throw new Error("The browser is unattached");
            }
            yield server_1.sleep(1000);
            log.debug(`${action}${params ? ' ' + JSON.stringify(params) : ''}`);
            return new Promise((resolve, reject) => {
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
            yield this.browser.request('load', {
                tabId: this.id,
                url: url,
            });
        });
    }
    /**
     * @param string path - chrome "logs/out.jpeg", firefox "logs/out.png"
     */
    screenshot(path = "") {
        return __awaiter(this, void 0, void 0, function* () {
            if (!path) {
                switch (this.browser.options.name) {
                    case "chrome":
                        path = "logs/out.jpeg";
                        break;
                    case "firefox":
                        path = "logs/out.png";
                        break;
                    default: throw new Error("Unsupported browser");
                }
            }
            const base64 = yield this.browser.request('screenshot');
            return new Promise((resolve, reject) => {
                require("fs").writeFile(path, base64, 'base64', (err) => {
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
    waitForAjax(url) {
        return this.request('waitForAjax', {
            url: url,
        });
    }
    waitForReCaptcha() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('waitForReCaptcha');
        });
    }
    getReCaptchaParameters() {
        return this.request('getReCaptchaParameters');
    }
    solveReCaptchaV2(captcha2ApiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = this.logger.action('BrowserTab.solveReCaptchaV2');
            yield this.waitForReCaptcha();
            const reCaptchaParams = yield this.getReCaptchaParameters();
            log.debug(`recaptcha params ${JSON.stringify(reCaptchaParams)}`);
            const urlSet = `https://2captcha.com/in.php?key=${captcha2ApiKey}&method=userrecaptcha` +
                `&googlekey=${reCaptchaParams.sitekey}&json=1&pageurl=${reCaptchaParams.pageurl}`;
            const response = yield got_1.default(urlSet).json();
            log.debug(`2captcha sent ${urlSet} ${JSON.stringify(response)}`);
            const id = response.request;
            const urlGet = `https://2captcha.com/res.php?key=${captcha2ApiKey}&action=get&id=${id}&json=1`;
            let token = "";
            for (let attempt = 1; attempt <= 24; attempt++) {
                yield server_1.sleep(5000);
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
    eval(functionStr) {
        return this.request('eval', {
            functionStr: functionStr
        });
    }
    getBoundingClientRect(selector) {
        return this.request('getBoundingClientRect', {
            selector: selector,
        });
    }
    scroll(x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('scroll', {
                x: x,
                y: y,
            });
        });
    }
    screenshotRect(rect) {
        return this.browser.request('screenshotRect', {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        });
    }
    base64ToFile(path, base64) {
        return new Promise((resolve, reject) => {
            require("fs").writeFile(path, base64, 'base64', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    solveCaptcha(selector, captcha2ApiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = this.logger.action('BrowserTab.solveCaptcha');
            const captchaRect = yield this.getBoundingClientRect(selector);
            const captchaBase64 = yield this.screenshotRect(captchaRect);
            const urlSet = `https://2captcha.com/in.php`;
            //await this.base64ToFile("logs/out.png", captchaBase64);
            const response = yield got_1.default.post(urlSet, {
                form: {
                    method: "base64",
                    key: captcha2ApiKey,
                    body: captchaBase64,
                    json: 1
                }
            }).json();
            log.debug(`2captcha sent ${urlSet} ${JSON.stringify(response)}`);
            const id = response.request;
            const urlGet = `https://2captcha.com/res.php?key=${captcha2ApiKey}&action=get&id=${id}&json=1`;
            let text = "";
            for (let attempt = 1; attempt <= 24; attempt++) {
                yield server_1.sleep(5000);
                let response = yield got_1.default(urlGet).json();
                log.debug(`2captcha response ${JSON.stringify(response)}`);
                if (response.status == 1) {
                    text = response.request;
                    break;
                }
            }
            if (text === "") {
                log.error("cannot get captcha text");
                throw new Error("cannot get captcha text");
            }
            return text;
        });
    }
}
exports.BrowserTab = BrowserTab;
//# sourceMappingURL=browser-tab.js.map