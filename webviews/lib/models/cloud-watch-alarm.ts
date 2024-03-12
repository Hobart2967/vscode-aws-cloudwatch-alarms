import { CompositeAlarm, MetricAlarm } from '@aws-sdk/client-cloudwatch';

export type CloudWatchAlarmBase = MetricAlarm | CompositeAlarm;
export type CloudWatchAlarm = CloudWatchAlarmBase & { region: string };
