"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const background_service_1 = __importDefault(require("./background.service"));
const content_service_1 = __importDefault(require("./content.service"));
class ExtensionModule {
    init() {
        if (window.location.href.includes("chrome-extension")) {
            const backgroundService = new background_service_1.default();
            backgroundService.start();
        }
        else {
            const contentService = new content_service_1.default();
            contentService.start();
        }
    }
}
exports.default = ExtensionModule;
//# sourceMappingURL=extension.module.js.map