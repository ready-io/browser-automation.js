import { Service } from "@ready.io/server";
import { BrowsersManager } from "../../src/index";
export declare class AppService extends Service {
    browsersManager: BrowsersManager;
    constructor(browsersManager: BrowsersManager);
    onInit(): Promise<void>;
    launchChrome(): Promise<void>;
    launchFirefox(): Promise<void>;
}
