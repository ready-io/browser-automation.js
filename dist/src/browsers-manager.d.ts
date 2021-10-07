import { HttpService, LoggerService, Service } from "@ready.io/server";
import { Socket } from "socket.io";
import { Browser, BrowserOptions } from "./browser";
export declare class BrowsersManager extends Service {
    logger: LoggerService;
    http: HttpService;
    protected unattachedBrowser: Browser;
    constructor(logger: LoggerService, http: HttpService);
    onInit(): void;
    /**
     * @throws Error
     */
    launch(options?: BrowserOptions): Promise<Browser>;
    attach(socket: Socket): void;
}
