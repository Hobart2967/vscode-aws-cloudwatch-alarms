import { StateValue } from '@aws-sdk/client-cloudwatch';
import { createSignal, JSXElement } from 'solid-js';

import { CloudWatchAlarm } from '../models/cloud-watch-alarm';
import { AlarmListWrapper } from './alarm-list-wrapper';

type AlarmsUpdate = Event & { data: { alarms: CloudWatchAlarm[] }};
export function AlarmsSidebar(props: any): JSXElement {
  vscode.postMessage({ type: 'onReady' });

  const [searchTerm, setSearchTerm] = createSignal('');
  const [alarmsOk, setAlarmsOk] = createSignal([] as CloudWatchAlarm[]);
  const [alarmsInAlarm, setAlarmsInAlarm] = createSignal([] as CloudWatchAlarm[]);
  const [alarmsMissingData, setAlarmsMissingData] = createSignal([] as CloudWatchAlarm[]);

  window.addEventListener('message', (message: AlarmsUpdate) => {
    const sorter = (a: CloudWatchAlarm, b: CloudWatchAlarm) => {
      return a.AlarmName! > b.AlarmName! ? 1 : (
        a.AlarmName! === b.AlarmName! ? 0 : -1);
    };

    const inAlarm = message.data.alarms.filter(x => x.StateValue === StateValue.ALARM);
    const ok = message.data.alarms.filter(x => x.StateValue === StateValue.OK);
    const missingData = message.data.alarms.filter(x => x.StateValue === StateValue.INSUFFICIENT_DATA);

    setAlarmsOk(ok.sort(sorter));
    setAlarmsInAlarm(inAlarm.sort(sorter));
    setAlarmsMissingData(missingData.sort(sorter));
  });
  return <div class="alarm-list-body">
    <style type="text/css">{`
      .alarm-list-body {
        font-size: 11px;
      }


    `}
    </style>

    <vscode-text-field
      style="width: calc(100% - 12px); margin: 0 6px 6px 6px"
      placeholder='Search...'
      onInput={(x: any) => setSearchTerm(x.target.value)}></vscode-text-field>

    <AlarmListWrapper
      title="In Alarm"
      stateValue={StateValue.ALARM}
      searchTerm={searchTerm()}
      alarms={alarmsInAlarm()}></AlarmListWrapper>
    <AlarmListWrapper
      title="Insufficient Data"
      stateValue={StateValue.INSUFFICIENT_DATA}
      searchTerm={searchTerm()}
      alarms={alarmsMissingData()}></AlarmListWrapper>
    <AlarmListWrapper
      title="Ok"
      stateValue={StateValue.OK}
      searchTerm={searchTerm()}
      alarms={alarmsOk()}></AlarmListWrapper>
  </div>;
}
