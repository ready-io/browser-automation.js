import { Module } from "@ready.io/server";
import { BrowsersController } from './browsers.controller';
import { BrowsersManager } from "./browsers-manager";
export declare class Options {
}
export declare class BrowserAutomationModule extends Module {
    declare(): ((typeof import("@ready.io/server").Service | import("@ready.io/server").ConfigHandler<any>)[] | typeof BrowsersManager | typeof BrowsersController)[];
    onInit(): void;
}
