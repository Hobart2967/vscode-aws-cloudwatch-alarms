import { CompositeAlarm, MetricAlarm } from '@aws-sdk/client-cloudwatch';

export type CloudWatchAlarmBase = MetricAlarm | CompositeAlarm;
export type CloudWatchAlarm = CloudWatchAlarmBase & { region: string };

export interface CloudWatchAlarmsPerProfile {
  [profileName: string]: CloudWatchAlarmsPerRegion;
}

export interface CloudWatchAlarmsPerRegion {
  [region: string]: CloudWatchAlarm[];
}