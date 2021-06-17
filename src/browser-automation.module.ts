import {HttpService, Module, LoggerModule, Inject, ConfigHandler} from "@ready.io/server";
import {BrowsersController} from './browsers.controller';
import {BrowsersManager} from "./browsers-manager";

export class Options
{
  port = 3001;
  logsDir: string = '';
  logsLevel: string = 'error';
}


@Inject()
export class BrowserAutomationModule extends Module
{
  options = new Options();


  static config(handler: ConfigHandler<Options>)
  {
    return super.config(handler);
  }


  declare()
  {
    return [
      LoggerModule.config((options) =>
      {
        options.dir = this.options.logsDir;
        options.level = this.options.logsLevel;
      }),
      HttpService.config((options) =>
      {
        options.port = this.options.port;
        options.socketsServer.enabled = true;
        options.socketsServer.cors = {origin: '*'};
      }),
      BrowsersManager,
      BrowsersController,
    ];
  }


  onInit()
  {
    this.logger.action('BrowserAutomationModule.init').debug(' ⚡');
  }
}

