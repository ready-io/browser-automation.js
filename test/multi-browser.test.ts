import {BrowserAutomationModule} from '../src/browser-automation.module';
import {SECONDS, sleep} from "@ready.io/server";
import {BrowsersManager} from '../src/browsers-manager';

test('launch browser', async () =>
{
  const module = new BrowserAutomationModule();
  module.options.logsLevel = 'debug';
  module.init();

  const browserManager = module.provider.get<BrowsersManager>(BrowsersManager);

  const p1 = new Promise(async (resolve) =>
  {
    const browser = await browserManager.launch();
    const tab = await browser.createTab();

    await tab.load("https://github.com/hrcarsan");
    await sleep(10*SECONDS);
    await browser.close();
    resolve(true);
  });

  const p2 = new Promise(async (resolve) =>
  {
    const browser = await browserManager.launch();
    const tab = await browser.createTab();

    await tab.load("https://google.com");
    await sleep(2*SECONDS);
    await browser.close();
    resolve(true);
  });

  await p2;

  const p3 = new Promise(async (resolve) =>
  {
    const browser = await browserManager.launch();
    const tab = await browser.createTab();

    await tab.load("https://gitlab.com/hrcarsan");
    await sleep(2*SECONDS);
    await browser.close();
    resolve(true);
  });

  await p3;

  await p1;
  module.stop();
});
