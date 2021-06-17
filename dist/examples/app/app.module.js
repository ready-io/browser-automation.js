"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@ready.io/server");
const index_1 = require("../../src/index");
const app_service_1 = require("./app.service");
class AppModule extends server_1.Module {
    declare() {
        return [
            index_1.BrowserAutomationModule.config((options) => {
                options.logsLevel = 'debug';
            }),
            app_service_1.AppService
        ];
    }
}
exports.default = AppModule;
//# sourceMappingURL=app.module.js.map