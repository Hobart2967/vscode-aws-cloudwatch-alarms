import { injectable } from 'inversify';
import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

@injectable()
export class ExtensionManager {
  public readonly vscode = vscode;

  public activate(context: ExtensionContext) {
    const myCommandId = 'sample.showSelectionCount';

    const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.command = myCommandId;
	}
}