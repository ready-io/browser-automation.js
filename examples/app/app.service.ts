import {Inject, SECONDS, Service, sleep, untilNotNull} from "@ready.io/server";
import {Ajax, BrowsersManager} from "../../src/index";
import finder from 'find-package-json';
import path from "path";

const PATH = path.dirname(finder(__dirname).next().filename);


@Inject()
export class AppService extends Service
{
  constructor(public browsersManager: BrowsersManager)
  {
    super();
  }


  async onInit()
  {
    await this.launchChrome();
    await sleep(30*SECONDS);
    await this.launchFirefox();
  }


  async launchChrome()
  {
    const browser = await this.browsersManager.launch();
    const tab = await browser.createTab();

    let ajax: Ajax = null;

    await tab.load("https://github.com/hrcarsan");
    await tab.click('[href="/hrcarsan?tab=repositories"]');
    await sleep(5*SECONDS);
    await tab.setValue('#your-repos-filter', 'easy');
    await tab.click('#type-options .btn');
    await tab.waitForVisible('[data-toggle-for="type-options"]');
    await tab.click('[data-toggle-for="type-options"]');

    tab.waitForAjax('q=easy').then(a => ajax = a);

    await tab.click('#type_source');
    await untilNotNull(() => ajax, 35*SECONDS);

    browser.close();
    console.log(ajax.url);
  }


  async launchFirefox()
  {
    const browser = await this.browsersManager.launch({
      name: 'firefox',
      binary: `${PATH}/browsers/firefox-89.0/firefox/firefox`
    });
    const tab = await browser.createTab();

    let ajax: Ajax = null;

    await tab.load("https://github.com/hrcarsan");
    await tab.click('[href="/hrcarsan?tab=repositories"]');
    await sleep(5*SECONDS);
    await tab.setValue('#your-repos-filter', 'easy');
    await tab.click('#type-options .btn');
    await tab.waitForVisible('[data-toggle-for="type-options"]');
    await tab.click('[data-toggle-for="type-options"]');

    tab.waitForAjax('q=easy').then(a => ajax = a);

    await tab.click('#type_source');
    await untilNotNull(() => ajax, 35*SECONDS);

    browser.close();
    console.log(ajax.url);
  }
}
