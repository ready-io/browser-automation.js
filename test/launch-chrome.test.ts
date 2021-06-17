import {BrowserAutomationModule} from '../src/browser-automation.module';
import {SECONDS, sleep} from "@ready.io/server";
import {BrowsersManager} from '../src/browsers-manager';


test('launch browser', async () =>
{
  const module = new BrowserAutomationModule();
  module.init();

  const browserManager = module.provider.get<BrowsersManager>(BrowsersManager);
  const browser = await browserManager.launch();
  const tab = await browser.createTab();

  await tab.load("https://github.com/hrcarsan");
  await sleep(3*SECONDS);
  browser.close();

  module.stop();
});


test('launch chrome with dev tools', async () =>
{
  const module = new BrowserAutomationModule();
  module.init();

  const browserManager = module.provider.get<BrowsersManager>(BrowsersManager);
  const browser = await browserManager.launch({
    name: 'chrome',
    args: ['--auto-open-devtools-for-tabs']
  });
  const tab = await browser.createTab();

  await tab.load("https://github.com/hrcarsan");
  await sleep(3*SECONDS);
  browser.close();

  module.stop();
});
