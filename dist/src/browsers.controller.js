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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowsersController = void 0;
const server_1 = require("@ready.io/server");
const browsers_manager_1 = require("./browsers-manager");
let BrowsersController = class BrowsersController extends server_1.Controller {
    constructor(http, logger, browsersManager) {
        super(http);
        this.http = http;
        this.logger = logger;
        this.browsersManager = browsersManager;
    }
    onInit() {
        this.http.io.on('connection', (socket) => {
            const log = this.logger.action('AppController.connection');
            log.debug('socket connected ' + socket.id);
            this.browsersManager.attach(socket);
            socket.on('disconnect', (reason) => {
                const log = this.logger.action('AppController.disconnect');
                log.debug('socket disconnected', socket.id, reason, socket.disconnected);
            });
        });
    }
};
BrowsersController = __decorate([
    server_1.Inject(),
    __metadata("design:paramtypes", [server_1.HttpService,
        server_1.LoggerService,
        browsers_manager_1.BrowsersManager])
], BrowsersController);
exports.BrowsersController = BrowsersController;
//# sourceMappingURL=browsers.controller.js.map