import { StateValue } from '@aws-sdk/client-cloudwatch';
import { Dynamic } from 'solid-js/web';

import Ok from '../assets/ok.svg';
import Report from '../assets/report.svg';
import Warning from '../assets/warning.svg';
import { CloudWatchAlarm } from '../models/cloud-watch-alarm';

export interface AlarmProps {
  alarm: CloudWatchAlarm;
}

export function Alarm(props: AlarmProps) {
  const alarmBaseUrl = (region: string) => `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#alarmsV2:alarm/`;
  const stateClass = () => props.alarm.StateValue === StateValue.ALARM
    ? 'in-alarm'
    : (props.alarm.StateValue === StateValue.INSUFFICIENT_DATA
        ? 'insufficient-data'
        : 'ok');

  const stateIcon = (stateValue: StateValue) => {
    if (stateValue === StateValue.ALARM) {
      return () => <Report class="state-icon" style='fill: var(--vscode-errorForeground);'/>;
    }

    if (stateValue === StateValue.INSUFFICIENT_DATA) {
      return () => <Warning class="state-icon" style='fill: var(--vscode-terminal-ansiYellow);'/>;
    }

    if (stateValue === StateValue.OK) {
      return () => <Ok class="state-icon" style='fill: var(--vscode-terminal-ansiGreen);'/>;
    }

    return () => <></>;
  };

  return (<>
    <li class={stateClass()}>
      <Dynamic component={stateIcon(props.alarm.StateValue!)} />
      <a href={alarmBaseUrl(props.alarm.region) + props.alarm.AlarmName}>
        [{props.alarm.region}] - {props.alarm.AlarmName}
      </a>
    </li>
    <style type="text/css">{`
      .alarm-list li .state-icon {
        min-height: 13px;
        min-width: 13px;
        height: 13px;
        width: 13px;
      }
      .alarm-list li {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 4px 8px;
        gap: 8px;
        vertical-align: middle;
        line-height: 16px;
      }

      .alarm-list li a {
        font-size: 13px;
        color: inherit;
        text-decoration: inherit;
        outline: none;
      }

      .alarm-list li.in-alarm {
        color: var(--vscode-errorForeground);
      }

      .alarm-list li:hover {
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
      }
    `}
    </style>
  </>);
}