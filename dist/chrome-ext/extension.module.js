"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionModule = void 0;
const background_service_1 = require("./background.service");
const content_service_1 = require("./content.service");
class ExtensionModule {
    init() {
        if (window.location.href.includes("chrome-extension")) {
            const backgroundService = new background_service_1.BackgroundService();
            backgroundService.init();
        }
        else {
            const contentService = new content_service_1.ContentService();
            contentService.init();
        }
    }
}
exports.ExtensionModule = ExtensionModule;
//# sourceMappingURL=extension.module.js.map