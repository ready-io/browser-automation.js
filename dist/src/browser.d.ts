import { Socket } from "socket.io";
import { BrowserTab } from "./browser-tab";
import { LoggerService, Service } from "@ready.io/server";
export interface BrowserOptions {
    name?: string;
    args?: string[];
    binary?: string;
}
export declare class Browser extends Service {
    logger: LoggerService;
    id: string;
    protected proc: any;
    socket: Socket;
    defaultTimeout: number;
    options: BrowserOptions;
    constructor(logger: LoggerService);
    launch(options?: BrowserOptions): void;
    protected launchFirefox(args?: string[]): Promise<void>;
    protected launchChrome(args?: string[]): Promise<void>;
    setSocket(socket: Socket): void;
    close(): Promise<void>;
    timeout(timeout: number): void;
    request<T>(action: string, params?: any): Promise<T>;
    createTab(): Promise<BrowserTab>;
    removeChromeTmpFiles(): void;
}
