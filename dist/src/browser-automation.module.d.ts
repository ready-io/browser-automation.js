import { Module, ConfigHandler } from "@ready.io/server";
import { BrowsersController } from './browsers.controller';
import { BrowsersManager } from "./browsers-manager";
export declare class Options {
    port: number;
    logsDir: string;
    logsLevel: string;
}
export declare class BrowserAutomationModule extends Module {
    options: Options;
    static config(handler: ConfigHandler<Options>): (typeof import("@ready.io/server").Service | ConfigHandler<any>)[];
    declare(): ((typeof import("@ready.io/server").Service | ConfigHandler<any>)[] | typeof BrowsersManager | typeof BrowsersController)[];
    onInit(): void;
}
