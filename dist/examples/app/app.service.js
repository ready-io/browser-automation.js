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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const server_1 = require("@ready.io/server");
const index_1 = require("../../src/index");
const find_package_json_1 = __importDefault(require("find-package-json"));
const path_1 = __importDefault(require("path"));
const PATH = path_1.default.dirname(find_package_json_1.default(__dirname).next().filename);
let AppService = class AppService extends server_1.Service {
    constructor(browsersManager) {
        super();
        this.browsersManager = browsersManager;
    }
    onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.launchChrome();
            yield server_1.sleep(30 * server_1.SECONDS);
            yield this.launchFirefox();
        });
    }
    launchChrome() {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield this.browsersManager.launch();
            const tab = yield browser.createTab();
            let ajax = null;
            yield tab.load("https://github.com/hrcarsan");
            yield tab.click('[href="/hrcarsan?tab=repositories"]');
            yield server_1.sleep(5 * server_1.SECONDS);
            yield tab.setValue('#your-repos-filter', 'easy');
            yield tab.click('#type-options .btn');
            yield tab.waitForVisible('[data-toggle-for="type-options"]');
            yield tab.click('[data-toggle-for="type-options"]');
            tab.waitForAjax('q=easy').then(a => ajax = a);
            yield tab.click('#type_source');
            yield server_1.untilNotNull(() => ajax, 35 * server_1.SECONDS);
            browser.close();
            console.log(ajax.url);
        });
    }
    launchFirefox() {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield this.browsersManager.launch({
                name: 'firefox',
                binary: `${PATH}/browsers/firefox-89.0/firefox/firefox`
            });
            const tab = yield browser.createTab();
            let ajax = null;
            yield tab.load("https://github.com/hrcarsan");
            yield tab.click('[href="/hrcarsan?tab=repositories"]');
            yield server_1.sleep(5 * server_1.SECONDS);
            yield tab.setValue('#your-repos-filter', 'easy');
            yield tab.click('#type-options .btn');
            yield tab.waitForVisible('[data-toggle-for="type-options"]');
            yield tab.click('[data-toggle-for="type-options"]');
            tab.waitForAjax('q=easy').then(a => ajax = a);
            yield tab.click('#type_source');
            yield server_1.untilNotNull(() => ajax, 35 * server_1.SECONDS);
            browser.close();
            console.log(ajax.url);
        });
    }
};
AppService = __decorate([
    server_1.Inject(),
    __metadata("design:paramtypes", [index_1.BrowsersManager])
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map