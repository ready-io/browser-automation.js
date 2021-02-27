import { LoggerService, HttpService } from '@ready.io/server';
import BrowsersManager from './browsers-manager';
export default class BrowsersController {
    http: HttpService;
    logger: LoggerService;
    browsersManager: BrowsersManager;
    constructor(http: HttpService, logger: LoggerService, browsersManager: BrowsersManager);
    init(): void;
}
