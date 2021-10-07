import { Module, ConfigHandler } from "@ready.io/server";
import { BrowsersManager } from "./browsers-manager";
export declare class Options {
    logsDir: string;
    logsLevel: string;
}
export declare class BrowserAutomationModule extends Module {
    options: Options;
    static config(handler: ConfigHandler<Options>): (typeof import("@ready.io/server").Service | ConfigHandler<any>)[];
    declare(): ((typeof import("@ready.io/server").Service | ConfigHandler<any>)[] | typeof BrowsersManager)[];
    onInit(): void;
}
