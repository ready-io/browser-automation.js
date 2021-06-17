"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserAutomationModule = exports.Options = void 0;
const server_1 = require("@ready.io/server");
const browsers_controller_1 = require("./browsers.controller");
const browsers_manager_1 = require("./browsers-manager");
class Options {
    constructor() {
        this.port = 3001;
        this.logsDir = '';
        this.logsLevel = 'error';
    }
}
exports.Options = Options;
let BrowserAutomationModule = class BrowserAutomationModule extends server_1.Module {
    constructor() {
        super(...arguments);
        this.options = new Options();
    }
    static config(handler) {
        return super.config(handler);
    }
    declare() {
        return [
            server_1.LoggerModule.config((options) => {
                options.dir = this.options.logsDir;
                options.level = this.options.logsLevel;
            }),
            server_1.HttpService.config((options) => {
                options.port = this.options.port;
                options.socketsServer.enabled = true;
                options.socketsServer.cors = { origin: '*' };
            }),
            browsers_manager_1.BrowsersManager,
            browsers_controller_1.BrowsersController,
        ];
    }
    onInit() {
        this.logger.action('BrowserAutomationModule.init').debug(' ⚡');
    }
};
BrowserAutomationModule = __decorate([
    server_1.Inject()
], BrowserAutomationModule);
exports.BrowserAutomationModule = BrowserAutomationModule;
//# sourceMappingURL=browser-automation.module.js.map