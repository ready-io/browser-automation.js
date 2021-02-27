import { LoggerService, HttpService, Module } from "@ready.io/server";
import BrowsersManager from "./browsers-manager";
export default class BrowserAutomationModule extends Module {
    protected logger: LoggerService;
    protected http: HttpService;
    browsersManager: BrowsersManager;
    init(): void;
    startServices(): void;
    initControllers(): void;
}
