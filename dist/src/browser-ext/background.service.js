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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundService = void 0;
const io = __importStar(require("socket.io-client"));
const Browser = window.chrome || window.browser;
class BackgroundService {
    constructor() {
        this.tabsLoaded = new Map();
        this.defaultTimeout = 35000;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.socket = io.connect("http://localhost:3001", {
                'reconnection': true,
                'reconnectionDelay': 1000,
                'reconnectionDelayMax': 5000,
                'reconnectionAttempts': 0
            });
            this.socket.on('window.request', (request) => {
                const self = this;
                const response = { requestId: request.id, data: null, error: null };
                const timeout = request.params.timeout || this.defaultTimeout;
                let done = false;
                const timeoutId = setTimeout(() => {
                    if (done === true)
                        return;
                    done = true;
                    response.error = `${request.action} ${request.id} timeout`;
                    this.respond(response);
                }, timeout);
                self[request.action](request.params, (data = null) => {
                    if (done === true)
                        return;
                    done = true;
                    response.data = data;
                    this.respond(response);
                    clearTimeout(timeoutId);
                });
            });
            this.socket.on('tab.request', (request) => {
                this.sendMessage(request.tabId, { type: 'request', content: request });
            });
            Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
                this.onContentMessage(sender.tab.id, message);
                sendResponse();
            });
            setInterval(() => {
                this.log('browser.ping');
            }, 5000);
        });
    }
    onContentMessage(tabId, message) {
        if (message.type == 'window.loaded') {
            this.tabsLoaded.set(tabId, true);
            return;
        }
        if (message.type == 'tab.ping') {
            this.log('tab.ping');
            return;
        }
        if (message.type == 'tab.log') {
            this.log(message.content);
            return;
        }
        if (message.type == 'response') {
            this.respond(message.content);
        }
    }
    respond(response) {
        this.socket.emit(response.requestId, response);
    }
    sendMessage(tabId, message) {
        Browser.tabs.sendMessage(tabId, message);
    }
    log(message) {
        this.socket.emit('log', message);
    }
    createTab(_, callback) {
        Browser.tabs.create({ active: true }, (tab) => {
            callback(tab.id);
        });
    }
    load(params, callback) {
        Browser.tabs.update(params.tabId, { url: params.url });
        const intervalId = setInterval(() => {
            Browser.tabs.get(params.tabId, (tab) => {
                if (tab.status === 'unloaded') {
                    Browser.tabs.update(params.tabId, { url: params.url });
                }
                if (tab.status === 'complete') {
                    clearInterval(intervalId);
                    callback();
                }
            });
        }, 3000);
    }
    screenshot(_, callback) {
        Browser.tabs.captureVisibleTab((screenshotUrl) => {
            screenshotUrl = screenshotUrl.replace(/^data:image\/jpeg;base64,/, '');
            screenshotUrl = screenshotUrl.replace(/^data:image\/png;base64,/, '');
            callback(screenshotUrl);
        });
    }
}
exports.BackgroundService = BackgroundService;
//# sourceMappingURL=background.service.js.map