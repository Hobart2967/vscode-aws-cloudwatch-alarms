import { injectable } from 'inversify';

@injectable()
export abstract class Bootstrapper {
  public abstract onInit?(): Promise<void>;
  public abstract onDestroy?(): Promise<void>;
}