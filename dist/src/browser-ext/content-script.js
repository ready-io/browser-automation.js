const Browser = chrome || browser;
var script = document.createElement('script');
script.src = Browser.extension.getURL('extension.bundle.js');
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);
document.addEventListener("baext.content.message", (event) => {
    Browser.runtime.sendMessage(event.detail);
});
Browser.runtime.onMessage.addListener((message, _, sendResponse) => {
    document.dispatchEvent(new CustomEvent("baext.background.message", {
        'detail': JSON.stringify(message)
    }));
    sendResponse();
});
//# sourceMappingURL=content-script.js.map