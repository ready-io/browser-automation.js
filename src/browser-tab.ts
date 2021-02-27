import Browser from "./browser";
import uniqid from "uniqid";
import {Socket} from "socket.io";
import got from 'got';
import {sleep} from "./util";
import {LoggerService} from "@ready.io/server";

export interface Ajax {url: string, response: string}

export default class BrowserTab
{
  socket: Socket = null;
  url: string = "";


  constructor(public logger: LoggerService, public id: string, public browser: Browser)
  {
    this.socket = browser.socket;
  }


  async request<T>(action: string, params: any = {}, timeout: number = 35000): Promise<T>
  {
    const socket = this.socket;
    const id     = uniqid();
    const log    = this.logger.action('BrowserTab.request '+id);

    if (socket.disconnected)
    {
      log.error(`The browser is unattached`);
      throw new Error("The browser is unattached");
    }

    await sleep(1000);

    log.debug(`${action}${params? ' '+JSON.stringify(params): ''}`);

    return await new Promise((resolve, reject) =>
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

      const request = {id: id, tabId: this.id, action: action, params: params};

      socket.on(id, responseListener);
      socket.emit('tab.request', request);
    });
  }


  async load(url: string)
  {
    this.url = url;

    await this.browser.request('load', {
      tabId: this.id,
      url: url,
      timeout: 35000,
    });
  }


  async screenshot()
  {
    const base64 = await this.browser.request<string>('screenshot');

    return new Promise((resolve, reject) =>
    {
      require("fs").writeFile("logs/out.jpeg", base64, 'base64', (err: any) =>
      {
        if (err)
        {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }


  async waitForVisible(selector: string)
  {
    await this.request('waitForVisible', {
      selector: selector,
    });
  }


  async click(selector: string)
  {
    await this.request('click', {
      selector: selector,
    });
  }


  async waitForHidden(selector: string)
  {
    await this.request('waitForHidden', {
      selector: selector,
    });
  }


  async waitFor(selector: string)
  {
    await this.request('waitFor', {
      selector: selector,
    });
  }


  async setValue(selector: string, value: string)
  {
    await this.request('setValue', {
      selector: selector,
      value: value,
    });
  }


  async waitForAjax(url: string, timeout: number = null): Promise<Ajax>
  {
    return this.request('waitForAjax', {
      url: url,
    }, timeout);
  }


  getReCaptchaParameters(): Promise<{callback: string, sitekey: string}>
  {
    return this.request('getReCaptchaParameters');
  }


  async waitForReCaptcha()
  {
    await this.request('waitForReCaptcha');
  }


  async solveReCaptchaV2()
  {
    const log = this.logger.action('BrowserTab.solveReCaptchaV2');

    await this.waitForReCaptcha();

    const reCaptchaParams = await this.getReCaptchaParameters();
    const captcha2ApiKey  = '928dd3a81cccc935a8982674e78baff5';
    log.debug(`recaptcha params ${JSON.stringify(reCaptchaParams)}`);

    const urlSet = `https://2captcha.com/in.php?key=${captcha2ApiKey}&method=userrecaptcha`+
                     `&googlekey=${reCaptchaParams.sitekey}&json=1&pageurl=${this.url}`;

    const response: any = await got(urlSet).json();

    log.debug(`2captcha sent ${urlSet} ${JSON.stringify(response)}`);

    const id = response.request;
    const urlGet = `https://2captcha.com/res.php?key=${captcha2ApiKey}&action=get&id=${id}&json=1`;
    let token = "";

    for (let attempt = 1; attempt <= 24; attempt++)
    {
      await sleep(5000);

      let response: any = await got(urlGet).json();
      log.debug(`2captcha response ${JSON.stringify(response)}`);

      if (response.status == 1)
      {
        token = response.request;
        break;
      }
    }

    if (token === "")
    {
      log.error("cannot get reCaptcha token");
      throw new Error("cannot get reCaptcha token");
    }

    await this.request('solveReCaptchaV2', {
      callback: reCaptchaParams.callback,
      token: token
    });
  }
}
