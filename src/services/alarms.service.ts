import {
  CloudWatchClient,
  CloudWatchClientConfig,
  CompositeAlarm,
  DescribeAlarmsCommand,
  DescribeAlarmsCommandInput,
  MetricAlarm,
  StateValue,
} from '@aws-sdk/client-cloudwatch';
import { interval, map, Observable, pairwise, startWith, switchMap } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import * as vscode from 'vscode';

import { CloudWatchAlarm } from './cloud-watch-alarm';

export class AlarmsService {
  private readonly _alarmBaseUrl = (region: string) => `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#alarmsV2:alarm/`;
  private readonly _intervalPeriod = 10000;
  private _alarms!: Observable<CloudWatchAlarm[]>;
  private _freshAlerts!: Observable<CloudWatchAlarm[]>;

  public get alarms() : Observable<CloudWatchAlarm[]> {
    return this._alarms;
  }

  public initialize() {
    this._alarms = interval(this._intervalPeriod)
      .pipe(startWith(0))
      .pipe(map(() => vscode.workspace.getConfiguration('hobart2967.aws-cloudwatch-alarms').get("regions")! as string[]))
      .pipe(switchMap(regions => this.getAlarmsForProfilesAndRegions(regions)))
      .pipe(share());

    this._freshAlerts = this._alarms
      .pipe(
        startWith([]),
        pairwise())
      .pipe(
        map(([previousList, currentList]) => {
          const currentAlarms = (currentList || []).filter(currentState => currentState.StateValue === StateValue.ALARM);
          const unknownAlarms = currentAlarms.filter(currentState => !previousList.map(previousState => previousState.AlarmArn).includes(currentState.AlarmArn));
          const changedAlarms = currentAlarms.filter(currentState =>
            previousList.some(previousState => previousState.AlarmArn === currentState.AlarmArn && currentState.StateUpdatedTimestamp!.getTime() !== previousState.StateUpdatedTimestamp!.getTime()));

          const result = currentAlarms.filter(current =>
            unknownAlarms.map(x => x.AlarmArn).includes(current.AlarmArn) ||
            changedAlarms.map(x => x.AlarmArn).includes(current.AlarmArn));

          return result;
        }));

    this._freshAlerts
      .pipe(filter(alarms => alarms.length > 0))
      .subscribe(alarms => {
        for (const alarm of alarms) {
          this.showAlarmMessage(alarm);
        }
      });

  }

  async getAlarmsForProfilesAndRegions(regions: string[]): Promise<CloudWatchAlarm[]> {
    try {
      const alarms = await Promise.all(regions.map(region => this.getAlarms('default', region)));
      return alarms.reduce((prev, cur) => ([
        ...prev,
        ...cur
      ]), []);
    } catch (error) {
      vscode.window.showErrorMessage('Could not retrieve alarm information: ' + (error as Error).message);
      return [];
    }
  }

  private async showAlarmMessage(alarm: CloudWatchAlarm) {
    const buttonCaption = 'Take a look';
    const result = await vscode.window.showErrorMessage(
      'Alarm triggered: ' + alarm.AlarmName,
      ...[buttonCaption, 'Dismiss']);

    if (result !== buttonCaption) {
      return;
    }

    vscode.env.openExternal(vscode.Uri.parse(`${this._alarmBaseUrl(alarm.region)}${alarm.AlarmName}`));
  }

  private async getAlarms(profile: string, region: string): Promise<Array<CloudWatchAlarm>> {
    const config: CloudWatchClientConfig = {
      region
    };
    const client = new CloudWatchClient(config);

    let NextToken = undefined;
    let alarms: Array<MetricAlarm | CompositeAlarm> = [];
    do {
      const input: DescribeAlarmsCommandInput = {
        NextToken,
      };

      const command = new DescribeAlarmsCommand(input);
      const response = await client.send(command);
      NextToken = response.NextToken;
      alarms.push(
        ...(response.CompositeAlarms || []),
        ...(response.MetricAlarms || []));
    } while (NextToken);

    return alarms.map(alarm => ({
      region,
      ...alarm
    }));
  }
}