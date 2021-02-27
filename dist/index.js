"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserTab = exports.Browser = exports.BrowsersManager = exports.BrowserAutomationModule = void 0;
const browser_1 = __importDefault(require("./browser"));
exports.Browser = browser_1.default;
const browser_automation_module_1 = __importDefault(require("./browser-automation.module"));
exports.BrowserAutomationModule = browser_automation_module_1.default;
const browser_tab_1 = __importDefault(require("./browser-tab"));
exports.BrowserTab = browser_tab_1.default;
const browsers_manager_1 = __importDefault(require("./browsers-manager"));
exports.BrowsersManager = browsers_manager_1.default;
//# sourceMappingURL=index.js.map