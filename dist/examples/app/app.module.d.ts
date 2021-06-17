import { Module } from "@ready.io/server";
import { AppService } from "./app.service";
export default class AppModule extends Module {
    declare(): ((typeof import("@ready.io/server").Service | import("@ready.io/server").ConfigHandler<any>)[] | typeof AppService)[];
}
