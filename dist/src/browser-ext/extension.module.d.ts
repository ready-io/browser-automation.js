/// <reference types="chrome" />
declare global {
    interface Window {
        browser: typeof chrome;
    }
}
export declare class ExtensionModule {
    init(): void;
}
