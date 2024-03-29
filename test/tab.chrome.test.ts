import {SECONDS, sleep, untilNotNull} from '@ready.io/server';
import {Browser} from '../src/browser';
import {BrowserAutomationModule} from '../src/browser-automation.module';
import {Ajax, BrowserTab} from '../src/browser-tab';
import {BrowsersManager} from '../src/browsers-manager';

let browserModule: BrowserAutomationModule = null;
let browserManager: BrowsersManager = null;
let browser: Browser = null;
let tab: BrowserTab = null;


beforeAll(() =>
{
  browserModule = new BrowserAutomationModule();
  browserModule.options.logsLevel = 'debug';
  browserModule.init();

  browserManager = browserModule.provider.get(BrowsersManager);
});


afterAll(() =>
{
  browserModule.stop()
});


beforeEach(async () =>
{
  browser = await browserManager.launch();
  tab = await browser.createTab();
});


afterEach(async () =>
{
  await browser.close();
});


test('screenshot', async () =>
{
  await tab.load("http://localhost:3214/ping");
  await tab.screenshot();
});


test('waitForVisible', async () =>
{
  await tab.load("https://github.com/hrcarsan");
  await tab.waitForVisible('#js-contribution-activity');
});


test('click', async () =>
{
  await tab.load("https://github.com/hrcarsan");
  await tab.click('[href="/hrcarsan?tab=repositories"]');
  await sleep(5*SECONDS);
  await tab.waitForVisible('#your-repos-filter');
});


test('waitForHidden', async () =>
{
  await tab.load("https://github.com/hrcarsan");
  await tab.click('[href="/hrcarsan?tab=repositories"]');
  await sleep(5*SECONDS);
  await tab.click('#type-options .btn');
  await tab.waitForVisible('[data-toggle-for="type-options"]');
  await tab.click('[data-toggle-for="type-options"]');
  await tab.waitForHidden('[data-toggle-for="type-options"]');
});


test('waitFor', async () =>
{
  await tab.load("https://github.com/hrcarsan");
  await tab.waitFor('[href="/hrcarsan?tab=repositories"]');
});


test('setValue', async () =>
{
  await tab.load("https://github.com/hrcarsan");
  await tab.click('[href="/hrcarsan?tab=repositories"]');
  await sleep(5*SECONDS);
  await tab.setValue('#your-repos-filter', 'easy');
});


test('waitForAjax', async () =>
{
  let ajax: Ajax  = null;

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

  expect(ajax.response).toMatch(/easycolors\.vim/);
});


test('waitForAjax timeout error', async () =>
{
  await tab.load("http://localhost:3214/ping");
  tab.timeout(5*SECONDS);
  let error = null;

  try
  {
    await tab.waitForAjax('unexistingAjax');
  }
  catch (e)
  {
    error = e;
  }

  expect(error).toBeInstanceOf(Error);
  expect(error.message).toMatch('timeout reached waiting for ajax');
});


test('waitForReCaptcha', async () =>
{
  await tab.load("https://www.google.com/recaptcha/api2/demo");

  await tab.eval(`() =>
  {
    var iframeDoc = document.querySelector('iframe').contentWindow.document;
    iframeDoc.querySelector('.recaptcha-checkbox-border').click();
  }`);

  await tab.waitForReCaptcha();
});


test('getReCaptchaParameters', async () =>
{
  await tab.load("https://www.google.com/recaptcha/api2/demo");
  const reCaptchaParams = await tab.getReCaptchaParameters();

  expect(reCaptchaParams).toEqual({
    callback: "___grecaptcha_cfg.clients['0']['o']['o']['callback']",
    sitekey: '6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-',
    pageurl: 'https://www.google.com/recaptcha/api2/demo'
  });
});


test.todo('solveReCaptchaV2');


test('eval', async () =>
{
  await tab.load("http://localhost:3214/ping");

  const body: string = await tab.eval(`() =>
  {
    return document.querySelector('body').textContent;
  }`);

  expect(body).toBe('pong');
});


test('getBoundingClientRect', async () =>
{
  await tab.load("https://github.com/hrcarsan");
  const clientRect = await tab.getBoundingClientRect("[itemprop='name']");

  expect(clientRect).toEqual(
  {
    x: 32,
    y: 425,
    width: 296,
    height: 32.5,
    top: 425,
    right: 328,
    bottom: 457.5,
    left: 32
  });
});


test('scroll', async () =>
{
  await tab.load("https://github.com/hrcarsan");
  let clientRect = await tab.getBoundingClientRect('[href="/hrcarsan?tab=repositories"]');

  await tab.scroll(0, clientRect.y);

  clientRect = await tab.getBoundingClientRect('[href="/hrcarsan?tab=repositories"]');

  expect(clientRect.y).toBe(0);
});


test('screenshotRect', async () =>
{
  await tab.load("https://github.com/hrcarsan");

  let clientRect = await tab.getBoundingClientRect('[href="/hrcarsan?tab=repositories"]');
  const base64 = await tab.screenshotRect(clientRect);

  expect(base64).toHaveLength(440);
});


test('base64ToFile', async () =>
{
  await tab.load("https://github.com/hrcarsan");

  let clientRect = await tab.getBoundingClientRect('[href="/hrcarsan?tab=repositories"]');
  const base64 = await tab.screenshotRect(clientRect);

  await tab.base64ToFile("logs/out.png", base64);
});


test.skip('solveCaptcha', async () =>
{
  await tab.load("https://2captcha.com/demo/normal");
  const text = await tab.solveCaptcha("#captcha", '2captchakey');

  expect(text.toLowerCase()).toBe("w9h5k");
});
