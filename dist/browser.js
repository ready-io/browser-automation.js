"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const child_process_1 = __importDefault(require("child_process"));
const util_1 = require("util");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const rimraf_1 = __importDefault(require("rimraf"));
const mkdtempAsync = util_1.promisify(fs.mkdtemp);
const uniqid_1 = __importDefault(require("uniqid"));
const browser_tab_1 = __importDefault(require("./browser-tab"));
const util_2 = require("./util");
//const COOKIE_PATH = `${process.cwd()}/dist/chrome-ext`;
const COOKIE_PATH = `${process.cwd()}/node_modules/@ready.io/browser-automation/dist/chrome-ext`;
//const COOKIE_PATH = `/home/santiago/dev/ready.io/browser-automation.js/dist/chrome-ext`;
class Browser {
    constructor(logger) {
        this.logger = logger;
        this.socket = null;
    }
    launch() {
        return __awaiter(this, void 0, void 0, function* () {
            const log = this.logger.action('Browser.launch');
            this.userDataDir = yield mkdtempAsync(path.join(os.tmpdir(), 'busca_multas_chrome_profile-'));
            this.proc = child_process_1.default.spawn('/usr/bin/google-chrome', [
                //'--no-sandbox',
                '--no-first-run',
                'about:blank',
                //`--user-data-dir=${this.userDataDir}`,
                //`--user-data-dir=/app/var/chrome_profile`,
                `--user-data-dir=/tmp/chrome_profile`,
                `--disable-extensions-except=${COOKIE_PATH}`,
                `--load-extension=${COOKIE_PATH}`,
            ]);
            if (!this.proc || !this.proc.pid) {
                log.error('Browser - The browser cannont be launched');
                throw new Error('Browser - The browser cannont be launched');
            }
            log.debug('browser launched');
        });
    }
    close() {
        const log = this.logger.action('Browser.close');
        try {
            rimraf_1.default.sync(this.userDataDir);
        }
        catch (error) { }
        if (this.proc && this.proc.pid && !this.proc.killed) {
            try {
                this.proc.kill('SIGKILL');
            }
            catch (error) {
                log.error('Browser - the browser cannot be closed');
                throw new Error('Browser - the browser cannot be closed');
            }
            log.debug('browser closed');
        }
    }
    request(action, params = {}, timeout = 35000) {
        return __awaiter(this, void 0, void 0, function* () {
            const socket = this.socket;
            const id = uniqid_1.default();
            const log = this.logger.action('Browser.request ' + id);
            if (socket.disconnected) {
                log.error(`The browser is unattached`);
                throw new Error("The browser is unattached");
            }
            yield util_2.sleep(1000);
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
                const request = { id: id, action: action, params: params };
                socket.on(id, responseListener);
                socket.emit('window.request', request);
            });
        });
    }
    createTab() {
        return __awaiter(this, void 0, void 0, function* () {
            const tabId = yield this.request('createTab');
            const tab = new browser_tab_1.default(this.logger, tabId, this);
            return tab;
        });
    }
}
exports.default = Browser;
//# sourceMappingURL=browser.js.map