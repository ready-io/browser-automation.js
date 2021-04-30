import {HttpService, Module, LoggerModule, Inject} from "@ready.io/server";
import {BrowsersController} from './browsers.controller';
import {BrowsersManager} from "./browsers-manager";

export class Options
{

}


@Inject()
export class BrowserAutomationModule extends Module
{
  declare()
  {
    return [
      LoggerModule.config((options) =>
      {
        options.level = 'debug';
      }),
      HttpService.config((options) =>
      {
        options.port = 3001;
        options.socketsServer.enabled = true;
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

