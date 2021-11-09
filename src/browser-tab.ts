import {Browser} from "./browser";
import uniqid from "uniqid";
import {Socket} from "socket.io";
import got from 'got';
import {LoggerService, sleep} from "@ready.io/server";

export interface Ajax
{
  url: string,
  response: string
}

export interface Rectangule
{
  x: number,
  y: number,
  width: number,
  height: number
}


export interface ElementRect
{
  x: number,
  y: number,
  width: number,
  height: number,
  top: number,
  right: number,
  bottom: number,
  left: number,
}


export class BrowserTab
{
  protected socket: Socket = null;
  protected defaultTimeout = 35000;


  constructor(public logger: LoggerService, public id: string, public browser: Browser)
  {
    this.socket = browser.socket;
  }


  timeout(timeout: number)
  {
    this.defaultTimeout = timeout;
    this.browser.defaultTimeout = timeout;
  }


  protected async request<T>(action: string, params: any = {}): Promise<T>
  {
    const socket  = this.socket;
    const id      = uniqid();
    const log     = this.logger.action('BrowserTab.request '+id);
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

      const request = {id: id, tabId: this.id, action: action, params: params};

      socket.on(id, responseListener);
      socket.emit('tab.request', request);
    });
  }


  async load(url: string)
  {
    await this.browser.request('load', {
      tabId: this.id,
      url: url,
    });
  }


  /**
   * @param string path - chrome "logs/out.jpeg", firefox "logs/out.png"
   */
  async screenshot(path: string = "")
  {
    if (!path)
    {
      switch (this.browser.options.name)
      {
        case "chrome": path = "logs/out.jpeg"; break;
        case "firefox": path = "logs/out.png"; break;
        default: throw new Error("Unsupported browser");
      }
    }

    const base64 = await this.browser.request<string>('screenshot');

    return new Promise((resolve, reject) =>
    {
      require("fs").writeFile(path, base64, 'base64', (err: any) =>
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


  async waitForAjax(url: string): Promise<Ajax>
  {
    return this.request('waitForAjax', {
      url: url,
    });
  }


  async waitForReCaptcha()
  {
    await this.request('waitForReCaptcha');
  }


  getReCaptchaParameters(): Promise<{callback: string, sitekey: string, pageurl: string}>
  {
    return this.request('getReCaptchaParameters');
  }


  async solveReCaptchaV2(captcha2ApiKey: string)
  {
    const log = this.logger.action('BrowserTab.solveReCaptchaV2');

    await this.waitForReCaptcha();

    const reCaptchaParams = await this.getReCaptchaParameters();
    log.debug(`recaptcha params ${JSON.stringify(reCaptchaParams)}`);

    const urlSet = `https://2captcha.com/in.php?key=${captcha2ApiKey}&method=userrecaptcha`+
                     `&googlekey=${reCaptchaParams.sitekey}&json=1&pageurl=${reCaptchaParams.pageurl}`;

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


  eval(functionStr: string): Promise<any>
  {
    return this.request('eval', {
      functionStr: functionStr
    });
  }


  getBoundingClientRect(selector: string)
  {
    return this.request<ElementRect>('getBoundingClientRect', {
      selector: selector,
    });
  }


  async scroll(x: number, y: number)
  {
    await this.request('scroll', {
      x: x,
      y: y,
    });
  }


  screenshotRect(rect: Rectangule)
  {
    return this.browser.request<string>('screenshotRect', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }


  base64ToFile(path: string, base64: string): Promise<void>
  {
    return new Promise((resolve, reject) =>
    {
      require("fs").writeFile(path, base64, 'base64', (err: any) =>
      {
        if (err)
        {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }


  async solveCaptcha(selector: string, captcha2ApiKey: string)
  {
    const log = this.logger.action('BrowserTab.solveCaptcha');

    const captchaRect = await this.getBoundingClientRect(selector);
    const captchaBase64 = await this.screenshotRect(captchaRect);
    const urlSet = `https://2captcha.com/in.php`;

    //await this.base64ToFile("logs/out.png", captchaBase64);

    const response: any = await got.post(urlSet, {
      form:
      {
        method: "base64",
        key: captcha2ApiKey,
        body: captchaBase64,
        json: 1
      }
    }).json();

    log.debug(`2captcha sent ${urlSet} ${JSON.stringify(response)}`);

    const id = response.request;
    const urlGet = `https://2captcha.com/res.php?key=${captcha2ApiKey}&action=get&id=${id}&json=1`;
    let text = "";

    for (let attempt = 1; attempt <= 24; attempt++)
    {
      await sleep(5000);

      let response: any = await got(urlGet).json();
      log.debug(`2captcha response ${JSON.stringify(response)}`);

      if (response.status == 1)
      {
        text = response.request;
        break;
      }
    }

    if (text === "")
    {
      log.error("cannot get captcha text");
      throw new Error("cannot get captcha text");
    }

    return text;
  }
}
