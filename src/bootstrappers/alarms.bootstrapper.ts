import { inject, injectable } from 'inversify';

import { AlarmsService } from '../services/alarms.service';
import { Bootstrapper } from './bootstrapper';

@injectable()
export class AlarmsBootstrapper extends Bootstrapper {
  public constructor(
    @inject(AlarmsService)
    private readonly _alarmsService: AlarmsService) { super(); }

  public async onInit?(): Promise<void> {
    this._alarmsService.initialize();
  }

  public async onDestroy(): Promise<void> {
    this._alarmsService.shutdown();
  }
}