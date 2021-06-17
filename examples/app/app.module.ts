import {Module} from "@ready.io/server";
import {BrowserAutomationModule} from "../../src/index";
import {AppService} from "./app.service";


export default class AppModule extends Module
{
  declare()
  {
    return [
      BrowserAutomationModule.config((options) =>
      {
        options.logsLevel = 'debug';
      }),
      AppService
    ];
  }
}

