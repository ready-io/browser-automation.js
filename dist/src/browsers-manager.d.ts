import { LoggerService, Service } from "@ready.io/server";
import { Browser, BrowserOptions } from "./browser";
export declare class BrowsersManager extends Service {
    logger: LoggerService;
    protected unattachedBrowser: Browser;
    constructor(logger: LoggerService);
    /**
     * @throws Error
     */
    launch(options?: BrowserOptions): Promise<Browser>;
    attach(socket: any): void;
}
