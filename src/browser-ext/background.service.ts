import * as io  from "socket.io-client";

const Browser = window.chrome || window.browser;

interface Message
{
  type: string;
  content: any;
}


export class BackgroundService
{
  tabsLoaded = new Map<number, boolean>();
  socket: SocketIOClient.Socket;
  defaultTimeout: number = 35000;


  async init()
  {
    this.socket = io.connect("http://localhost:3214",
    {
      'reconnection': true,
      'reconnectionDelay': 1000,
      'reconnectionDelayMax': 5000,
      'reconnectionAttempts': 0
    });

    this.socket.on('window.request', (request: any) =>
    {
      const self: any = this;
      const response: any = {requestId: request.id, data: null, error: null};
      const timeout: number = request.params.timeout || this.defaultTimeout;
      let done = false;

      const timeoutId = setTimeout(() =>
      {
        if (done === true) return;

        done = true;
        response.error = `${request.action} ${request.id} timeout`;
        this.respond(response);
      }, timeout);

      self[request.action](request.params, (data: any = null) =>
      {
        if (done === true) return;

        done = true;
        response.data = data;
        this.respond(response);
        clearTimeout(timeoutId);
      });
    });

    this.socket.on('tab.request', (request: any) =>
    {
      this.sendMessage(request.tabId, {type: 'request', content: request});
    });

    Browser.runtime.onMessage.addListener((message, sender, sendResponse) =>
    {
      this.onContentMessage(sender.tab.id, message);
      sendResponse();
    });

    setInterval(() =>
    {
      this.log('browser.ping');
    }, 5000);
  }


  onContentMessage(tabId: number, message: Message)
  {
    if (message.type == 'window.loaded')
    {
      this.tabsLoaded.set(tabId, true);
      return;
    }

    if (message.type == 'tab.ping')
    {
      this.log('tab.ping');
      return;
    }

    if (message.type == 'tab.log')
    {
      this.log(message.content);
      return;
    }

    if (message.type == 'response')
    {
      this.respond(message.content);
    }
  }


  respond(response: any)
  {
    this.socket.emit(response.requestId, response);
  }


  sendMessage(tabId: number, message: any)
  {
    Browser.tabs.sendMessage(tabId, message);
  }


  log(message: any)
  {
    this.socket.emit('log', message);
  }


  createTab(_: any, callback: (data?: any) => void)
  {
    Browser.tabs.create({active: true}, (tab) =>
    {
      callback(tab.id);
    });
  }


  load(params: any, callback: (data?: any) => void)
  {
    Browser.tabs.update(params.tabId, {url: params.url});

    const intervalId = setInterval(() =>
    {
      Browser.tabs.get(params.tabId, (tab) =>
      {
        if (tab.status === 'unloaded')
        {
          Browser.tabs.update(params.tabId, {url: params.url});
        }

        if (tab.status === 'complete')
        {
          clearInterval(intervalId);
          callback();
        }
      });
    }, 3000);
  }


  screenshot(_: any, callback: (data?: any) => void)
  {
    Browser.tabs.captureVisibleTab((screenshotUrl) =>
    {
      screenshotUrl = screenshotUrl.replace(/^data:image\/jpeg;base64,/, '');
      screenshotUrl = screenshotUrl.replace(/^data:image\/png;base64,/, '');

      callback(screenshotUrl);
    });
  }


  screenshotRect(params: any, callback: (data?: any) => void)
  {
    Browser.tabs.captureVisibleTab({ format: "png" }, (screenshotUrl) =>
    {
      var canvas = document.createElement("canvas");
      canvas.width = params.width;
      canvas.height = params.height;

      var context = canvas.getContext('2d');
      var croppedImage = new Image();

      croppedImage.onload = () =>
      {
        context.drawImage(
          croppedImage,
          params.x,
          params.y,
          params.width,
          params.height,
          0,
          0,
          params.width,
          params.height
        );
        screenshotUrl = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');
        callback(screenshotUrl);
      }

      croppedImage.src = screenshotUrl;
    });
  }
}
