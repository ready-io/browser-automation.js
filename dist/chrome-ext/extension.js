"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var xhr = XMLHttpRequest.prototype;
    var send = xhr.send;
    var open = xhr.open;
    xhr.open = function (_, url) {
        this._url = url;
        return open.apply(this, arguments);
    };
    xhr.send = function () {
        this.addEventListener('load', function () {
            const ajax = { url: this._url, response: this.response };
            const event = new CustomEvent("BuscaMultasExtension.ajax", { 'detail': ajax });
            document.dispatchEvent(event);
        });
        return send.apply(this, arguments);
    };
})();
const extension_module_1 = require("./extension.module");
const extension = new extension_module_1.ExtensionModule();
extension.init();
//# sourceMappingURL=extension.js.map