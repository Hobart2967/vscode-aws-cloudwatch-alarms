import { inject, injectable } from 'inversify';
import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

import { AlarmsService } from './services/alarms.service';
import { AWSService } from './services/aws.service';

@injectable()
export class ExtensionManager {
  public readonly vscode = vscode;

  public constructor(
    @inject(AWSService) private readonly awsService: AWSService,
    @inject(AlarmsService) private readonly alarmsService: AlarmsService) {}

  public activate(context: ExtensionContext) {
    const myCommandId = 'sample.showSelectionCount';

    const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.text = 'CloudWatch Alarms';
    myStatusBarItem.command = myCommandId;

    // TODO: Dispose
    const pickProfile = vscode.commands.registerCommand('hobart2967.aws-cloudwatch-alarms.pick-profiles', () => {
      this.awsService.pickProfiles();
    });

    const pickCredentialsSource = vscode.commands.registerCommand('hobart2967.aws-cloudwatch-alarms.pick-credentials-source', () => {
      this.awsService.pickCredentialsSource();
    });

    const pickRegions = vscode.commands.registerCommand('hobart2967.aws-cloudwatch-alarms.pick-regions', () => {
      this.awsService.pickRegions();
    });

    const refreshAlarms = vscode.commands.registerCommand('hobart2967.aws-cloudwatch-alarms.refresh-alarms', () => {
      this.alarmsService.requestRefresh();
    });
	}
}