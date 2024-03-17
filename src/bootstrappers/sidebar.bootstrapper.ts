import { inject, injectable } from 'inversify';
import { ExtensionContext } from 'vscode';

import { EXTENSION_CONTEXT } from '../constants/extension-context';
import { VSCODE_WINDOW } from '../constants/vscode';
import { SidebarProvider } from '../services/sidebar.provider';
import { Bootstrapper } from './bootstrapper';

@injectable()
export class SidebarBootstrapper extends Bootstrapper {
  public constructor(
    @inject(EXTENSION_CONTEXT)
    private readonly _context: ExtensionContext,

    @inject(VSCODE_WINDOW)
    private readonly _vscode: any,

    @inject(SidebarProvider)
    private readonly _sidebarProvider: SidebarProvider) { super(); }

  public async onInit?(): Promise<void> {
    this._context.subscriptions.push(
      this._vscode.registerWebviewViewProvider(
        "hobart2967-cloudwatch-alarms-sidebar",
        this._sidebarProvider)
    );
  }

  public async onDestroy(): Promise<void> { }
}