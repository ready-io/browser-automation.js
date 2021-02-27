import Browser from "./browser";
import { Socket } from "socket.io";
import { LoggerService } from "@ready.io/server";
export interface Ajax {
    url: string;
    response: string;
}
export default class BrowserTab {
    logger: LoggerService;
    id: string;
    browser: Browser;
    socket: Socket;
    url: string;
    constructor(logger: LoggerService, id: string, browser: Browser);
    request<T>(action: string, params?: any, timeout?: number): Promise<T>;
    load(url: string): Promise<void>;
    screenshot(): Promise<unknown>;
    waitForVisible(selector: string): Promise<void>;
    click(selector: string): Promise<void>;
    waitForHidden(selector: string): Promise<void>;
    waitFor(selector: string): Promise<void>;
    setValue(selector: string, value: string): Promise<void>;
    waitForAjax(url: string, timeout?: number): Promise<Ajax>;
    getReCaptchaParameters(): Promise<{
        callback: string;
        sitekey: string;
    }>;
    waitForReCaptcha(): Promise<void>;
    solveReCaptchaV2(): Promise<void>;
}
