import { CompositeAlarm, MetricAlarm } from '@aws-sdk/client-cloudwatch';

export type CloudWatchAlarm = MetricAlarm | CompositeAlarm;
