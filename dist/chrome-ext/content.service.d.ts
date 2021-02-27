export default class ContentService {
    defaultTimeout: number;
    start(): void;
    onBackgroundMessage(message: any): void;
    onWindowLoad(): void;
    onRequest(request: any): Promise<void>;
    sendMessage(message: any): void;
    getElement(selector: string): HTMLElement;
    isVisible(selector: string): boolean;
    waitForVisible(params: any): Promise<boolean>;
    waitForHidden(params: any): Promise<boolean>;
    waitFor(params: any): Promise<boolean>;
    setValue(params: any): void;
    click(params: any): void;
    waitForAjax(params: any): Promise<unknown>;
    waitForReCaptcha(): Promise<boolean>;
    getReCaptchaParameters(): {
        callback: any;
        sitekey: any;
    };
    solveReCaptchaV2(params: any): void;
}
