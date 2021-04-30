import {BrowserAutomationModule} from '../src/browser-automation.module';
import {sleep} from "@ready.io/server";
import {BrowsersManager} from '../src/browsers-manager';


test('browser launch', async () =>
{
  const baModule = new BrowserAutomationModule();
  baModule.init();

  const browserManager = baModule.provider.get<BrowsersManager>(BrowsersManager);
  const browser = await browserManager.launch();
  const tab = await browser.createTab();

  await tab.load("https://google.com");
  await sleep(10000);
  browser.close();

  baModule.stop();
});
