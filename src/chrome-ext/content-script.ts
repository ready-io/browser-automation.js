var script    = document.createElement('script');
script.src    = chrome.extension.getURL('extension.bundle.js');
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

document.addEventListener("baext.content.message", (event: CustomEvent) =>
{
  chrome.runtime.sendMessage(event.detail);
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) =>
{
  document.dispatchEvent(new CustomEvent("baext.background.message", {'detail': message}));
  sendResponse();
});
