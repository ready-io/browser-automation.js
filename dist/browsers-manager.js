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
let BrowsersManager = class BrowsersManager extends server_1.Service {
    constructor(logger) {
        super();
        this.logger = logger;
        this.unattachedBrowser = null;
    }
    /**
     * @throws Error
     */
    launch() {
        return __awaiter(this, void 0, void 0, function* () {
            const log = this.logger.action('BrowsersManager.launch');
            if (this.unattachedBrowser !== null) {
                log.error("there is another browser launching");
                throw new Error("there is another browser launching");
            }
            log.debug('launching browser');
            const browser = new browser_1.Browser(this.logger);
            browser.launch();
            this.unattachedBrowser = browser;
            try {
                yield server_1.untilNotNull(() => browser.socket, 600000);
            }
            catch (error) {
                this.unattachedBrowser = null;
                browser.close();
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
        this.unattachedBrowser.socket = socket;
        this.unattachedBrowser = null;
    }
};
BrowsersManager = __decorate([
    server_1.Inject(),
    __metadata("design:paramtypes", [server_1.LoggerService])
], BrowsersManager);
exports.BrowsersManager = BrowsersManager;
//# sourceMappingURL=browsers-manager.js.map