import { StateValue } from '@aws-sdk/client-cloudwatch';
import { createSignal, For, JSXElement } from 'solid-js';
import { render } from 'solid-js/web';

import { CloudWatchAlarm } from './models/cloud-watch-alarm';

type AlarmsUpdate = Event & { data: { alarms: CloudWatchAlarm[] }};
function AlarmsSidebar(props: any): JSXElement {
  vscode.postMessage({ type: 'onReady' });
  const alarmBaseUrl = 'https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#alarmsV2:alarm/';
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
  return <div>
    <style type="text/css">{`
      .alarm-list-wrapper {
        margin-bottom: 16px;
      }

      .alarm-list-wrapper .title {
        display: flex;

        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
        padding: 4px 8px;
      }

      .alarm-list {
        margin: 0;
        padding: 0;
      }

      .alarm-list li {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 4px 8px;
      }

      .alarm-list li a {
        color: inherit;
        text-decoration: inherit;
      }

      .alarm-list li.in-alarm {
        color: #ff0000;
        font-weight: bold;
      }

      .alarm-list li:hover {
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
      }
    `}
    </style>
    <div class="alarm-list-wrapper">
      <div class="title">In Alarm</div>
      <div class="content">
        <For each={alarmsInAlarm()}>
          {alarm => <ul class='alarm-list'>
            <li class="in-alarm">
              <a href={alarmBaseUrl + alarm.AlarmName}>
                {alarm.AlarmName}
              </a>
            </li>
          </ul>}
        </For>
      </div>
    </div>

    <div class="alarm-list-wrapper">
      <div class="title">Insufficient Data</div>
      <div class="content">
        <For each={alarmsMissingData()}>
        {alarm => <ul class='alarm-list'>
            <li class="missing-data">
              <a href={alarmBaseUrl + alarm.AlarmName}>
                {alarm.AlarmName}
              </a>
            </li>
          </ul>}
        </For>
      </div>
    </div>
    <div class="alarm-list-wrapper">
      <div class="title">Ok</div>
      <div class="content">
        <For each={alarmsOk()}>
          {alarm => <ul class='alarm-list'>
            <li class="ok">
              <a href={alarmBaseUrl + alarm.AlarmName}>
                {alarm.AlarmName}
              </a>
            </li>
          </ul>}
        </For>
      </div>
    </div>
  </div>;
}

render(() => <AlarmsSidebar />, document.getElementById('alarms-content')!);