(function()
{
  var xhr  = XMLHttpRequest.prototype;
  var send = xhr.send;
  var open = xhr.open;

  xhr.open = function(_: string, url: string)
  {
    this._url = url;
    return open.apply(this, arguments);
  }

  xhr.send = function()
  {
    this.addEventListener('load', function()
    {
      const ajax  = {url: this._url, response: this.response};
      const event = new CustomEvent("BuscaMultasExtension.ajax", {'detail': ajax});
      document.dispatchEvent(event);
    });

    return send.apply(this, arguments);
  };
})();

import {ExtensionModule} from "./extension.module";

const extension = new ExtensionModule();
extension.init();
