import { LoggerService } from "@ready.io/server";
import Browser from "./browser";
export default class BrowsersManager {
    logger: LoggerService;
    protected unattachedBrowser: Browser;
    constructor(logger: LoggerService);
    start(): void;
    /**
     * @throws Error
     */
    launch(): Promise<Browser>;
    attach(socket: any): void;
}
