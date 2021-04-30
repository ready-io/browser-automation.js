import { LoggerService, HttpService, Controller } from '@ready.io/server';
import { BrowsersManager } from './browsers-manager';
export declare class BrowsersController extends Controller {
    http: HttpService;
    logger: LoggerService;
    browsersManager: BrowsersManager;
    constructor(http: HttpService, logger: LoggerService, browsersManager: BrowsersManager);
    onInit(): void;
}
