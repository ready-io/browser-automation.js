import { LoggerService, HttpService, Module } from "@ready.io/server";
import BrowsersController from './browsers.controller';
import BrowsersManager from "./browsers-manager";

export default class BrowserAutomationModule extends Module
{
  protected logger: LoggerService;
  protected http: HttpService;
  public browsersManager: BrowsersManager;


  init()
  {
    this.logger = new LoggerService({dir: 'logs', level: 'debug'});
    this.logger.start();

    const log = this.logger.action('BrowserAutomationModule.init');

    this.startServices();
    this.initControllers();
    log.info(' ⚡');
  }


  startServices()
  {
    this.http = new HttpService({
      port: 3001,
      sockets_server: true,
    }, this.logger);

    this.http.start();

    this.browsersManager = new BrowsersManager(this.logger);
    this.browsersManager.start();
  }


  initControllers()
  {
    const browsersController = new BrowsersController(this.http,
                                                      this.logger,
                                                      this.browsersManager);
    browsersController.init();
  }
}

