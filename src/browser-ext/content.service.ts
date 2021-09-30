import {untilTrue} from "../util";
import {findReCaptchaParamateres} from "./captcha-util";


export class ContentService
{
  defaultTimeout: number = 35000;


  init()
  {
    window.addEventListener('load', () =>
    {
      this.onWindowLoad();
    });

    document.addEventListener("baext.background.message", async (event: any) =>
    {
      this.onBackgroundMessage(JSON.parse(event.detail));
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


  log(message: any)
  {
    this.sendMessage({type: 'tab.log', content: message});
  }


  getElement(selector: string): HTMLElement
  {
    return document.querySelector<HTMLElement>(selector);
  }


  getElements(selector: string): NodeListOf<HTMLElement>
  {
    return document.querySelectorAll(selector);
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

    if (input === null)
    {
      throw new Error("Element not found");
    }

    input.value = value;
    input.dispatchEvent(new Event("change"));
  }


  click(params: any)
  {
    const selector = params.selector;

    var button = this.getElement(selector);

    if (button === null)
    {
      throw new Error("Element not found");
    }

    button.click();
  }


  waitForAjax(params: any)
  {
    const url = params.url;
    const timeout = params.timeout || this.defaultTimeout;

    return new Promise((resolve, reject) =>
    {
      let timeoutId: NodeJS.Timeout;
      let eventListener: (event: CustomEvent) => void;
      const clear = () => { clearTimeout(timeoutId); };

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


  waitForReCaptcha(params: any)
  {
    const timeout = params.timeout || this.defaultTimeout;

    return untilTrue(() =>
    {
      const iframe = this.getElement("iframe[src^='https://www.google.com/recaptcha/api2/bframe']");
      const container: any = ((iframe || {}).parentNode || {}).parentNode || {style: {}};

      return container.style.opacity === "1";
    }, timeout);
  }


  getReCaptchaParameters(_params: any)
  {
    const reCaptchaParams = findReCaptchaParamateres();

    if (reCaptchaParams === null)
    {
      throw new Error("ReCaptcha parameters not found");
    }

    return {
      callback: reCaptchaParams.callback,
      sitekey: reCaptchaParams.sitekey,
      pageurl: reCaptchaParams.pageurl,
    };
  }


  solveReCaptchaV2(params: any)
  {
    const evalCode = `${params.callback}('${params.token}')`;

    eval(evalCode);
  }


  async eval(params: any)
  {
    const util: any = {};
    util.untilTrue = untilTrue;

    return await eval(`(${params.functionStr})(util)`);
  }


  getBoundingClientRect(params: any)
  {
    const selector = params.selector;
    const element = this.getElement(selector);

    if (element === null)
    {
      throw new Error("Element not found");
    }

    return element.getBoundingClientRect();
  }


  scroll(params: any)
  {
    window.scroll(params.x, params.y);
  }
}
