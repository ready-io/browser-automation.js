import { Browser } from "./browser";
import { Socket } from "socket.io";
import { LoggerService } from "@ready.io/server";
export interface Ajax {
    url: string;
    response: string;
}
export declare class BrowserTab {
    logger: LoggerService;
    id: string;
    browser: Browser;
    protected socket: Socket;
    protected defaultTimeout: number;
    protected url: string;
    constructor(logger: LoggerService, id: string, browser: Browser);
    timeout(timeout: number): void;
    protected request<T>(action: string, params?: any): Promise<T>;
    load(url: string): Promise<void>;
    screenshot(): Promise<unknown>;
    waitForVisible(selector: string): Promise<void>;
    click(selector: string): Promise<void>;
    waitForHidden(selector: string): Promise<void>;
    waitFor(selector: string): Promise<void>;
    setValue(selector: string, value: string): Promise<void>;
    waitForAjax(url: string): Promise<Ajax>;
    waitForReCaptcha(): Promise<void>;
    getReCaptchaParameters(): Promise<{
        callback: string;
        sitekey: string;
    }>;
    solveReCaptchaV2(captcha2ApiKey: string): Promise<void>;
    eval(functionStr: string): Promise<any>;
}
