import {BackgroundService} from "./background.service";
import {ContentService} from "./content.service";

export class ExtensionModule
{
  init()
  {
    if (window.location.href.includes("chrome-extension"))
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
