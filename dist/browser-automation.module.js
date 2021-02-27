"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@ready.io/server");
const browsers_controller_1 = __importDefault(require("./browsers.controller"));
const browsers_manager_1 = __importDefault(require("./browsers-manager"));
class BrowserAutomationModule extends server_1.Module {
    init() {
        this.logger = new server_1.LoggerService({ dir: 'logs', level: 'debug' });
        this.logger.start();
        const log = this.logger.action('BrowserAutomationModule.init');
        this.startServices();
        this.initControllers();
        log.info(' ⚡');
    }
    startServices() {
        this.http = new server_1.HttpService({
            port: 3001,
            sockets_server: true,
        }, this.logger);
        this.http.start();
        this.browsersManager = new browsers_manager_1.default(this.logger);
        this.browsersManager.start();
    }
    initControllers() {
        const browsersController = new browsers_controller_1.default(this.http, this.logger, this.browsersManager);
        browsersController.init();
    }
}
exports.default = BrowserAutomationModule;
//# sourceMappingURL=browser-automation.module.js.map