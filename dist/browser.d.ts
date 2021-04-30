import { Socket } from "socket.io";
import { BrowserTab } from "./browser-tab";
import { LoggerService, Service } from "@ready.io/server";
export declare class Browser extends Service {
    logger: LoggerService;
    protected proc: any;
    protected userDataDir: string;
    socket: Socket;
    defaultTimeout: number;
    constructor(logger: LoggerService);
    launch(): Promise<void>;
    close(): void;
    timeout(timeout: number): void;
    request<T>(action: string, params?: any): Promise<T>;
    createTab(): Promise<BrowserTab>;
}
