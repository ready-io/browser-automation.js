import childProcess from "child_process";
import { promisify } from 'util';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import removeFolder from 'rimraf';
const mkdtempAsync = promisify(fs.mkdtemp);
import uniqid from "uniqid";
import {Socket} from "socket.io";
import {BrowserTab} from "./browser-tab";
import {Inject, LoggerService, Service, sleep} from "@ready.io/server";

const COOKIE_PATH = `${__dirname}/../dist/chrome-ext`;

@Inject()
export class Browser extends Service
{
  protected proc: any;
  protected userDataDir: string;
  socket: Socket = null;
  defaultTimeout = 35000;


  constructor(public logger: LoggerService)
  {
    super();
  }


  async launch()
  {
    const log = this.logger.action('Browser.launch');

    this.userDataDir = await mkdtempAsync(path.join(os.tmpdir(), 'busca_multas_chrome_profile-'));

    this.proc = childProcess.spawn('/usr/bin/google-chrome', [
      //'--no-sandbox',
      '--no-first-run', // avoid being asked to set the browser as the default
      'about:blank',
      //`--user-data-dir=${this.userDataDir}`,
      //`--user-data-dir=/app/var/chrome_profile`,
      `--user-data-dir=/tmp/chrome_profile`,
      `--disable-extensions-except=${COOKIE_PATH}`,
      `--load-extension=${COOKIE_PATH}`,
    ]);

    if (!this.proc || !this.proc.pid)
    {
      log.error('Browser - The browser cannont be launched');
      throw new Error('Browser - The browser cannont be launched');
    }

    log.debug('browser launched');
  }


  close()
  {
    const log = this.logger.action('Browser.close');

    try
    {
      removeFolder.sync(this.userDataDir);
    }
    catch (error) { }

    if (this.proc && this.proc.pid && !this.proc.killed)
    {
      try
      {
        this.proc.kill('SIGKILL');
      }
      catch (error)
      {
        log.error('Browser - the browser cannot be closed');
        throw new Error('Browser - the browser cannot be closed');
      }

      log.debug('browser closed');
    }
  }


  timeout(timeout: number)
  {
    this.defaultTimeout = timeout;
  }


  async request<T>(action: string, params: any = {}): Promise<T>
  {
    const socket  = this.socket;
    const id      = uniqid();
    const log     = this.logger.action('Browser.request '+id);
    const timeout = this.defaultTimeout;

    if (socket.disconnected)
    {
      log.error(`The browser is unattached`);
      throw new Error("The browser is unattached");
    }

    await sleep(1000);

    log.debug(`${action}${params? ' '+JSON.stringify(params): ''}`);

    return new Promise((resolve, reject) =>
    {
      let responseListener: (response: any) => void;
      let timeoutId: NodeJS.Timeout;
      let intervalId: NodeJS.Timeout;

      const clear = () =>
      {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        socket.removeListener(id, responseListener);
      }

      const error = (message: string) =>
      {
        clear();
        reject(new Error(message));
        log.error(message);
      }

      responseListener = (response) =>
      {
        if (response.error) return error(response.error);

        clear();
        resolve(response.data);
        log.debug(`response`);
      };

      timeoutId  = setTimeout(_ => { error(`The browser does not respond`); }, timeout+5000);
      intervalId = setInterval(_ => socket.disconnected? error(`The browser is unattached`): null, 5000);

      params.timeout = timeout;

      const request = {id: id, action: action, params: params};

      socket.on(id, responseListener);
      socket.emit('window.request', request);
    });
  }


  async createTab()
  {
    const tabId = await this.request<string>('createTab');
    const tab   = new BrowserTab(this.logger, tabId, this);

    return tab;
  }
}
