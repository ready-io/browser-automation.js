export declare class ContentService {
    defaultTimeout: number;
    init(): void;
    onBackgroundMessage(message: any): void;
    onWindowLoad(): void;
    onRequest(request: any): Promise<void>;
    sendMessage(message: any): void;
    log(message: any): void;
    getElement(selector: string): HTMLElement;
    getElements(selector: string): NodeListOf<HTMLElement>;
    isVisible(selector: string): boolean;
    waitForVisible(params: any): Promise<boolean>;
    waitForHidden(params: any): Promise<boolean>;
    waitFor(params: any): Promise<boolean>;
    setValue(params: any): void;
    click(params: any): void;
    waitForAjax(params: any): Promise<unknown>;
    waitForReCaptcha(params: any): Promise<boolean>;
    getReCaptchaParameters(_params: any): {
        callback: any;
        sitekey: any;
        pageurl: any;
    };
    solveReCaptchaV2(params: any): void;
    eval(params: any): Promise<any>;
}
