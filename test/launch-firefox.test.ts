import {BrowserAutomationModule} from '../src/browser-automation.module';
import {SECONDS, sleep} from "@ready.io/server";
import {BrowsersManager} from '../src/browsers-manager';


test('launch firefox', async () =>
{
  const module = new BrowserAutomationModule();
  module.init();

  const browserManager = module.provider.get<BrowsersManager>(BrowsersManager);
  const browser = await browserManager.launch({
    name: 'firefox',
  });
  const tab = await browser.createTab();

  await tab.load("https://github.com/hrcarsan");
  await sleep(3*SECONDS);
  await browser.close();

  module.stop();
});


test('launch firefox from dir', async () =>
{
  const module = new BrowserAutomationModule();
  module.init();

  const browserManager = module.provider.get<BrowsersManager>(BrowsersManager);
  const browser = await browserManager.launch({
    name: 'firefox',
    binary: 'browsers/firefox-89.0/firefox/firefox'
  });
  const tab = await browser.createTab();

  await tab.load("https://github.com/hrcarsan");
  await sleep(3*SECONDS);
  await browser.close();

  module.stop();
});
