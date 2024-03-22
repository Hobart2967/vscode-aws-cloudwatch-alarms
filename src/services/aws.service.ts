import * as sharedIniFileLoader from '@aws-sdk/shared-ini-file-loader';
import { injectable } from 'inversify';
import { QuickPickItem, window } from 'vscode';
import * as vscode from 'vscode';

class MessageItem implements QuickPickItem {

  label: string;
	id: string;
	description = '';
	detail: string = '';
  picked: boolean = false;

	constructor(name: string, selected: boolean = false) {
		this.id = name;
    this.label = this.id;
    this.picked = selected;
	}
}

@injectable()
export class AWSService {
  public async getProfiles(): Promise<string[]> {
    const profiles = await sharedIniFileLoader.loadSharedConfigFiles();
    return [
      'default',
      ...Object.keys(profiles.configFile)
    ];
  }

  public getSelectedRegions() {
    return vscode.workspace
      .getConfiguration('hobart2967.aws-cloudwatch-alarms')
      .get('regions') as string[]  || [];
  }

  public getSelectedProfiles() {
    return vscode.workspace
      .getConfiguration('hobart2967.aws-cloudwatch-alarms')
      .get('profiles') as string[]  || [];
  }

  public getSelectedCredentialsSource() {
    return vscode.workspace
      .getConfiguration('hobart2967.aws-cloudwatch-alarms')
      .get('credentials-source') as string  || 'env';
  }

  public getCredentialsSources() {
    return [
      'env',
      'profile'
    ];
  }

  public async pickProfiles() {
    const input = window.createQuickPick<MessageItem>();
    const profiles = await this.getProfiles();
    input.canSelectMany = true;

    const currentProfiles = this.getSelectedProfiles();
    input.items = profiles.map(name =>
      new MessageItem(name, currentProfiles.includes(name)));
    input.selectedItems = input.items.filter(x => x.picked);
    input.show();

    const profilesSelected = await new Promise(resolve => {
      input.onDidHide(() => resolve(null));
      input.onDidAccept(() => {
        resolve(input.selectedItems
          .map(x => x.id));
        input.hide();
      });
    });

    if (profilesSelected !== null) {
      vscode.workspace
        .getConfiguration('hobart2967.aws-cloudwatch-alarms')
        .update('profiles', profilesSelected, true);
    }
  }

  public async pickRegions() {
    const input = window.createQuickPick<MessageItem>();
    const regions = await this.getRegionList();
    input.canSelectMany = true;

    const currentProfiles = this.getSelectedRegions();
    input.items = regions.map(name =>
      new MessageItem(name, currentProfiles.includes(name)));
    input.selectedItems = input.items.filter(x => x.picked);
    input.show();

    const regionsSelected = await new Promise(resolve => {
      input.onDidHide(() => resolve(null));
      input.onDidAccept(() => {
        resolve(input.selectedItems
          .map(x => x.id));
        input.hide();
      });
    });

    if (regionsSelected !== null) {
      vscode.workspace
        .getConfiguration('hobart2967.aws-cloudwatch-alarms')
        .update('regions', regionsSelected, true);
    }
  }

  public async pickCredentialsSource() {
    const input = window.createQuickPick<MessageItem>();
    const sources = await this.getCredentialsSources();
    const currentProfiles = this.getSelectedCredentialsSource();
    input.items = sources.map(name =>
      new MessageItem(name, currentProfiles.includes(name)));
    input.selectedItems = input.items.filter(x => x.picked);
    input.show();

    const regionsSelected = await new Promise(resolve => {
      input.onDidHide(() => resolve(null));
      input.onDidAccept(() => {
        resolve(input.selectedItems.map(x => x.id)[0]);
        input.hide();
      });
    });

    if (regionsSelected !== null) {
      vscode.workspace
        .getConfiguration('hobart2967.aws-cloudwatch-alarms')
        .update('credentials-source', regionsSelected, true);
    }
  }

  public getRegionList(): string[] {
    return [
      'us-east-2',
      'us-east-1',
      'us-west-1',
      'us-west-2',
      'af-south-1',
      'ap-east-1',
      'ap-south-2',
      'ap-southeast-3',
      'ap-southeast-4',
      'ap-south-1',
      'ap-northeast-3',
      'ap-northeast-2',
      'ap-southeast-1',
      'ap-southeast-2',
      'ap-northeast-1',
      'ca-central-1',
      'ca-west-1',
      'eu-central-1',
      'eu-west-1',
      'eu-west-2',
      'eu-south-1',
      'eu-west-3',
      'eu-south-2',
      'eu-north-1',
      'eu-central-2',
      'il-central-1',
      'me-south-1',
      'me-central-1',
      'sa-east-1',
      'us-gov-east-1',
      'us-gov-west-1'
    ].sort();
  }
}

