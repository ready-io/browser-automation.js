import {BackgroundService} from "./background.service";
import {ContentService} from "./content.service";

declare global
{
  interface Window
  {
    browser: typeof chrome;
  }
}


export class ExtensionModule
{
  init()
  {
    if (window.location.href.includes("chrome-extension") ||
        window.location.href.includes("moz-extension"))
    {
      const backgroundService = new BackgroundService();
      backgroundService.init();
    }
    else
    {
      const contentService = new ContentService();
      contentService.init();
    }
  }
}
