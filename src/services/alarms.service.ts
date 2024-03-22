import {
  CloudWatchClient,
  CloudWatchClientConfig,
  CompositeAlarm,
  DescribeAlarmsCommand,
  DescribeAlarmsCommandInput,
  MetricAlarm,
  StateValue,
} from '@aws-sdk/client-cloudwatch';
import { fromIni } from '@aws-sdk/credential-providers';
import { inject, injectable } from 'inversify';
import { combineLatest, interval, map, Observable, pairwise, ReplaySubject, startWith, Subscription, switchMap } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import * as vscode from 'vscode';

import { AWSService } from './aws.service';
import { CloudWatchAlarm, CloudWatchAlarmsPerProfile, CloudWatchAlarmsPerRegion } from './cloud-watch-alarm';

@injectable()
export class AlarmsService {
  public requestRefresh(): void {
    this._manualTrigger.next(Date.now());
  }

  private readonly _alarmBaseUrl = (region: string) => `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#alarmsV2:alarm/`;
  private readonly _intervalPeriod = 10000;
  private readonly _manualTrigger = new ReplaySubject<number>();
  private _refreshTrigger: Observable<any>|null = null;
  private _alarms!: Observable<CloudWatchAlarmsPerProfile>;
  private _freshAlerts!: Observable<CloudWatchAlarm[]>;
  private _subscription: Subscription|null = null;
  private _lastRetrievalError: string|null = null;

  public get alarms() : Observable<CloudWatchAlarmsPerProfile> {
    return this._alarms;
  }

  public constructor(@inject(AWSService) private readonly _awsService: AWSService) { }

  public shutdown() {
    if (!this._subscription) {
      return;
    }

    this._subscription.unsubscribe();
    this._subscription = null;
  }

  public initialize() {
    this._subscription = new Subscription();

    this._refreshTrigger = combineLatest([
      interval(this._intervalPeriod),
      this._manualTrigger
    ]);
    this._alarms = this._refreshTrigger!
      .pipe(startWith(0))
      .pipe(map(() => vscode.workspace.getConfiguration('hobart2967.aws-cloudwatch-alarms').get("regions")! as string[]))
      .pipe(switchMap(regions => this.getAlarmsForProfilesAndRegions(regions)))
      .pipe(share());

    const flatAlerts = this._alarms
      .pipe(map(alarmsPerProfile => this.flattenAlarms(alarmsPerProfile)));

    this._freshAlerts = flatAlerts
      .pipe(
        startWith([]),
        pairwise())
      .pipe(
        map(([previousList, currentList]) => {
          const currentAlarms = (currentList || []).filter(currentState =>
            currentState.StateValue === StateValue.ALARM);
          const unknownAlarms = currentAlarms.filter(currentState =>
            !previousList
              .map(previousState => previousState.AlarmArn)
              .includes(currentState.AlarmArn));
          const changedAlarms = currentAlarms.filter(currentState =>
            previousList.some(previousState =>
                 previousState.AlarmArn === currentState.AlarmArn
              && currentState.StateUpdatedTimestamp!.getTime() !== previousState.StateUpdatedTimestamp!.getTime()));

          const result = currentAlarms.filter(current =>
            unknownAlarms.map(x => x.AlarmArn).includes(current.AlarmArn) ||
            changedAlarms.map(x => x.AlarmArn).includes(current.AlarmArn));

          return result;
        }));

    const freshAlertsWhenActive = this._freshAlerts
      .pipe(filter(alarms => alarms.length > 0));

    this._subscription.add(
      freshAlertsWhenActive.subscribe(alarms => {
        for (const alarm of alarms) {
          this.showAlarmMessage(alarm);
        }
      }));
  }

  public flattenAlarms(alarmsPerProfile: CloudWatchAlarmsPerProfile): CloudWatchAlarm[] {
    return Object
      .entries(alarmsPerProfile)
      .reduce((prev, [_, alarmsInProfile]) => [
        ...prev,
        ...Object
          .entries(alarmsInProfile)
          .reduce((prev, [_, alarmsInRegion]) => [
            ...prev,
            ...alarmsInRegion
          ], [] as CloudWatchAlarm[])
      ], [] as CloudWatchAlarm[]);
  }

  private async getAlarmsForProfilesAndRegions(regions: string[]): Promise<CloudWatchAlarmsPerProfile> {
    try {
      const alarms: CloudWatchAlarmsPerProfile = (await Promise
        .all(this._awsService
          .getSelectedProfiles()
          .map(async (profile) => ({
            [profile]: (await Promise.all(
              regions.map(async (region) => ({
                [region]: await this.getAlarms(profile, region)
              }))))
              .reduce((prev, cur) => ({ ...prev, ...cur }), {} as CloudWatchAlarmsPerRegion)
          }))))
        .reduce((prev, cur) => ({ ...prev, ...cur }), {} as CloudWatchAlarmsPerProfile);

      return alarms;
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (this._lastRetrievalError !== errorMessage) {
        this._lastRetrievalError = errorMessage;
        vscode.window.showErrorMessage('Could not retrieve alarm information: ' + errorMessage);
      }
      return {};
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

    if (vscode.workspace
        .getConfiguration('hobart2967.aws-cloudwatch-alarms')
        .get("credentials-source")! as string === 'profile') {
      config.credentials = fromIni({ profile });
    }

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