import {LoggerService, HttpService, Inject, Controller} from '@ready.io/server';
import {BrowsersManager} from './browsers-manager';

@Inject()
export class BrowsersController extends Controller
{
  constructor(public http: HttpService,
              public logger: LoggerService,
              public browsersManager: BrowsersManager)
  {
    super(http);
  }


  onInit()
  {
    this.http.io.on('connection', (socket) =>
    {
      const log = this.logger.action('AppController.connection');

      log.debug('socket connected '+socket.id);

      this.browsersManager.attach(socket);

      socket.on('disconnect', (reason) =>
      {
        const log = this.logger.action('AppController.disconnect');

        log.debug('socket disconnected', socket.id, reason, socket.disconnected);
      });
    });
  }
}

