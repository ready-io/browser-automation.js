import { Socket } from "socket.io";
import BrowserTab from "./browser-tab";
import { LoggerService } from "@ready.io/server";
export default class Browser {
    logger: LoggerService;
    protected proc: any;
    protected userDataDir: string;
    socket: Socket;
    constructor(logger: LoggerService);
    launch(): Promise<void>;
    close(): void;
    request<T>(action: string, params?: any, timeout?: number): Promise<T>;
    createTab(): Promise<BrowserTab>;
}
