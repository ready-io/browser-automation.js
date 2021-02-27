"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BrowsersController {
    constructor(http, logger, browsersManager) {
        this.http = http;
        this.logger = logger;
        this.browsersManager = browsersManager;
    }
    init() {
        const log = this.logger.action('AppController.init');
        this.http.io.on('connection', (socket) => {
            log.debug('socket connected ' + socket.id);
            this.browsersManager.attach(socket);
            socket.on('disconnect', (reason) => {
                log.debug('socket disconnected ' + socket.id + ' ' + reason + ' ' + socket.disconnected);
            });
        });
    }
}
exports.default = BrowsersController;
//# sourceMappingURL=browsers.controller.js.map