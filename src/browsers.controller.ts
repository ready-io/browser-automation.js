import {LoggerService, HttpService} from '@ready.io/server';
import BrowsersManager from './browsers-manager';

export default class BrowsersController
{
  constructor(public http: HttpService,
              public logger: LoggerService,
              public browsersManager: BrowsersManager)
  {
  }


  init()
  {
    const log = this.logger.action('AppController.init');

    this.http.io.on('connection', (socket: any) =>
    {
      log.debug('socket connected '+socket.id);

      this.browsersManager.attach(socket);

      socket.on('disconnect', (reason: any) =>
      {
        log.debug('socket disconnected '+socket.id+' '+reason+' '+socket.disconnected);
      });
    });
  }
}

