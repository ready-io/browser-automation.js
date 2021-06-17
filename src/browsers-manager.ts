import {Inject, LoggerService, Service, untilNotNull} from "@ready.io/server";
import {Browser, BrowserOptions} from "./browser";


@Inject()
export class BrowsersManager extends Service
{
  protected unattachedBrowser: Browser = null;


  constructor(public logger: LoggerService)
  {
    super();
  }


  /**
   * @throws Error
   */
  async launch(options: BrowserOptions = {}): Promise<Browser>
  {
    const log = this.logger.action('BrowsersManager.launch');

    if (this.unattachedBrowser !== null)
    {
      log.error("there is another browser launching");
      throw new Error("there is another browser launching");
    }

    log.debug('launching browser');

    const browser = new Browser(this.logger);
    browser.launch(options);
    this.unattachedBrowser = browser;

    try
    {
      await untilNotNull(() => browser.socket, 60000);
    }
    catch (error)
    {
      this.unattachedBrowser = null;
      browser.close();
      log.error('BrowsersManager.launch - the WebSocket cannot be attached');
      throw new Error('BrowsersManager.launch - the WebSocket cannot be attached');
    }

    log.debug('browser attached');

    browser.socket.on('log', (message) => { log.debug(message); });

    return browser;
  }


  attach(socket: any)
  {
    if (this.unattachedBrowser === null)
    {
      return;
    }

    this.unattachedBrowser.socket = socket;
    this.unattachedBrowser = null;
  }
}
