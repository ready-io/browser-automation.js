import BackgroundService from "./background.service";
import ContentService from "./content.service";

export default class ExtensionModule
{
  init()
  {
    if (window.location.href.includes("chrome-extension"))
    {
      const backgroundService = new BackgroundService();
      backgroundService.start();
    }
    else
    {
      const contentService = new ContentService();
      contentService.start();
    }
  }
}
