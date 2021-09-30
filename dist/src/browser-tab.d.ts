import { Browser } from "./browser";
import { Socket } from "socket.io";
import { LoggerService } from "@ready.io/server";
export interface Ajax {
    url: string;
    response: string;
}
export interface Rectangule {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ElementRect {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export declare class BrowserTab {
    logger: LoggerService;
    id: string;
    browser: Browser;
    protected socket: Socket;
    protected defaultTimeout: number;
    constructor(logger: LoggerService, id: string, browser: Browser);
    timeout(timeout: number): void;
    protected request<T>(action: string, params?: any): Promise<T>;
    load(url: string): Promise<void>;
    /**
     * @param string path - chrome "logs/out.jpeg", firefox "logs/out.png"
     */
    screenshot(path?: string): Promise<unknown>;
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
        pageurl: string;
    }>;
    solveReCaptchaV2(captcha2ApiKey: string): Promise<void>;
    eval(functionStr: string): Promise<any>;
    getBoundingClientRect(selector: string): Promise<ElementRect>;
    scroll(x: number, y: number): Promise<void>;
    screenshotRect(rect: Rectangule): Promise<string>;
    base64ToFile(path: string, base64: string): Promise<void>;
    solveCaptcha(selector: string, captcha2ApiKey: string): Promise<string>;
}
