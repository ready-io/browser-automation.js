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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowsersManager = void 0;
const server_1 = require("@ready.io/server");
const browser_1 = require("./browser");
const util_1 = require("./util");
let BrowsersManager = class BrowsersManager extends server_1.Service {
    constructor(logger, http) {
        super();
        this.logger = logger;
        this.http = http;
        this.unattachedBrowser = null;
    }
    onInit() {
        this.http.io.on('connection', socket => this.attach(socket));
    }
    /**
     * @throws Error
     */
    launch(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = this.logger.action('BrowsersManager.launch');
            try {
                if (this.unattachedBrowser !== null) {
                    yield util_1.untilNull(() => this.unattachedBrowser, 60000);
                }
            }
            catch (error) {
                log.error("there is another browser launching");
                throw new Error("there is another browser launching");
            }
            this.unattachedBrowser = new browser_1.Browser(this.logger);
            log.debug('launching browser');
            const browser = this.unattachedBrowser;
            browser.launch(options);
            try {
                yield server_1.untilNotNull(() => browser.socket, 60000);
            }
            catch (error) {
                this.unattachedBrowser = null;
                yield browser.close();
                log.error('BrowsersManager.launch - the WebSocket cannot be attached');
                throw new Error('BrowsersManager.launch - the WebSocket cannot be attached');
            }
            log.debug('browser attached');
            browser.socket.on('log', (message) => { log.debug(message); });
            return browser;
        });
    }
    attach(socket) {
        if (this.unattachedBrowser === null) {
            return;
        }
        const log = this.logger.action('BrowsersManager.attach');
        log.debug('socket connected ' + socket.id);
        this.unattachedBrowser.setSocket(socket);
        this.unattachedBrowser = null;
        socket.on('disconnect', (reason) => {
            const log = this.logger.action('BrowsersManager.unattach');
            log.debug('socket disconnected', socket.id, reason, socket.disconnected);
        });
    }
};
BrowsersManager = __decorate([
    server_1.Inject(),
    __metadata("design:paramtypes", [server_1.LoggerService,
        server_1.HttpService])
], BrowsersManager);
exports.BrowsersManager = BrowsersManager;
//# sourceMappingURL=browsers-manager.js.map