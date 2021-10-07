import {HttpService, Inject, LoggerService, Service, untilNotNull} from "@ready.io/server";
import {Socket} from "socket.io";
import {Browser, BrowserOptions} from "./browser";


@Inject()
export class BrowsersManager extends Service
{
  protected unattachedBrowser: Browser = null;


  constructor(public logger: LoggerService,
              public http: HttpService)
  {
    super();
  }


  onInit()
  {
    this.http.io.on('connection', socket => this.attach(socket));
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
    browser.id = this.http.io? this.http.io.of("/").sockets.size: 0;
    browser.launch(options);
    this.unattachedBrowser = browser;

    try
    {
      await untilNotNull(() => browser.socket, 60000);
    }
    catch (error)
    {
      this.unattachedBrowser = null;
      await browser.close();
      log.error('BrowsersManager.launch - the WebSocket cannot be attached');
      throw new Error('BrowsersManager.launch - the WebSocket cannot be attached');
    }

    log.debug('browser attached');

    browser.socket.on('log', (message) => { log.debug(message); });

    return browser;
  }


  attach(socket: Socket)
  {
    if (this.unattachedBrowser === null)
    {
      return;
    }

    const log = this.logger.action('BrowsersManager.attach');

    log.debug('socket connected '+socket.id);

    this.unattachedBrowser.setSocket(socket);
    this.unattachedBrowser = null;

    socket.on('disconnect', (reason) =>
    {
      const log = this.logger.action('BrowsersManager.unattach');

      log.debug('socket disconnected', socket.id, reason, socket.disconnected);
    });
  }
}
