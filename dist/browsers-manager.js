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
const browser_1 = __importDefault(require("./browser"));
const util_1 = require("./util");
class BrowsersManager {
    constructor(logger) {
        this.logger = logger;
        this.unattachedBrowser = null;
    }
    start() {
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
            const browser = new browser_1.default(this.logger);
            browser.launch();
            this.unattachedBrowser = browser;
            try {
                yield util_1.untilNotNull(() => browser.socket);
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
}
exports.default = BrowsersManager;
//# sourceMappingURL=browsers-manager.js.map