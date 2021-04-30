import { LoggerService, Service } from "@ready.io/server";
import { Browser } from "./browser";
export declare class BrowsersManager extends Service {
    logger: LoggerService;
    protected unattachedBrowser: Browser;
    constructor(logger: LoggerService);
    /**
     * @throws Error
     */
    launch(): Promise<Browser>;
    attach(socket: any): void;
}
