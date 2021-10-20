"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.Browser = void 0;
const child_process_1 = __importDefault(require("child_process"));
const uniqid_1 = __importDefault(require("uniqid"));
const browser_tab_1 = require("./browser-tab");
const server_1 = require("@ready.io/server");
const tree_kill_1 = __importDefault(require("tree-kill"));
const find_package_json_1 = __importDefault(require("find-package-json"));
const path_1 = __importDefault(require("path"));
const rimraf_1 = __importDefault(require("rimraf"));
const PATH = path_1.default.dirname(find_package_json_1.default(__dirname).next().filename);
const EXTENSION_PATH = `${PATH}/dist/src/browser-ext`;
let Browser = class Browser extends server_1.Service {
    constructor(logger) {
        super();
        this.logger = logger;
        this.socket = null;
        this.defaultTimeout = 35000;
        this.options = {};
        this.id = uniqid_1.default();
    }
    launch(options = {}) {
        const log = this.logger.action('Browser.launch');
        options =
            {
                name: options.name || 'chrome',
                args: options.args || [],
                binary: options.binary || '',
            };
        this.options = options;
        if (options.name == 'firefox') {
            this.launchFirefox(options.args);
        }
        else {
            this.launchChrome(options.args);
        }
        if (!this.proc || !this.proc.pid) {
            log.error('Browser - The browser cannont be launched');
            throw new Error('Browser - The browser cannont be launched');
        }
        log.debug(`browser launched id ${this.id}`);
    }
    launchFirefox(args = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.binary) {
                args.push(`--firefox=${this.options.binary}`);
            }
            this.proc = child_process_1.default.spawn('web-ext', [
                `run`,
                `--source-dir=${EXTENSION_PATH}`,
                `--no-reload`,
                ...args
            ]);
        });
    }
    launchChrome(args = []) {
        return __awaiter(this, void 0, void 0, function* () {
            this.proc = child_process_1.default.spawn('/usr/bin/google-chrome', [
                '--no-first-run',
                'about:blank',
                `--user-data-dir=/tmp/chrome_profile${this.id}`,
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                `--disable-dev-shm-usage`,
                ...args
            ]);
        });
    }
    setSocket(socket) {
        this.socket = socket;
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            const log = this.logger.action('Browser.close');
            if (this.proc && this.proc.pid && !this.proc.killed) {
                try {
                    tree_kill_1.default(this.proc.pid);
                }
                catch (error) {
                    log.error('Browser - the browser cannot be closed');
                    throw new Error('Browser - the browser cannot be closed');
                }
            }
            try {
                yield server_1.untilTrue(() => this.socket.disconnected, 60000);
            }
            catch (error) {
                log.error('Browser - the browser cannot be unattached');
                throw new Error('Browser - the browser cannot be unattached');
            }
            if (this.options.name == 'chrome') {
                log.info('rimraf chrome_profile');
                rimraf_1.default(`/tmp/chrome_profile${this.id}`, (error) => {
                    if (error) {
                        log.error(error.stack);
                    }
                });
            }
            log.debug('browser closed');
        });
    }
    timeout(timeout) {
        this.defaultTimeout = timeout;
    }
    request(action, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const socket = this.socket;
            const id = uniqid_1.default();
            const log = this.logger.action('Browser.request ' + id);
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
                const request = { id: id, action: action, params: params };
                socket.on(id, responseListener);
                socket.emit('window.request', request);
            });
        });
    }
    createTab() {
        return __awaiter(this, void 0, void 0, function* () {
            const tabId = yield this.request('createTab');
            const tab = new browser_tab_1.BrowserTab(this.logger, tabId, this);
            return tab;
        });
    }
};
Browser = __decorate([
    server_1.Inject(),
    __metadata("design:paramtypes", [server_1.LoggerService])
], Browser);
exports.Browser = Browser;
//# sourceMappingURL=browser.js.map