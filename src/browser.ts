import childProcess from "child_process";
import uniqid from "uniqid";
import {Socket} from "socket.io";
import {BrowserTab} from "./browser-tab";
import {Inject, LoggerService, Service, sleep, untilTrue} from "@ready.io/server";
import treeKill from 'tree-kill';
import finder from 'find-package-json';
import path from "path";
import rimraf from "rimraf";

const PATH = path.dirname(finder(__dirname).next().filename);
const EXTENSION_PATH = `${PATH}/dist/src/browser-ext`;


export interface BrowserOptions
{
  name?: string;
  args?: string[];
  binary?: string;
}


@Inject()
export class Browser extends Service
{
  id: string;
  protected proc: any;
  socket: Socket = null;
  defaultTimeout = 35000;
  options: BrowserOptions = {};


  constructor(public logger: LoggerService)
  {
    super();

    this.id = uniqid();
  }


  launch(options: BrowserOptions = {})
  {
    const log = this.logger.action('Browser.launch');

    options =
    {
      name: options.name || 'chrome',
      args: options.args || [],
      binary: options.binary || '',
    };

    this.options = options;

    if (options.name == 'firefox')
    {
      this.launchFirefox(options.args);
    }
    else
    {
      this.launchChrome(options.args);
    }

    if (!this.proc || !this.proc.pid)
    {
      log.error('Browser - The browser cannont be launched');
      throw new Error('Browser - The browser cannont be launched');
    }

    log.debug(`browser launched id ${this.id}`);
  }


  protected async launchFirefox(args: string[] = [])
  {
    if (this.options.binary)
    {
      args.push(`--firefox=${this.options.binary}`);
    }

    this.proc = childProcess.spawn('web-ext', [
      `run`,
      `--source-dir=${EXTENSION_PATH}`,
      `--no-reload`,
      ...
      args
    ]);
  }


  protected async launchChrome(args: string[] = [])
  {
    this.proc = childProcess.spawn('/usr/bin/google-chrome', [
      '--no-first-run', // avoid being asked to set the browser as the default
      'about:blank',
      `--user-data-dir=/tmp/chrome_profile${this.id}`,
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      `--disable-dev-shm-usage`,
      ...
      args
    ]);
  }


  setSocket(socket: Socket)
  {
    this.socket = socket;
  }


  async close()
  {
    const log = this.logger.action('Browser.close');

    if (this.proc && this.proc.pid && !this.proc.killed)
    {
      try
      {
        treeKill(this.proc.pid);
      }
      catch (error)
      {
        log.error('Browser - the browser cannot be closed');
        throw new Error('Browser - the browser cannot be closed');
      }
    }

    try
    {
      await untilTrue(() => this.socket.disconnected, 60000);
    }
    catch (error)
    {
      log.error('Browser - the browser cannot be unattached');
      throw new Error('Browser - the browser cannot be unattached');
    }

    if (this.options.name == 'chrome')
    {
      log.info('rimraf chrome_profile');

      rimraf(`/tmp/chrome_profile${this.id}`, (error) =>
      {
        if (error)
        {
          log.error(error.stack);
        }
      });
    }

    log.debug('browser closed');
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
