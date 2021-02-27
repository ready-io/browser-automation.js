import {untilTrue} from "../util";
import {findReCaptchaParamateres} from "./captcha-util";

export default class ContentService
{
  defaultTimeout: number = 35000;


  start()
  {
    window.addEventListener('load', () =>
    {
      this.onWindowLoad();
    });

    document.addEventListener("baext.background.message", async (event: any) =>
    {
      this.onBackgroundMessage(event.detail);
    });
  }


  onBackgroundMessage(message: any)
  {
    if (message.type == 'request')
    {
      this.onRequest(message.content);
    }
  }


  onWindowLoad()
  {
    this.sendMessage({type: 'window.loaded'});

    /*setInterval(() =>
    {
      this.sendMessage({type: 'tab.ping', content: 'ok'});
    }, 5000);*/
  }


  async onRequest(request: any)
  {
    const self: any = this;
    const response: any = {requestId: request.id, data: null, error: null};

    try
    {
      response.data = await self[request.action](request.params);
    }
    catch (error)
    {
      response.error = error.message;
    }

    this.sendMessage({type: 'response', content: response});
  }


  sendMessage(message: any)
  {
    document.dispatchEvent(new CustomEvent("baext.content.message", {'detail': message}));
  }


  getElement(selector: string): HTMLElement
  {
    return document.querySelector<HTMLElement>(selector);
  }


  isVisible(selector: string): boolean
  {
    const el = this.getElement(selector);

    return el !== null && el.offsetParent !== null;
  }


  waitForVisible(params: any)
  {
    const selector = params.selector;
    const timeout: number = params.timeout || this.defaultTimeout;

    return untilTrue(() => this.isVisible(selector), timeout);
  }


  waitForHidden(params: any)
  {
    const selector = params.selector;
    const timeout: number = params.timeout || this.defaultTimeout;

    return untilTrue(() => !this.isVisible(selector), timeout);
  }


  waitFor(params: any)
  {
    const selector = params.selector;
    const timeout: number = params.timeout || this.defaultTimeout;

    return untilTrue(() => this.getElement(selector) !== null, timeout);
  }


  setValue(params: any)
  {
    const selector = params.selector;
    const value: number = params.value;
    const input: any = this.getElement(selector);

    input.value = value;
    input.dispatchEvent(new Event("change"));
  }


  click(params: any)
  {
    const selector = params.selector;

    var button = this.getElement(selector);
    if (button) button.click();
  }


  waitForAjax(params: any)
  {
    const url = params.url;
    const timeout = params.timeout || this.defaultTimeout;

    return new Promise((resolve, reject) =>
    {
      let timeoutId: NodeJS.Timeout;
      let eventListener: (event: CustomEvent) => void;

      const clear = () =>
      {
        clearTimeout(timeoutId);

      };

      timeoutId = setTimeout(() =>
      {
        clear();
        reject('timeout reached waiting for ajax');
      }, timeout);

      eventListener = (event: CustomEvent) =>
      {
        const ajax = event.detail;

        if (ajax.url.includes(url))
        {
          clear();
          resolve(ajax);
        }
      };

      document.addEventListener("BuscaMultasExtension.ajax", eventListener);
    });
  }


  waitForReCaptcha()
  {
    return untilTrue(() =>
    {
      const iframe = this.getElement("iframe[src^='https://www.google.com/recaptcha/api2/bframe']");
      const container: any = ((iframe || {}).parentNode || {}).parentNode || {style: {}};

      return container.style.opacity === "1";
    }, 10000);
  }


  getReCaptchaParameters()
  {
    const reCaptchaParams = findReCaptchaParamateres();

    return {
      callback: reCaptchaParams.callback,
      sitekey: reCaptchaParams.sitekey
    };
  }


  solveReCaptchaV2(params: any)
  {
    const evalCode = `${params.callback}('${params.token}')`;
    eval(evalCode);
  }
}
